import { Link } from 'react-router'
import { Logo } from './Logo'

export function Navbar() {
  return (
    <header className="dr-nav">
      <div className="dr-nav-inner">
        <Logo />
        <nav className="dr-nav-links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
        </nav>
      </div>
    </header>
  )
}
