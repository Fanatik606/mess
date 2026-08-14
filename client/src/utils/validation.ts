/** Lightweight client-side validation with human-readable Russian messages. */

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateRegister(payload: {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}): ValidationResult {
  const email = payload.email.trim();
  const username = payload.username.trim();
  const requiredField = (value: string, msg: string): string | null =>
    value.length === 0 ? msg : null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]+$/;

  const checks: Array<[string, string | null]> = [
    ['passwordConfirm', requiredField(payload.passwordConfirm, 'Подтвердите пароль')],
    ['username', requiredField(username, 'Введите имя пользователя')],
    ['email', requiredField(email, 'Введите email')],
    ['password', requiredField(payload.password, 'Введите пароль')],
  ];

  const errors: Record<string, string> = {};
  for (const [key, error] of checks) {
    if (error) errors[key] = error;
  }

  if (!errors.username && username.length < 3) errors.username = 'Минимум 3 символа';
  if (!errors.username && !usernameRegex.test(username)) {
    errors.username = 'Только буквы, цифры и подчёркивание';
  }

  if (!errors.email && !emailRegex.test(email)) errors.email = 'Некорректный email';

  if (!errors.password && payload.password.length < 6) {
    errors.password = 'Минимум 6 символов';
  }

  if (
    !errors.password &&
    payload.password !== payload.passwordConfirm &&
    !errors.passwordConfirm
  ) {
    errors.passwordConfirm = 'Пароли не совпадают';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLogin(payload: { email: string; password: string }): ValidationResult {
  const email = payload.email.trim();
  const password = payload.password;
  const errors: Record<string, string> = {};

  if (email.length === 0) errors.email = 'Введите email';
  if (password.length === 0) errors.password = 'Введите пароль';

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateMessage(content: string): ValidationResult {
  if (content.trim().length === 0) {
    return { valid: false, errors: { content: 'Сообщение не может быть пустым' } };
  }
  return { valid: true, errors: {} };
}

export function validateUsername(username: string): string | null {
  const value = username.trim();
  if (value.length < 3) return 'Минимум 3 символа';
  if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Только буквы, цифры и подчёркивание';
  return null;
}