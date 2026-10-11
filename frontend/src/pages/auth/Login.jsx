import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, School } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ROLE_HOME_ROUTE } from '@/constants/roles';


export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  function validate() {
    const next = {};
    if (!email.trim()) next.email = 'Email or register number is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await login({ email, password, rememberMe });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const redirectTo = location.state?.from || ROLE_HOME_ROUTE[user.role];
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setSubmitting(true);
    try {
      const user = await loginWithGoogle(credentialResponse.credential);
      toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
      const redirectTo = location.state?.from || ROLE_HOME_ROUTE[user.role];
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Unable to sign in with Google.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div>
      <div className="mb-8 lg:hidden flex items-center gap-2.5">
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-accent-500)] p-1.5 text-[var(--color-primary-950)]">
          <School size={20} />
        </div>
        <span className="font-[var(--font-display)] text-xl font-semibold text-[var(--text-primary)]">
          EduCore
        </span>
      </div>

      <h1 className="font-[var(--font-display)] text-3xl font-semibold text-[var(--text-primary)]">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Sign in to continue to your campus dashboard.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4">
        <Input
          label="Email / Register Number"
          type="email"
          icon={Mail}
          placeholder="you@educore.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
          autoComplete="username"
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border-strong)] accent-[var(--color-accent-500)]"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-[var(--color-primary-700)] hover:underline dark:text-[var(--color-accent-400)]"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full">
          Log in
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[var(--border-default)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--bg-default)] px-2 text-[var(--text-muted)]">
              Or continue with
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              toast.error('Google Sign In failed. Please try again.');
            }}
            useOneTap
          />
        </div>
      </form>

    </div>
  );
}

export default Login;
