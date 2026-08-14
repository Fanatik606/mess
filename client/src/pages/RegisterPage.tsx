import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { FieldError, FormError } from '../components/common/FormError';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { validateRegister } from '../utils/validation';
import { toErrorMessage } from '../services/api';
import { Spinner } from '../components/common/Spinner';

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = validateRegister({ username, email, password, passwordConfirm });
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setFormError(null);
    setSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      showToast('Аккаунт создан! Добро пожаловать 🎉', 'success');
      navigate('/');
    } catch (err) {
      setFormError(toErrorMessage(err, 'Не удалось зарегистрироваться'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="card p-6">
          <h1 className="mb-1 text-xl font-bold text-white">Регистрация</h1>
          <p className="mb-5 text-sm text-slate-400">Создайте аккаунт за минуту</p>

          <FormError message={formError} />

          <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="label">Имя пользователя</label>
              <input
                id="username"
                type="text"
                className="input"
                placeholder="например, alex"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <FieldError message={errors.username} />
            </div>

            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <FieldError message={errors.email} />
            </div>

            <div>
              <label htmlFor="password" className="label">Пароль</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <FieldError message={errors.password} />
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="label">Подтверждение пароля</label>
              <input
                id="passwordConfirm"
                type="password"
                className="input"
                placeholder="Повторите пароль"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
              />
              <FieldError message={errors.passwordConfirm} />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <Spinner size={18} className="!text-white" /> : 'Создать аккаунт'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-400">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
