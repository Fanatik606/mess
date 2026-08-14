import { useState, type FormEvent, type KeyboardEvent } from 'react';

interface MessageInputProps {
  /** Return true if the message was sent successfully (so the field clears). */
  onSend: (content: string) => Promise<boolean>;
  disabled?: boolean;
}

/** Multiline input with a send button. Enter sends, Shift+Enter makes a new line. */
export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  const canSend = value.trim().length > 0 && !disabled && !sending;

  const submit = async () => {
    const content = value;
    if (!content.trim()) return;
    setSending(true);
    try {
      const ok = await onSend(content);
      if (ok) setValue('');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-surface-700 bg-surface-900 p-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={disabled}
        placeholder={disabled ? 'Выберите чат…' : 'Напишите сообщение…'}
        className="input max-h-32 min-h-[44px] resize-none py-2.5 disabled:opacity-50"
        style={{ height: 'auto' }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = 'auto';
          el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
        }}
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Отправить"
        className="btn-primary !px-3.5 !py-2.5 shrink-0"
      >
        {sending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.5l18-5-5 18-3-6-4-4-6-3z" />
          </svg>
        )}
      </button>
    </form>
  );
}