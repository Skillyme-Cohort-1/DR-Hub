import { Link } from 'react-router'

export function NotFound() {
  return (
    <main className="dr-page dr-center-stack">
      <p className="dr-eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The page you requested does not exist in this version of DR-Hub.</p>
      <Link to="/" className="dr-btn dr-btn-primary">
        Go to Landing
      </Link>
    </main>
  )
}
