import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function AuthLayout({ children, title, subtitle, wide = false }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[640px] -translate-x-1/2 opacity-25 blur-[100px]" aria-hidden>
        <div
          className="h-full w-full"
          style={{
            background: "radial-gradient(circle, rgba(230, 126, 34, 0.2) 0%, transparent 70%)",
          }}
        />
      </div>

      <div
        className={
          wide
            ? "relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-5 py-8 sm:px-8 sm:py-10 lg:px-10"
            : "relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-10"
        }
      >
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>

        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-block text-2xl font-bold tracking-tight text-[#E67E22]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            DR Hub
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h1>
          {subtitle ? <p className="mt-2 text-sm text-white/55">{subtitle}</p> : null}
        </div>

        <div
          className={
            wide
              ? "rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-xl shadow-black/40 backdrop-blur-sm sm:p-8 lg:p-10"
              : "rounded-2xl border border-white/10 bg-white/[0.02] p-8 shadow-xl shadow-black/40 backdrop-blur-sm"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
