import { useState } from 'react'

export default function LoginPage({ onSubmit, isSubmitting, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ email, password })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0a0a0a',
        color: '#f0ede8',
        padding: '24px',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#1e1e1e',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '28px',
          display: 'grid',
          gap: '14px',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
            DR Hub
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', color: '#fff' }}>Admin Login</h1>
        </div>

        <label style={{ display: 'grid', gap: '6px', fontSize: '12px' }}>
          <span style={{ color: '#aaa' }}>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.16)',
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              padding: '10px 12px',
              outline: 'none',
            }}
          />
        </label>

        <label style={{ display: 'grid', gap: '6px', fontSize: '12px' }}>
          <span style={{ color: '#aaa' }}>Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.16)',
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              padding: '10px 12px',
              outline: 'none',
            }}
          />
        </label>

        {error ? (
          <div
            style={{
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12px',
              color: '#ffb4b4',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.35)',
            }}
          >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            marginTop: '6px',
            border: 'none',
            borderRadius: '8px',
            background: isSubmitting ? '#6f6f6f' : '#f07b2b',
            color: '#fff',
            fontWeight: 700,
            padding: '11px 14px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
