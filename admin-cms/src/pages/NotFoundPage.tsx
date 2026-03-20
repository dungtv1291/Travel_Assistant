import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center">
      <p className="text-6xl font-bold text-slate-200 mb-4">404</p>
      <h1 className="text-xl font-semibold text-slate-800 mb-2">Page not found</h1>
      <p className="text-sm text-slate-500 mb-6">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 transition"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
