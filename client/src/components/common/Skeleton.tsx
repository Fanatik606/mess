/** Lightweight shimmer-based skeleton blocks used while data is loading. */

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-md bg-gradient-to-r from-surface-700 via-surface-600 to-surface-700 bg-[length:200%_100%] ${className}`}
    />
  );
}

export function ChatListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl p-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessagesSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: 7 }).map((_, i) => {
        const mine = i % 2 === 0;
        return (
          <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
            <Skeleton className={`h-10 rounded-2xl ${mine ? 'w-40' : 'w-52'}`} />
          </div>
        );
      })}
    </div>
  );
}