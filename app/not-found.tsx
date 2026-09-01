import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ivory px-5 pt-24 text-center">
      <p className="text-[11px] uppercase tracking-[0.28em] text-muted">404</p>
      <h1 className="mt-4 font-serif text-5xl">This page has gone.</h1>
      <Link href="/" className="mt-8 text-[11px] uppercase tracking-[0.22em] underline underline-offset-8">
        Return home
      </Link>
    </div>
  );
}
