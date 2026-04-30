import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { StatePage } from './StatePage';

interface ErrorRedirectPageProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  redirectUrl?: string;
  autoRedirectMs?: number;
}

export function ErrorRedirectPage({
  title,
  description,
  actionLabel = 'Back to Home',
  actionTo = '/',
  redirectUrl,
  autoRedirectMs,
}: ErrorRedirectPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!redirectUrl || !autoRedirectMs || autoRedirectMs <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (/^https?:\/\//i.test(redirectUrl)) {
        window.location.assign(redirectUrl);
        return;
      }

      navigate(redirectUrl);
    }, autoRedirectMs);

    return () => window.clearTimeout(timeoutId);
  }, [autoRedirectMs, navigate, redirectUrl]);

  return (
    <StatePage
      title={title}
      description={description}
      actionLabel={actionLabel}
      actionTo={actionTo}
      redirectUrl={redirectUrl}
    />
  );
}
