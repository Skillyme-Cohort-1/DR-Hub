import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/button';
import loginImg from '../../assets/loginImage.jpg';
import { Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react';

export function LoginPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [remember, setRemember]         = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    let response;
    try {
      response = await fetch('http://localhost:3000/api/users/login', {
        method:  'POST',
        headers: { Accept: '*/*', 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
    } catch {
      setSubmitError('Could not reach the server. Please check your connection and try again.');
      setIsSubmitting(false);
      return;
    }

    let payload = null;
    try { payload = await response.json(); } catch { payload = null; }

    if (!response.ok) {
      setSubmitError(payload?.message || 'Login failed. Please check your credentials.');
      setIsSubmitting(false);
      return;
    }

    const accessToken = payload?.token || '';
    if (!accessToken) {
      setSubmitError('Login succeeded but no access token was returned.');
      setIsSubmitting(false);
      return;
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('authToken', accessToken);
    if (payload?.user) localStorage.setItem('authUser', JSON.stringify(payload.user));

    const redirect = searchParams.get('redirect') || '/dashboard';
    navigate(redirect, { replace: true });
  };

  const inputClass =
    'w-full bg-card border border-border text-foreground placeholder:text-foreground/35 h-14 rounded-none pl-12 pr-4 text-sm outline-none transition-colors focus:border-[#E87722] focus:ring-2 focus:ring-[#E87722]/20';

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left — login form ───────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-20">
        <div className="max-w-[480px] mx-auto w-full">

          {/* Back to home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/50 transition-colors hover:text-foreground mb-10"
          >
            <ArrowRight className="h-4 w-4 rotate-180" aria-hidden />
            Back to home
          </Link>

          {/* Logo */}
          <Link to="/" className="inline-block mb-12">
            <Logo />
          </Link>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-foreground mb-4 tracking-tight" style={{ fontSize: '42px', lineHeight: '1.1' }}>
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-base">
              Sign in to access your bookings and profile
            </p>
          </div>

          {/* Registered banner */}
          {justRegistered ? (
            <div className="mb-6 rounded-lg border border-[#E87722]/25 bg-[#E87722]/10 px-4 py-3 text-sm text-foreground/90" role="status">
              Account created. You can sign in now.
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm text-foreground/80">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm text-foreground/80">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-card text-[#E87722] focus:ring-[#E87722]/20"
                />
                <span>Remember me</span>
              </label>
              <a
                href="mailto:disputeresolutionhub@gmail.com?subject=DR%20Hub%20password%20reset"
                className="text-[#E87722] hover:text-foreground transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Error */}
            {submitError ? (
              <p className="text-sm text-red-400" role="alert">{submitError}</p>
            ) : null}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#E87722] text-white hover:bg-[#d46a1a] h-14 text-base rounded-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
              {!isSubmitting && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">OR</span>
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#E87722] hover:text-foreground transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* ── Right — hero image ──────────────────────────────────────────── */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${loginImg})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>

        <div className="relative h-full flex flex-col justify-end p-12">
          <div className="max-w-[500px]">
            <div className="text-[#E87722] text-xs uppercase tracking-widest mb-4">
              Premium Legal Workspace
            </div>
            <h2 className="text-foreground mb-6 tracking-tight" style={{ fontSize: '36px', lineHeight: '1.2' }}>
              Professional Meeting Spaces in the Heart of Westlands
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Join hundreds of legal professionals who trust The DR Hub for their dispute resolution needs.
            </p>
            <div className="mt-8 space-y-3">
              {[
                'Soundproofed boardrooms & private offices',
                'High-speed WiFi & AV equipment',
                'Complimentary parking & refreshments',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-foreground/70 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E87722] shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}