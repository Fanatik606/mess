import { Avatar } from '../common/Avatar';
import { formatListDate, resolveStatus } from '../../utils/format';
import type { ChatSummary } from '../../types';

interface ChatListItemProps {
  chat: ChatSummary;
  active: boolean;
  currentUserId: number;
  onClick: () => void;
}

export function ChatListItem({ chat, active, currentUserId, onClick }: ChatListItemProps) {
  const { otherUser, lastMessage, unreadCount } = chat;
  const status = resolveStatus(otherUser.online, otherUser.lastSeen);

  const preview = lastMessage
    ? `${lastMessage.senderId === currentUserId ? 'Вы: ' : ''}${lastMessage.content}`
    : 'Нет сообщений';

  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ${
        active ? 'bg-surface-700' : 'hover:bg-surface-850'
      }`}
    >
      <Avatar name={otherUser.username} avatar={otherUser.avatar} size="md" showStatus online={status === 'online'} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-slate-100">{otherUser.username}</span>
          {lastMessage && (
            <span className="shrink-0 text-[11px] text-slate-500">{formatListDate(lastMessage.createdAt)}</span>
          )}
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className={`truncate text-xs ${unreadCount > 0 ? 'font-medium text-slate-300' : 'text-slate-500'}`}>
            {preview}
          </span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}