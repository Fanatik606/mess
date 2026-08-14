import { ChatListItem } from './ChatListItem';
import { ChatListSkeleton } from '../common/Skeleton';
import type { ChatSummary } from '../../types';

interface ChatListProps {
  chats: ChatSummary[];
  loading: boolean;
  selectedId: number | null;
  currentUserId: number;
  search: string;
  onSelect: (id: number) => void;
}

/** Filtered list of conversations. */
export function ChatList({ chats, loading, selectedId, currentUserId, search, onSelect }: ChatListProps) {
  if (loading) return <ChatListSkeleton />;

  const query = search.trim().toLowerCase();
  const filtered = query
    ? chats.filter((c) => c.otherUser.username.toLowerCase().includes(query))
    : chats;

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
        <p className="text-sm font-medium text-slate-300">
          {query ? 'Ничего не найдено' : 'Пока нет чатов'}
        </p>
        <p className="text-xs text-slate-500">
          {query ? 'Попробуйте другой запрос' : 'Нажмите «+», чтобы начать диалог'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-2 py-2">
      {filtered.map((chat) => (
        <ChatListItem
          key={chat.conversationId}
          chat={chat}
          active={chat.conversationId === selectedId}
          currentUserId={currentUserId}
          onClick={() => onSelect(chat.conversationId)}
        />
      ))}
    </div>
  );
}