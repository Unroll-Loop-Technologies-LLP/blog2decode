import { Link } from 'react-router';

interface StatePageProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export function StatePage({
  title,
  description,
  actionLabel = 'Back to Home',
  actionTo = '/',
}: StatePageProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center bg-white border rounded-3xl shadow-sm p-10">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-gray-500 mb-3">
          CyberSphere
        </p>
        <h1 className="font-bold text-3xl md:text-4xl mb-4">{title}</h1>
        <p className="text-gray-600 text-lg mb-8">{description}</p>
        <Link
          to={actionTo}
          className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
