import { getInitial } from '../../utils/format';

interface AvatarProps {
  name: string;
  avatar?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  showStatus?: boolean;
}

const SIZES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-24 w-24 text-3xl',
};

const COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-cyan-500',
];

function colorFor(seed: string): string {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return COLORS[sum % COLORS.length];
}

/**
 * Circle avatar. If a custom avatar (single character) is set it is shown,
 * otherwise falls back to the first letter of the username.
 */
export function Avatar({ name, avatar, size = 'md', online, showStatus = false }: AvatarProps) {
  const letter = (avatar && avatar.trim().length === 1 ? avatar.trim() : getInitial(name)).toUpperCase();
  const statusDot = showStatus ? (
    <span
      className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-surface-900 ${
        online ? 'bg-online' : 'bg-slate-500'
      }`}
    />
  ) : null;

  return (
    <div className={`relative inline-flex shrink-0`}>
      <div
        className={`${SIZES[size]} ${colorFor(name)} flex items-center justify-center rounded-full font-semibold text-white select-none`}
      >
        {letter}
      </div>
      {statusDot}
    </div>
  );
}