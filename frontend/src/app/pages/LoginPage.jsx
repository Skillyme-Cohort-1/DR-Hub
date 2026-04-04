import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate()

  const validate = () => {
    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    if (!form.password.trim()) nextErrors.password = 'Password is required.'
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setSubmitError('Please correct the highlighted fields.')
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSubmitting(false)
    navigate('/dashboard')
  }

  return (
    <main className="dr-page dr-login-page">
      <section className="dr-login-card">
        <Link to="/" className="dr-back-link">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <p className="dr-eyebrow">DR HUB ACCESS</p>
        <h1>Sign in to your account</h1>
        <p className="dr-login-copy">Use your credentials to manage bookings and session records.</p>

        {submitError ? <div className="dr-error-banner">{submitError}</div> : null}

        <form onSubmit={handleSubmit} noValidate className="dr-form">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@company.com"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? <p className="dr-field-error">{errors.email}</p> : null}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password ? <p className="dr-field-error">{errors.password}</p> : null}

          <button type="submit" className="dr-btn dr-btn-primary dr-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="dr-login-links">
          <a href="#" onClick={(event) => event.preventDefault()}>
            Forgot password
          </a>
          <Link to="/">Back to home</Link>
        </div>
      </section>
    </main>
  )
}
