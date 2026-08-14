import { Avatar } from '../common/Avatar';
import { formatTime } from '../../utils/format';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  senderName?: string;
  senderAvatar?: string | null;
  showHeader?: boolean;
}

/** A single message bubble. Mine align right (accent), theirs align left. */
export function MessageBubble({ message, isMine, senderName, senderAvatar, showHeader = false }: MessageBubbleProps) {
  return (
    <div className={`flex w-full gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
      {!isMine && showHeader && senderName && (
        <div className="mt-auto">
          <Avatar name={senderName} avatar={senderAvatar} size="sm" />
        </div>
      )}
      <div className={`flex max-w-[75%] flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        {!isMine && showHeader && (
          <span className="mb-1 ml-1 text-xs font-medium text-slate-400">{senderName}</span>
        )}
        <div
          className={`relative rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
            isMine
              ? 'rounded-br-md bg-accent text-white'
              : 'rounded-bl-md bg-surface-800 text-slate-100'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          <span
            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
              isMine ? 'text-white/70' : 'text-slate-500'
            }`}
          >
            <time>{formatTime(message.createdAt)}</time>
            {isMine && (
              <span aria-label={message.isRead ? 'Прочитано' : 'Отправлено'}>
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l5 5L20 7" />
                </svg>
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}