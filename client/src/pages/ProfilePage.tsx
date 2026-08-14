import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/common/Avatar';
import { FieldError, FormError } from '../components/common/FormError';
import { Spinner } from '../components/common/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { validateUsername } from '../utils/validation';
import { toErrorMessage } from '../services/api';
import { updateProfile } from '../services/auth';

const AVATAR_CHOICES = ['A', 'M', 'D', 'O', 'K', 'S', 'V', 'N'];

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username ?? '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const usernameError = validateUsername(username);
    if (usernameError) {
      setErrors({ username: usernameError });
      return;
    }
    setErrors({});
    setFormError(null);
    setSaving(true);
    try {
      const updated = await updateProfile({
        username: username.trim(),
        avatar: avatar ?? undefined,
      });
      setUser(updated);
      showToast('Профиль обновлён', 'success');
    } catch (err) {
      setFormError(toErrorMessage(err, 'Не удалось обновить профиль'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost !px-2 text-sm"
        >
          ← Назад
        </button>

        <div className="card p-6">
          <div className="mb-5 flex items-center gap-4">
            <Avatar name={username || user.username} avatar={avatar} size="xl" />
            <div>
              <h1 className="text-lg font-bold text-white">Профиль</h1>
              <p className="text-sm text-slate-400">Управление аккаунтом</p>
            </div>
          </div>

          <FormError message={formError} />

          <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="label">Имя пользователя</label>
              <input
                id="username"
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <FieldError message={errors.username} />
            </div>

            <div>
              <span className="label">Email</span>
              <input type="email" className="input opacity-60" value={user.email} readOnly disabled />
              <p className="mt-1 text-xs text-slate-500">Email изменить нельзя</p>
            </div>

            <div>
              <span className="label">Аватар</span>
              <div className="flex flex-wrap gap-2">
                {AVATAR_CHOICES.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setAvatar(letter)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                      avatar === letter
                        ? 'bg-accent text-white ring-2 ring-accent/50 ring-offset-2 ring-offset-surface-900'
                        : 'bg-surface-700 text-slate-300 hover:bg-surface-600'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">Выберите букву для аватара</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? <Spinner size={18} className="!text-white" /> : 'Сохранить'}
              </button>
              <button type="button" onClick={() => navigate('/')} className="btn-ghost">
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}