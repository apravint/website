import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-28">
      <h1 className="font-display text-5xl tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted">This page may have moved when the site was rebuilt.</p>
      <Link href="/" className="btn mt-6">Go to the home page</Link>
    </div>
  );
}
