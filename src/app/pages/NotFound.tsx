import { StatePage } from '../components/StatePage';

export function NotFound() {
  return (
    <StatePage
      title="Page not found"
      description="The page you requested does not exist or may have moved."
    />
  );
}
