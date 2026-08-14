import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { SearchInput } from '../common/SearchInput';
import { ChatList } from '../Chat/ChatList';
import { UserMenu } from './UserMenu';
import type { ChatSummary } from '../../types';

interface SidebarProps {
  chats: ChatSummary[];
  chatsLoading: boolean;
  selectedId: number | null;
  currentUserId: number;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectChat: (id: number) => void;
  onOpenNewChat: () => void;
}

/** Left panel: brand, search, conversation list, new-chat + user actions. */
export function Sidebar({
  chats,
  chatsLoading,
  selectedId,
  currentUserId,
  search,
  onSearchChange,
  onSelectChat,
  onOpenNewChat,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-surface-700 bg-surface-900 lg:w-80">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <Link to="/" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        <button
          onClick={onOpenNewChat}
          aria-label="Новый чат"
          className="btn-primary !px-2.5 !py-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="px-4 pb-2">
        <SearchInput value={search} onChange={onSearchChange} placeholder="Поиск чатов…" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <ChatList
          chats={chats}
          loading={chatsLoading}
          selectedId={selectedId}
          currentUserId={currentUserId}
          search={search}
          onSelect={onSelectChat}
        />
      </div>

      <div className="flex items-center justify-between border-t border-surface-700 px-3 py-2">
        <UserMenu />
        <span className="hidden text-xs text-slate-600 lg:block">Nexus v1.0</span>
      </div>
    </aside>
  );
}