import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto text-center py-32 px-6">
      <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight mb-4">404</h1>
      <p className="text-xl text-slate-600 mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-lg shadow-blue-200 transition-all active:scale-95"
      >
        <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>
        Back to Home
      </Link>
    </div>
  );
}
