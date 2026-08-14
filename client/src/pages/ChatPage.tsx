import { useCallback, useEffect, useRef, useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatWindow } from '../components/Chat/ChatWindow';
import { NewChatModal } from '../components/Chat/NewChatModal';
import { WelcomeScreen } from '../components/Chat/WelcomeScreen';
import { useAuth } from '../hooks/useAuth';
import { useSocket, type SocketMessageEvent, type SocketReadEvent, type SocketStatusEvent } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';
import { fetchChats, fetchMessages, openChatWith, sendMessageRequest } from '../services/chats';
import { toErrorMessage } from '../services/api';
import { MESSAGE_PAGE_SIZE } from '../utils/constants';
import type { ChatSummary, Message } from '../types';

export function ChatPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useToast();

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);

  // Refs to read freshest values inside socket callbacks.
  const selectedIdRef = useRef(selectedId);
  const chatsRef = useRef(chats);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  // Initial load of the conversation list.
  useEffect(() => {
    let cancelled = false;
    setChatsLoading(true);
    fetchChats()
      .then((result) => {
        if (!cancelled) setChats(result);
      })
      .catch((err) => showToast(toErrorMessage(err, 'Не удалось загрузить чаты'), 'error'))
      .finally(() => {
        if (!cancelled) setChatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const loadChats = useCallback(() => {
    fetchChats()
      .then(setChats)
      .catch((err) => showToast(toErrorMessage(err, 'Не удалось обновить чаты'), 'error'));
  }, [showToast]);

  // Load messages when a chat is selected.
  useEffect(() => {
    if (selectedId == null) return;
    let cancelled = false;
    setMessagesLoading(true);
    setMessages([]);
    setHasMore(false);
    fetchMessages(selectedId, { limit: MESSAGE_PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setMessages(result);
        setHasMore(result.length >= MESSAGE_PAGE_SIZE);
        // Newly read -> our unread badge for this chat is zeroed locally.
        setChats((prev) =>
          prev.map((c) => (c.conversationId === selectedId ? { ...c, unreadCount: 0 } : c)),
        );
      })
      .catch((err) => showToast(toErrorMessage(err, 'Не удалось загрузить сообщения'), 'error'))
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, showToast]);
// Attach real-time listeners for the lifetime of the socket.
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (payload: SocketMessageEvent) => {
      const { chatId, message } = payload;
      const exists = chatsRef.current.some((c) => c.conversationId === chatId);

      if (!exists) {
        // New conversation created elsewhere -> refresh the list.
        loadChats();
        return;
      }

      setChats((prev) => {
        const target = prev.find((c) => c.conversationId === chatId);
        if (!target) return prev;
        const updating = {
          ...target,
          lastMessage: {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            createdAt: message.createdAt,
          },
          unreadCount: selectedIdRef.current === chatId ? 0 : target.unreadCount + 1,
        };
        return [updating, ...prev.filter((c) => c.conversationId !== chatId)];
      });

      if (selectedIdRef.current === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const onStatus = (payload: SocketStatusEvent) => {
      setChats((prev) =>
        prev.map((c) =>
          c.otherUser.id === payload.userId
            ? {
                ...c,
                otherUser: {
                  ...c.otherUser,
                  online: payload.status === 'online',
                  lastSeen: payload.lastSeen ?? c.otherUser.lastSeen,
                },
              }
            : c,
        ),
      );
    };

    const onRead = (payload: SocketReadEvent) => {
      if (selectedIdRef.current === payload.conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId === payload.readerId ? m : { ...m, isRead: true })),
        );
      }
    };

    socket.on('message:new', onNewMessage);
    socket.on('user:status', onStatus);
    socket.on('message:read', onRead);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('user:status', onStatus);
      socket.off('message:read', onRead);
    };
  }, [socket, loadChats]);
const handleSelectChat = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  const handleSend = useCallback(
    async (content: string): Promise<boolean> => {
      const id = selectedIdRef.current;
      if (id == null) return false;
      try {
        const message = await sendMessageRequest(id, content);
        setMessages((prev) => [...prev, message]);
        setChats((prev) => {
          const target = prev.find((c) => c.conversationId === id);
          if (!target) return prev;
          const updating = {
            ...target,
            lastMessage: {
              id: message.id,
              content: message.content,
              senderId: message.senderId,
              createdAt: message.createdAt,
            },
            unreadCount: 0,
          };
          return [updating, ...prev.filter((c) => c.conversationId !== id)];
        });
        return true;
      } catch (err) {
        showToast(toErrorMessage(err, 'Не удалось отправить сообщение'), 'error');
        return false;
      }
    },
    [showToast],
  );

  const handleLoadMore = useCallback(() => {
    const id = selectedIdRef.current;
    if (id == null || loadingMore) return;
    setLoadingMore(true);
    const oldest = messages[0];
    fetchMessages(id, { before: oldest?.id })
      .then((older) => {
        setMessages((prev) => [...older, ...prev]);
        setHasMore(older.length >= MESSAGE_PAGE_SIZE);
      })
      .catch((err) => showToast(toErrorMessage(err, 'Не удалось загрузить историю'), 'error'))
      .finally(() => setLoadingMore(false));
  }, [loadingMore, messages, showToast]);

  const handleStartChat = useCallback(
    async (otherUserId: number) => {
      try {
        const { conversationId } = await openChatWith(otherUserId);
        setSelectedId(conversationId);
        loadChats(); // include the new conversation in the list
      } catch (err) {
        showToast(toErrorMessage(err, 'Не удалось открыть чат'), 'error');
      }
    },
    [loadChats, showToast],
  );

  const selectedChat = chats.find((c) => c.conversationId === selectedId) ?? null;

  if (!user) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-950">
      {/* Left sidebar */}
      <div className={`${selectedId ? 'hidden lg:flex' : 'flex'} w-full lg:w-80`}>
        <Sidebar
          chats={chats}
          chatsLoading={chatsLoading}
          selectedId={selectedId}
          currentUserId={user.id}
          search={search}
          onSearchChange={setSearch}
          onSelectChat={handleSelectChat}
          onOpenNewChat={() => setNewChatOpen(true)}
        />
      </div>

      {/* Right area */}
      <main className={`${selectedId ? 'flex' : 'hidden lg:flex'} min-w-0 flex-1 flex-col`}>
        {selectedId && selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            currentUserId={user.id}
            messages={messages}
            loading={messagesLoading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onSend={handleSend}
            onLoadMore={handleLoadMore}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <WelcomeScreen />
        )}
      </main>

      <NewChatModal
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onStartChat={handleStartChat}
      />
    </div>
  );
}