import { Link } from 'react-router'
import { ArrowRight, CheckCircle2, ShieldCheck, TimerReset } from 'lucide-react'

const highlights = [
  {
    title: 'Premium Dispute Spaces',
    description: 'Purpose-built hearing and mediation rooms configured for confidentiality and focus.',
    icon: ShieldCheck,
  },
  {
    title: 'Fast Booking Flow',
    description: 'Reserve dates, confirm details, and prepare your session in minutes.',
    icon: TimerReset,
  },
  {
    title: 'Trusted by Professionals',
    description: 'A dependable platform for clients, counsel, and neutrals across Kenya.',
    icon: CheckCircle2,
  },
]

export function HomePage() {
  return (
    <main className="dr-page">
      <section className="dr-hero">
        <p className="dr-eyebrow">DR HUB</p>
        <h1>Resolve with confidence in a professional digital-first hub.</h1>
        <p className="dr-hero-copy">
          DR-Hub helps you book secure rooms, manage hearings, and keep every dispute resolution detail
          organized from one place.
        </p>
        <div className="dr-hero-actions">
          <Link to="/login" className="dr-btn dr-btn-primary">
            Login <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="dr-btn dr-btn-secondary">
            Book Session
          </Link>
        </div>
      </section>

      <section className="dr-highlights">
        {highlights.map((item) => {
          const Icon = item.icon
          return (
            <article key={item.title} className="dr-card">
              <Icon size={20} className="dr-card-icon" />
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </article>
          )
        })}
      </section>

      <section className="dr-trust-strip">
        <p>Trusted booking workflow • Session-ready spaces • Transparent operations</p>
      </section>

      <section className="dr-footer-cta">
        <h2>Ready to start your next session?</h2>
        <p>Sign in to access scheduling and your booking dashboard.</p>
        <Link to="/login" className="dr-btn dr-btn-primary">
          Continue to Login <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  )
}
