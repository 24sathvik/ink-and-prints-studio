import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-brand-orange mb-2">404</div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Page Not Found</h1>
        <p className="text-text-muted text-sm mb-6">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl font-semibold hover:bg-brand-orange-hover transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
