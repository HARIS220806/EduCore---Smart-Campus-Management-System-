import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '@/components/common/Button';

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg-canvas)] text-center px-4">
      <div className="rounded-full bg-[var(--bg-subtle)] p-4 text-[var(--text-muted)]">
        <Compass size={28} />
      </div>
      <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--text-primary)]">
        Page not found
      </h1>
      <p className="text-sm text-[var(--text-muted)] max-w-sm">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/">
        <Button variant="primary">Go home</Button>
      </Link>
    </div>
  );
}

export default NotFound;
