import { useRef, type ChangeEvent, type FormEvent } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/** Icon + clearable search input. Submits the raw value upward (not debounced here). */
export function SearchInput({ value, onChange, placeholder = 'Поиск…', autoFocus = false }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void inputRef.current?.blur();
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        autoFocus={autoFocus}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-surface-600 bg-surface-900 py-2 pl-9 pr-9 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      {value && (
        <button
          type="button"
          aria-label="Очистить"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </form>
  );
}