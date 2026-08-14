import { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';
import { Avatar } from '../common/Avatar';
import { Spinner } from '../common/Spinner';
import { searchUsers } from '../../services/users';
import { toErrorMessage } from '../../services/api';
import { formatLastSeen, resolveStatus, statusLabel } from '../../utils/format';
import type { User } from '../../types';

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
  onStartChat: (userId: number) => Promise<void>;
}

export function NewChatModal({ open, onClose, onStartChat }: NewChatModalProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<number | null>(null);

  // Debounced search while the modal is open.
  useEffect(() => {
    if (!open) return;
    if (!query.trim()) {
      setUsers([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const timer = window.setTimeout(() => {
      searchUsers(query)
        .then((result) => {
          if (!cancelled) setUsers(result);
        })
        .catch((err) => {
          if (!cancelled) setError(toErrorMessage(err, 'Не удалось найти пользователей'));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, open]);

  const handleStart = async (userId: number) => {
    setStartingId(userId);
    try {
      await onStartChat(userId);
      onClose();
    } catch {
      // toast handled by parent
    } finally {
      setStartingId(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Новый чат">
      <SearchInput value={query} onChange={setQuery} placeholder="Найдите пользователя…" autoFocus />

      <div className="mt-4 max-h-72 space-y-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-6">
            <Spinner size={22} />
          </div>
        )}
        {error && <p className="py-3 text-center text-sm text-red-400">{error}</p>}
        {!loading && query.trim() && users.length === 0 && !error && (
          <p className="py-6 text-center text-sm text-slate-500">Пользователи не найдены</p>
        )}
        {!query.trim() && !loading && (
          <p className="py-6 text-center text-sm text-slate-500">Введите имя пользователя для поиска</p>
        )}
        {users.map((user) => {
          const status = resolveStatus(!!user.online, user.lastSeen);
          return (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-800"
            >
              <Avatar name={user.username} avatar={user.avatar} showStatus online={status === 'online'} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-100">{user.username}</p>
                <p className="truncate text-xs text-slate-500">{statusLabel(status, user.lastSeen) || formatLastSeen(user.lastSeen)}</p>
              </div>
              <button
                onClick={() => void handleStart(user.id)}
                disabled={startingId === user.id}
                className="btn-primary !px-3 !py-1.5 text-xs"
              >
                {startingId === user.id ? '…' : 'Написать'}
              </button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}