/** Date/status formatting helpers. */

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function formatMessageDate(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const time = formatTime(iso);
  if (date.toDateString() === today.toDateString()) return time;
  if (date.toDateString() === yesterday.toDateString()) return `вчера, ${time}`;
  return `${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}, ${time}`;
}

/** Groups an ISO timestamp into a compact label for the chat list. */
export function formatListDate(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return formatTime(iso);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

/** Returns 'online' | 'recent' | 'offline' based on online flag + lastSeen. */
export function resolveStatus(online: boolean, lastSeen: string | null): 'online' | 'recent' | 'offline' {
  if (online) return 'online';
  if (!lastSeen) return 'offline';
  const seen = new Date(lastSeen).getTime();
  if (Number.isNaN(seen)) return 'offline';
  const threshold = Date.now() - 5 * 60 * 1000; // 5 minutes
  return seen >= threshold ? 'recent' : 'offline';
}

export function statusLabel(
  status: 'online' | 'recent' | 'offline',
  lastSeen: string | null,
): string {
  switch (status) {
    case 'online':
      return 'в сети';
    case 'recent':
      return 'был недавно';
    default:
      return formatLastSeen(lastSeen) ?? 'не в сети';
  }
}

export function formatLastSeen(lastSeen: string | null): string | null {
  if (!lastSeen) return null;
  const date = new Date(lastSeen);
  if (Number.isNaN(date.getTime())) return null;
  return `был(а) ${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
}

export function getInitial(username: string): string {
  return (username.trim().charAt(0) || '?').toUpperCase();
}