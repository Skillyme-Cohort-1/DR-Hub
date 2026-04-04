import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async () => {
    // Replace with API call + token storage when backend is ready
    await new Promise((r) => setTimeout(r, 400));
    navigate("/", { replace: true });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your bookings and workspace access."
    >
      {justRegistered ? (
        <div
          className="mb-6 rounded-lg border border-[#E67E22]/25 bg-[#E67E22]/10 px-4 py-3 text-sm text-white/90"
          role="status"
        >
          Account created. You can sign in now.
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-white/80">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            className="w-full rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
            placeholder="you@example.com"
            {...register("email", {
              required: "Enter your email",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            })}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email ? (
            <p className="mt-1.5 text-sm text-red-400" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="login-password" className="block text-sm font-medium text-white/80">
              Password
            </label>
            <a
              href="mailto:disputeresolutionhub@gmail.com?subject=DR%20Hub%20password%20reset"
              className="text-xs font-medium text-[#E67E22] hover:text-[#f39c4d]"
            >
              Forgot password?
            </a>
          </div>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#E67E22]/50 focus:ring-2 focus:ring-[#E67E22]/20"
            placeholder="••••••••"
            {...register("password", {
              required: "Enter your password",
              minLength: { value: 8, message: "At least 8 characters" },
            })}
            aria-invalid={errors.password ? "true" : "false"}
          />
          {errors.password ? (
            <p className="mt-1.5 text-sm text-red-400" role="alert">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/20 bg-[#141414] text-[#E67E22] focus:ring-2 focus:ring-[#E67E22]/30"
            {...register("remember")}
          />
          Remember this device
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#E67E22] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#E67E22]/15 transition-colors hover:bg-[#d35400] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-white/55">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-[#E67E22] hover:text-[#f39c4d]">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
