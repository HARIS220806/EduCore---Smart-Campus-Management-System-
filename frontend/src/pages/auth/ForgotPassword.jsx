import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import authService from '@/services/authService';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await authService.forgotPassword({ email });
      // Prototype only: the backend has no mail server, so in dev it returns the
      // reset link directly (and always logs it server-side) instead of emailing it.
      if (res.devResetLink) console.info('[password reset link]', res.devResetLink);
      setSent(true);
    } catch {
      // Same confirmation either way — never reveal whether the email exists.
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center gap-3">
        <div className="rounded-full bg-[var(--color-success-100)] p-3 text-[var(--color-success-600)]">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--text-primary)]">
          Check your inbox
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-xs">
          If an account exists for {email}, a password reset link is on its way.
        </p>
        <Link
          to="/login"
          className="mt-2 text-sm font-medium text-[var(--color-primary-700)] hover:underline dark:text-[var(--color-accent-400)]"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6"
      >
        <ArrowLeft size={15} /> Back to login
      </Link>

      <h1 className="font-[var(--font-display)] text-3xl font-semibold text-[var(--text-primary)]">
        Reset your password
      </h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Enter your email and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@educore.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          required
        />
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Send reset link
        </Button>
      </form>
    </div>
  );
}

export default ForgotPassword;
