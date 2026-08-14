interface LogoProps {
  size?: 'sm' | 'md';
}

/** Brand logo + wordmark used in the sidebar and auth screens. */
export function Logo({ size = 'md' }: LogoProps) {
  const box = size === 'md' ? 'h-10 w-10 rounded-xl text-lg' : 'h-8 w-8 rounded-lg text-sm';
  const text = size === 'md' ? 'text-lg' : 'text-base';
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex ${box} items-center justify-center bg-gradient-to-br from-accent to-violet-600 font-bold text-white shadow-lg shadow-accent/30`}
      >
        N
      </div>
      <span className={`${text} font-bold tracking-tight text-white`}>
        Nexus<span className="text-accent">.</span>
      </span>
    </div>
  );
}