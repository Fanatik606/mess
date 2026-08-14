/** Friendly empty-state screen shown when no chat is selected. */
export function WelcomeScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 bg-surface-950 px-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-violet-600 text-5xl shadow-2xl shadow-accent/30 animate-fade-in">
        💬
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Добро пожаловать в Nexus</h1>
        <p className="max-w-sm text-sm text-slate-400">
          Выберите чат слева или нажмите «+», чтобы начать новый диалог. Сообщения
          доставляются мгновенно и сохраняются в базе данных.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
        <span className="rounded-full border border-surface-600 px-3 py-1">⚡ Реальное время</span>
        <span className="rounded-full border border-surface-600 px-3 py-1">🔒 Безопасность</span>
        <span className="rounded-full border border-surface-600 px-3 py-1">💾 История</span>
      </div>
    </div>
  );
}