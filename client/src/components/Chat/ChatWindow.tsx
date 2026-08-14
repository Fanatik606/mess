import { useLayoutEffect, useRef, useState } from 'react';
import { Avatar } from '../common/Avatar';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { MessagesSkeleton } from '../common/Skeleton';
import { formatMessageDate, resolveStatus, statusLabel } from '../../utils/format';
import type { ChatSummary, Message } from '../../types';

interface ChatWindowProps {
  chat: ChatSummary;
  currentUserId: number;
  messages: Message[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onSend: (content: string) => Promise<boolean>;
  onLoadMore: () => void;
  onBack: () => void;
}

export function ChatWindow({
  chat,
  currentUserId,
  messages,
  loading,
  loadingMore,
  hasMore,
  onSend,
  onLoadMore,
  onBack,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinnedBottom, setPinnedBottom] = useState(true);
  const scrollPosRef = useRef<{ top: number; height: number } | null>(null);

  // Scroll to bottom when the newest message changes (initial load or new mail).
  const lastId = messages[messages.length - 1]?.id;
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (pinnedBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lastId, loading, pinnedBottom]);

  // Preserve scroll position when older messages are prepended.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (scrollPosRef.current && !loadingMore) {
      el.scrollTop = el.scrollTop + (el.scrollHeight - scrollPosRef.current.height);
      scrollPosRef.current = null;
    }
  }, [messages, loadingMore]);

  // Track whether the user is pinned near the bottom.
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setPinnedBottom(distance < 80);
  };

  const loadOlder = () => {
    const el = scrollRef.current;
    scrollPosRef.current = el ? { top: el.scrollTop, height: el.scrollHeight } : null;
    onLoadMore();
  };

  const status = resolveStatus(chat.otherUser.online, chat.otherUser.lastSeen);

  let lastDateKey = '';

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-surface-700 bg-surface-900 px-4 py-3">
        <button onClick={onBack} aria-label="Назад" className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-700 hover:text-white lg:hidden">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <Avatar name={chat.otherUser.username} avatar={chat.otherUser.avatar} showStatus online={status === 'online'} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-white">{chat.otherUser.username}</h2>
          <p className={`text-xs ${status === 'online' ? 'text-emerald-400' : 'text-slate-500'}`}>
            {statusLabel(status, chat.otherUser.lastSeen)}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 space-y-1.5 overflow-y-auto bg-surface-950 px-4 py-4">
        {loading ? (
          <MessagesSkeleton />
        ) : (
          <>
            {hasMore && (
              <div className="flex justify-center py-1">
                <button
                  onClick={loadOlder}
                  disabled={loadingMore}
                  className="rounded-full border border-surface-600 px-4 py-1.5 text-xs text-slate-300 transition-colors hover:bg-surface-700"
                >
                  {loadingMore ? 'Загрузка…' : 'Загрузить ранее'}
                </button>
              </div>
            )}
            {messages.length === 0 && !hasMore && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <div className="text-4xl">💬</div>
                <p className="text-sm text-slate-300">Начните диалог с {chat.otherUser.username}</p>
                <p className="text-xs text-slate-500">Сообщения будут видны в реальном времени</p>
              </div>
            )}
            {messages.map((message) => {
              const dateKey = message.createdAt.slice(0, 10);
              const showHeader = dateKey !== lastDateKey;
              if (showHeader) lastDateKey = dateKey;
              const isMine = message.senderId === currentUserId;
              return (
                <div key={message.id} className="space-y-1.5">
                  {showHeader && (
                    <div className="flex justify-center py-2">
                      <span className="rounded-full bg-surface-800 px-3 py-1 text-[11px] text-slate-400">
                        {formatMessageDate(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    isMine={isMine}
                    senderName={chat.otherUser.username}
                    senderAvatar={chat.otherUser.avatar}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>

      <MessageInput onSend={onSend} disabled={loading} />
    </div>
  );
}
