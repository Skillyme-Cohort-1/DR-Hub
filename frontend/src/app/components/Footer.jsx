import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Mail, Phone, MapPin } from "lucide-react";

const exploreLinks = [
  { label: "Rooms",        to: "/#rooms" },
  { label: "Amenities",    to: "/#amenities" },
  { label: "How it works", to: "/#process" },
  { label: "Reviews",      to: "/#testimonials" },
];

const accountLinks = [
  { label: "Book a space",    to: "/booking" },
  { label: "Sign in",         to: "/login" },
  { label: "Create account",  to: "/register" },
];

export function Footer() {
  return (
    <footer id="contact" className="relative border-t border-border bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E87722]/40 to-transparent" />
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">

          <div className="lg:col-span-4">
            <Logo className="mb-5" />
            <p className="max-w-sm text-sm leading-relaxed text-foreground/55">
              Premium meeting and workspace for advocates, ADR practitioners, and DR Hub members — quiet,
              connected, and in the heart of Westlands.
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-foreground/35">
              Mediation · Conciliation · Negotiation · Arbitration
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2">
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/90">
                Explore
              </h4>
              <ul className="space-y-3">
                {exploreLinks.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-foreground/55 transition-colors hover:text-[#E87722]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/90">
                Members
              </h4>
              <ul className="space-y-3">
                {accountLinks.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-foreground/55 transition-colors hover:text-[#E87722]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/90">
              Contact
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:disputeresolutionhub@gmail.com"
                  className="group flex gap-3 text-sm text-foreground/55 transition-colors hover:text-[#E87722]"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#E87722]/80 group-hover:text-[#E87722]" />
                  <span className="break-all">disputeresolutionhub@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:0113907602"
                  className="group flex gap-3 text-sm text-foreground/55 transition-colors hover:text-[#E87722]"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#E87722]/80 group-hover:text-[#E87722]" />
                  <span>0113 907 602</span>
                </a>
              </li>
              <li>
                <div className="flex gap-3 text-sm text-foreground/55">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E87722]/80" />
                  <span>Westlands Business Park, 3rd Floor, Nairobi</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="text-xs text-foreground/40">© {new Date().getFullYear()} The DR Hub. All rights reserved.</p>
          <p className="text-xs text-foreground/35">Professional spaces for confidential legal work.</p>
        </div>
      </div>
    </footer>
  );
}