import { useState, createElement } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Clock,
  Globe,
  Headphones,
  Mail,
  MapPin,
  Menu,
  Phone,
  Shield,
  Wifi,
  X,
} from "lucide-react";

const navLinks = [
  { href: "#top", label: "Home" },
  { href: "#rooms", label: "Rooms" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

const features = [
  { icon: Headphones, label: "Soundproofed" },
  { icon: Wifi, label: "High-speed WiFi" },
  { icon: Shield, label: "Secure & Private" },
  { icon: Clock, label: "24/7 Access" },
];

const rooms = [
  {
    title: "Focus Suite",
    desc: "Acoustically treated chambers for depositions, client interviews, and deep work.",
    capacity: "2–4 people",
    features: ["Soundproof walls", "Video recording ready", "Standing desk option"],
    price: "From Ksh 1,500/hr",
  },
  {
    title: "Boardroom",
    desc: "Formal setting for hearings prep, settlement talks, and partner meetings.",
    capacity: "8–14 people",
    features: ["4K presentation display", "Conference phone", "Whiteboard wall"],
    price: "From Ksh 3,000/hr",
    featured: true,
  },
  {
    title: "ADR Suite",
    desc: "Neutral environment for mediation and arbitration with breakout rooms.",
    capacity: "Flexible layout",
    features: ["Separate breakout space", "Neutral décor", "Refreshment station"],
    price: "From Ksh 4,500/hr",
  },
];

const plans = [
  {
    name: "Day Pass",
    price: "2,500",
    period: "per session",
    blurb: "Perfect for one-off meetings and client consultations.",
    features: ["3-hour session", "Any focus room", "WiFi & refreshments", "Booking support"],
    cta: "Book a session",
  },
  {
    name: "Professional",
    price: "18,000",
    period: "per month",
    blurb: "Ideal for sole practitioners with regular space needs.",
    features: [
      "20 hours monthly",
      "All room types",
      "Priority booking",
      "Member discount",
      "Rollover hours",
    ],
    cta: "Start membership",
    featured: true,
  },
  {
    name: "Chambers",
    price: "Custom",
    period: "tailored",
    blurb: "Dedicated space solutions for firms and DR Hub members.",
    features: [
      "Unlimited access",
      "Reserved rooms",
      "Firm branding",
      "Concierge service",
      "Custom billing",
    ],
    cta: "Contact us",
  },
];

const testimonials = [
  {
    quote: "The acoustic quality is exceptional. Perfect for sensitive client discussions.",
    author: "Sarah Mwangi",
    role: "Senior Advocate",
  },
  {
    quote: "Finally, a professional space that matches the caliber of work we do.",
    author: "James Ochieng",
    role: "Mediator & Arbitrator",
  },
  {
    quote: "The location and amenities make it easy to focus on what matters.",
    author: "Linda Kamau",
    role: "Corporate Counsel",
  },
];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div id="top" className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 lg:px-12">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-[#E67E22] transition-opacity hover:opacity-80"
            style={{ fontFamily: "var(--font-display)" }}
          >
            DR Hub
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-white/60 transition-colors hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              to="/login"
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              Login
            </Link>
            <Link
              to="/booking"
              className="group relative overflow-hidden rounded-lg bg-[#E67E22] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#d35400] hover:shadow-lg hover:shadow-[#E67E22]/20"
            >
              Book Now
            </Link>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white transition-colors hover:border-white/20 md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/5 bg-[#0a0a0a] px-6 py-6 md:hidden">
            <nav className="flex flex-col gap-4" aria-label="Mobile">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-white/60 transition-colors hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
              <hr className="border-white/10" />
              <Link
                to="/login"
                className="text-white/80"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/booking"
                className="rounded-lg bg-[#E67E22] py-3 text-center font-semibold text-white"
                onClick={() => setMenuOpen(false)}
              >
                Book Now
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero - Clean, minimal, focused */}
      <section className="relative overflow-hidden pt-20">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]" aria-hidden />
        
        {/* Ambient glow */}
        <div 
          className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 opacity-30 blur-[120px]"
          style={{
            background: "radial-gradient(circle, rgba(230, 126, 34, 0.15) 0%, transparent 70%)"
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-[1400px] px-6 pb-24 pt-32 lg:px-12 lg:pb-32 lg:pt-40">
          <div className="mx-auto max-w-5xl text-center">
            {/* Main headline */}
            <h1
              className="landing-animate-hero mb-10 text-2xl font-semibold leading-[1.15] tracking-[0.12em] text-white sm:text-4xl sm:tracking-[0.14em] lg:text-5xl xl:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="uppercase">The Dispute Resolution Hub</span>
            </h1>

            {/* Tagline */}
            <p
              className="landing-animate-hero mx-auto mb-12 max-w-4xl text-[0.7rem] font-medium uppercase leading-[1.9] tracking-[0.18em] text-white/75 sm:text-xs sm:tracking-[0.2em] md:text-sm md:leading-[2] md:tracking-[0.22em]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <span className="block">Combining efficiency, authenticity and cohesive</span>
              <span className="block">team work to offer the best dispute resolution</span>
              <span className="block">services in Kenya and abroad.</span>
            </p>

            {/* CTAs */}
            <div className="landing-animate-hero mb-16 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/booking"
                className="group inline-flex items-center gap-2 rounded-lg bg-[#E67E22] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#E67E22]/20 transition-all hover:scale-[1.02] hover:bg-[#d35400] hover:shadow-xl hover:shadow-[#E67E22]/30"
              >
                Book a space
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#rooms"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
              >
                Explore rooms
              </a>
            </div>

            {/* Quick features */}
            <div className="landing-animate-tags mx-auto grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              {features.map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-white/70 backdrop-blur-sm"
                >
                  {createElement(icon, { className: "h-4 w-4 text-[#E67E22]", "aria-hidden": true })}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" aria-hidden />
      </section>

      {/* Mission, Vision, Values */}
      <section
        id="mission"
        className="border-b border-white/5 bg-[#0c0c0c] py-20 lg:py-28"
        aria-labelledby="mission-heading"
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <h2 id="mission-heading" className="sr-only">
            Mission, vision, and values
          </h2>
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-10">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 lg:p-10">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#E67E22]">Mission</p>
              <p className="text-lg leading-relaxed text-white/85 sm:text-xl" style={{ fontFamily: "var(--font-display)" }}>
                To inspire and bring hope through dispute resolution.
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 lg:p-10">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#E67E22]">Vision</p>
              <p className="text-lg leading-relaxed text-white/85 sm:text-xl" style={{ fontFamily: "var(--font-display)" }}>
                A conflict-competent society.
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 lg:p-10">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#E67E22]">Values</p>
              <ul className="space-y-3 text-base leading-relaxed text-white/75">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E67E22]" aria-hidden />
                  Authenticity
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E67E22]" aria-hidden />
                  Efficiency
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E67E22]" aria-hidden />
                  Dedicated Service
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E67E22]" aria-hidden />
                  Cohesive Team Work
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof / Stats */}
      <section className="border-y border-white/5 bg-[#0f0f0f]/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: "Active members", value: "200+" },
              { label: "Rooms available", value: "12" },
              { label: "Hours booked monthly", value: "1,500+" },
              { label: "Satisfaction rate", value: "98%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 text-3xl font-bold text-[#E67E22]" style={{ fontFamily: "var(--font-display)" }}>
                  {stat.value}
                </div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why DR Hub */}
      <section id="about" className="mx-auto max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
        <div className="mb-16 text-center">
          <h2
            className="mb-4 text-4xl font-semibold text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Built for your practice
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            Whether preparing for trial, hosting negotiations, or meeting clients — DR Hub provides the professional environment your work demands.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Headphones,
              title: "Acoustic excellence",
              text: "Engineered soundproofing ensures complete privacy for confidential conversations and recorded proceedings.",
            },
            {
              icon: Wifi,
              title: "Reliable infrastructure",
              text: "Redundant fiber internet and backup power so your sessions never drop mid-argument or negotiation.",
            },
            {
              icon: Shield,
              title: "Professional discretion",
              text: "Member-first access and spaces designed for serious work — not casual coworking.",
            },
          ].map(({ icon, title, text }) => (
            <div
              key={title}
              className="group rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-8 transition-all hover:border-[#E67E22]/20 hover:shadow-lg hover:shadow-[#E67E22]/5"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#E67E22]/10 text-[#E67E22] ring-1 ring-[#E67E22]/20 transition-transform group-hover:scale-110">
                {createElement(icon, { className: "h-7 w-7", "aria-hidden": true })}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
              <p className="leading-relaxed text-white/60">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rooms - Enhanced cards */}
      <section id="rooms" className="border-t border-white/5 bg-[#0f0f0f]/30 py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2
                className="mb-3 text-4xl font-semibold text-white sm:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Spaces for every need
              </h2>
              <p className="max-w-2xl text-lg text-white/60">
                From intimate consultations to full-scale hearings — reserve by the hour or secure recurring blocks.
              </p>
            </div>
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 self-start text-[#E67E22] transition-colors hover:text-[#f39c4d] md:self-auto"
            >
              View availability
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {rooms.map((room) => (
              <article
                key={room.title}
                className={`group relative overflow-hidden rounded-2xl border transition-all ${
                  room.featured
                    ? "border-[#E67E22]/30 bg-gradient-to-b from-[#E67E22]/5 to-transparent shadow-lg shadow-[#E67E22]/5"
                    : "border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent hover:border-white/10"
                }`}
              >
                {room.featured && (
                  <div className="absolute right-4 top-4 z-10 rounded-full bg-[#E67E22] px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </div>
                )}

                {/* Visual header */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#E67E22]/20 via-[#E67E22]/5 to-transparent">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(230,126,34,0.15),transparent_60%)]" />
                </div>

                <div className="p-8">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-wider text-[#E67E22]">
                        {room.capacity}
                      </span>
                      <h3 className="text-2xl font-semibold text-white">{room.title}</h3>
                    </div>
                  </div>

                  <p className="mb-6 leading-relaxed text-white/60">{room.desc}</p>

                  <ul className="mb-6 space-y-2">
                    {room.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-white/70">
                        <Check className="h-4 w-4 shrink-0 text-[#E67E22]" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mb-6 border-t border-white/5 pt-6">
                    <div className="text-2xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
                      {room.price}
                    </div>
                  </div>

                  <Link
                    to="/booking"
                    className={`block rounded-lg py-3 text-center text-sm font-semibold transition-all ${
                      room.featured
                        ? "bg-[#E67E22] text-white hover:bg-[#d35400]"
                        : "border border-white/10 text-white hover:bg-white/5"
                    }`}
                  >
                    Reserve now
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
        <div className="mb-16 text-center">
          <h2
            className="mb-4 text-4xl font-semibold text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Trusted by legal professionals
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-8"
            >
              <p className="mb-6 text-lg leading-relaxed text-white/80">"{testimonial.quote}"</p>
              <div>
                <div className="font-semibold text-white">{testimonial.author}</div>
                <div className="text-sm text-white/50">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing - Improved cards */}
      <section id="pricing" className="border-t border-white/5 bg-[#0f0f0f]/30 py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="mb-16 text-center">
            <h2
              className="mb-4 text-4xl font-semibold text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Flexible pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-white/60">
              From single sessions to dedicated chambers — choose the plan that fits your practice.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col overflow-hidden rounded-2xl border transition-all ${
                  plan.featured
                    ? "border-[#E67E22]/30 bg-gradient-to-b from-[#E67E22]/5 to-transparent shadow-xl shadow-[#E67E22]/10 lg:scale-105"
                    : "border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent hover:border-white/10"
                }`}
              >
                {plan.featured && (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-lg bg-[#E67E22] px-4 py-1 text-xs font-semibold text-white">
                    Best value
                  </div>
                )}

                <div className="flex-1 p-8">
                  <div className="mb-6">
                    <h3 className="mb-2 text-2xl font-semibold text-white">{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-[#E67E22]" style={{ fontFamily: "var(--font-display)" }}>
                        {plan.price === "Custom" ? plan.price : `Ksh ${plan.price}`}
                      </span>
                      {plan.price !== "Custom" && (
                        <span className="text-white/50">/{plan.period}</span>
                      )}
                    </div>
                  </div>

                  <p className="mb-6 text-white/60">{plan.blurb}</p>

                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#E67E22]" />
                        <span className="text-white/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 pt-0">
                  <Link
                    to="/booking"
                    className={`block rounded-lg py-4 text-center font-semibold transition-all ${
                      plan.featured
                        ? "bg-[#E67E22] text-white shadow-lg shadow-[#E67E22]/20 hover:bg-[#d35400]"
                        : "border border-white/10 text-white hover:bg-white/5"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E67E22] to-[#d35400]" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]" aria-hidden />
        
        <div className="relative mx-auto max-w-[1400px] px-6 text-center lg:px-12">
          <h2
            className="mb-6 text-4xl font-semibold text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            See the space in person
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90">
            Schedule a walkthrough with our team. Available weekdays, 9am–6pm EAT.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-white bg-white px-8 py-4 font-semibold text-[#E67E22] transition-all hover:bg-white/90"
          >
            Request a tour
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-white/5 py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <h2
            className="mb-4 text-4xl font-semibold text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Contact us
          </h2>
          <p className="mb-14 max-w-2xl text-lg text-white/55">
            Visit us at Westlands Business Park, reach out by email or phone, or connect online.
          </p>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-10">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E67E22]/10 text-[#E67E22] ring-1 ring-[#E67E22]/20">
                  <MapPin className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E67E22]">
                    You can find us at
                  </p>
                  <address className="not-italic leading-relaxed text-white/80">
                    Westlands Business Park,
                    <br />
                    3rd Floor (within T&amp;O)
                    <br />
                    <span className="text-white/50">Westlands, Nairobi</span>
                  </address>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E67E22]/10 text-[#E67E22] ring-1 ring-[#E67E22]/20">
                  <Mail className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E67E22]">
                    You can reach us at
                  </p>
                  <a
                    href="mailto:disputeresolutionhub@gmail.com"
                    className="text-lg text-[#E67E22] transition-colors hover:text-[#f39c4d]"
                  >
                    disputeresolutionhub@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E67E22]/10 text-[#E67E22] ring-1 ring-[#E67E22]/20">
                  <Phone className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E67E22]">Call us</p>
                  <a
                    href="tel:+25411390760"
                    className="text-lg text-white/85 transition-colors hover:text-white"
                  >
                    +254 113 907 60
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E67E22]/10 text-[#E67E22] ring-1 ring-[#E67E22]/20">
                  <Globe className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E67E22]">Website</p>
                  <a
                    href="https://drhub.fullcirclecentre.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 break-all text-lg text-[#E67E22] transition-colors hover:text-[#f39c4d]"
                  >
                    drhub.fullcirclecentre.com
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-[#E67E22]/[0.08] to-white/[0.02] p-10 lg:p-12">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-[#E67E22]">
                Connect with us
              </p>
              <p className="mb-6 text-2xl font-semibold text-white sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                The Dispute Resolution Hub.
              </p>
              <a
                href="tel:+25411390760"
                className="mb-8 inline-flex items-center gap-3 text-xl font-medium text-white/90 transition-colors hover:text-white"
              >
                <Phone className="h-6 w-6 shrink-0 text-[#E67E22]" aria-hidden />
                +254 113 907 60
              </a>
              <a
                href="https://drhub.fullcirclecentre.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-[#E67E22]/40 hover:bg-[#E67E22]/10"
              >
                <Globe className="h-4 w-4 text-[#E67E22]" aria-hidden />
                Visit website
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0f0f0f]/50 py-16">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
            <div className="max-w-sm">
              <div
                className="mb-4 text-2xl font-bold tracking-tight text-[#E67E22]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                DR Hub
              </div>
              <p className="text-white/60">
                Premium workspace for advocates, ADR practitioners, and legal professionals in Nairobi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <div className="mb-4 font-semibold text-white">Platform</div>
                <ul className="space-y-3 text-sm text-white/60">
                  <li>
                    <a href="#rooms" className="transition-colors hover:text-white">
                      Rooms
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="transition-colors hover:text-white">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <Link to="/booking" className="transition-colors hover:text-white">
                      Book now
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <div className="mb-4 font-semibold text-white">Account</div>
                <ul className="space-y-3 text-sm text-white/60">
                  <li>
                    <Link to="/login" className="transition-colors hover:text-white">
                      Login
                    </Link>
                  </li>
                  <li>
                    <a href="#contact" className="transition-colors hover:text-white">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <div className="mb-4 font-semibold text-white">Legal</div>
                <ul className="space-y-3 text-sm text-white/60">
                  <li>
                    <a href="#" className="transition-colors hover:text-white">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors hover:text-white">
                      Terms
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center text-sm text-white/40 lg:text-left">
            © {new Date().getFullYear()} DR Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
