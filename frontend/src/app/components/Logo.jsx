import { Link } from 'react-router'

export function Logo() {
  return (
    <Link to="/" className="dr-logo" aria-label="DR Hub Home">
      <span className="dr-logo-mark">DR</span>
      <span className="dr-logo-text">Hub</span>
    </Link>
  )
}
