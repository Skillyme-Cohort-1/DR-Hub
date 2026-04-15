import { useState } from 'react'

const features = [
  {
    icon: '📊',
    title: 'Operations in one place',
    text: 'Bookings, leads, and member activity from a single admin workspace.',
  },
  {
    icon: '👥',
    title: 'Built for your team',
    text: 'Role-aware access so staff see what they need—nothing more.',
  },
  {
    icon: '🔒',
    title: 'Secure sign-in',
    text: 'Your session stays protected with modern authentication practices.',
  },
]

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 shrink-0 text-[#F07B2B]"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function LoginPage({ onSubmit, isSubmitting, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ email, password })
  }

  const [focusedField, setFocusedField] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const inputClassName =
    'w-full rounded-lg border border-white/[0.14] bg-white/[0.04] px-3.5 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#666] outline-none transition-all duration-200 focus:border-[#F07B2B]/45 focus:ring-2 focus:ring-[#F07B2B]/25 focus:bg-white/[0.06]'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;900&display=swap');
        .login-shell { font-family: 'DM Sans', system-ui, sans-serif; }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.18; }
          50% { opacity: 0.25; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
        .feature-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .feature-card:hover {
          transform: translateX(8px);
          background: rgba(255, 255, 255, 0.03);
        }
        .input-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          transition: color 0.2s;
        }
        .input-wrapper:focus-within .input-icon {
          color: #F07B2B;
        }
        .input-with-icon {
          padding-left: 40px;
        }
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
        }
        .password-toggle:hover {
          color: #F07B2B;
        }
      `}</style>
      <div
        className="login-shell fixed inset-0 z-[200] flex min-h-svh w-screen flex-col overflow-y-auto bg-[#0a0a0a] text-[#F0EDE8] lg:grid lg:max-h-none lg:min-h-svh lg:grid-cols-2 lg:overflow-hidden"
        lang="en"
      >
        {/* Brand & information */}
        <aside className="relative flex flex-col justify-center border-b border-white/[0.08] px-6 py-8 sm:px-10 sm:py-10 lg:border-b-0 lg:border-r lg:px-8 lg:py-10 xl:px-12">
          <div
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 animate-pulse-glow rounded-full bg-[#F07B2B]/18 blur-[100px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 animate-pulse-glow rounded-full bg-[#F07B2B]/10 blur-[120px]"
            aria-hidden
            style={{ animationDelay: '2s' }}
          />

          <div className="relative mx-auto w-full max-w-md space-y-6 lg:space-y-7">
            <header className="animate-fade-in-up">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#888]">
                The
              </p>
              <h1
                className="mt-1 font-['Playfair_Display'] text-[clamp(1.75rem,4vw,2.75rem)] font-black leading-tight tracking-tight text-[#F0EDE8]"
              >
                DR <span className="text-[#F07B2B]">Hub</span>
              </h1>
              <span className="mt-3 inline-block rounded border border-[#F07B2B]/25 bg-[#F07B2B]/[0.12] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#F07B2B] transition-all hover:bg-[#F07B2B]/[0.18] hover:border-[#F07B2B]/35">
                Admin console
              </span>
            </header>

            <p className="animate-fade-in-up text-sm leading-relaxed text-[#a8a4a0]" style={{ animationDelay: '0.1s' }}>
              Sign in to manage reservations, nurture leads, and keep the hub
              running smoothly. This portal is for authorised administrators
              only.
            </p>

            <ul className="space-y-3">
              {features.map((item, index) => (
                <li 
                  key={item.title} 
                  className="feature-card animate-fade-in-up flex gap-3.5 rounded-xl border border-transparent p-3 -mx-3"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F07B2B]/10 text-lg border border-[#F07B2B]/20">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#F0EDE8]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#888]">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="pt-4 text-xs text-[#555] animate-fade-in" style={{ animationDelay: '0.6s' }}>
              © {new Date().getFullYear()} DR Hub. All rights reserved.
            </p>
          </div>
        </aside>

        {/* Sign-in form */}
        <main className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:py-10">
          <div className="w-full max-w-[400px]">
            <div className="mb-7 animate-fade-in-up">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Welcome back
              </h2>
              <p className="mt-1.5 text-sm text-[#888]">
                Enter your credentials to access the dashboard.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="animate-fade-in-up rounded-xl border border-white/[0.1] bg-[#141414]/90 p-6 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.65)] backdrop-blur-sm transition-all hover:border-white/[0.15]"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="grid gap-4">
                <label className="grid gap-2 text-xs font-medium text-[#aaa]">
                  <span className={`transition-colors ${focusedField === 'email' ? 'text-[#F07B2B]' : ''}`}>
                    Email
                  </span>
                  <div className="input-wrapper">
                    <svg 
                      className="input-icon h-4 w-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" 
                      />
                    </svg>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="you@example.com"
                      className={`${inputClassName} input-with-icon`}
                    />
                  </div>
                </label>

                <label className="grid gap-2 text-xs font-medium text-[#aaa]">
                  <span className={`transition-colors ${focusedField === 'password' ? 'text-[#F07B2B]' : ''}`}>
                    Password
                  </span>
                  <div className="input-wrapper">
                    <svg 
                      className="input-icon h-4 w-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                      />
                    </svg>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your password"
                      className={`${inputClassName} input-with-icon pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </label>

                {error ? (
                  <div
                    role="alert"
                    className="animate-fade-in-up rounded-lg border border-red-500/35 bg-red-500/15 px-3.5 py-2.5 text-sm text-[#ffb4b4] flex items-start gap-2"
                  >
                    <svg className="h-5 w-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative mt-1 w-full overflow-hidden rounded-lg border border-transparent bg-[#F07B2B] py-3 text-sm font-bold text-white shadow-lg shadow-[#F07B2B]/20 outline-none transition-all hover:bg-[#e87024] hover:shadow-xl hover:shadow-[#F07B2B]/30 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#F07B2B]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] disabled:cursor-not-allowed disabled:bg-[#6f6f6f] disabled:shadow-none disabled:scale-100"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Signing in…</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in</span>
                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-[#555] animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Trouble signing in? Contact your organisation&apos;s DR Hub
              administrator.
            </p>
          </div>
        </main>
      </div>
    </>
  )
}
