import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';

/** Dropdown showing the current user + navigation (profile, logout). */
export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-surface-800"
      >
        <Avatar name={user.username} avatar={user.avatar} size="sm" />
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-200 lg:block">
          {user.username}
        </span>
        <svg
          className={`hidden h-4 w-4 text-slate-500 transition-transform lg:block ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-56 overflow-hidden rounded-xl border border-surface-600 bg-surface-900 shadow-xl shadow-black/50 animate-fade-in">
          <div className="border-b border-surface-700 px-4 py-3">
            <p className="truncate text-sm font-semibold text-white">{user.username}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <nav className="p-1.5">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-surface-700"
            >
              <span aria-hidden>👤</span> Профиль
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
            >
              <span aria-hidden>⏻</span> Выйти
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}