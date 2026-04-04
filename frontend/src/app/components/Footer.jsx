import { Logo } from './Logo';
import { Mail, Phone } from 'lucide-react';

export function Footer() {
  const quickLinks = ['Rooms', 'Pricing', 'Book', 'Contact'];

  return (
    <footer className="bg-[#0A0A0A] text-white border-t border-white/5">
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Left - Logo & Tagline */}
          <div>
            <Logo className="mb-6 text-white" />
            <p className="text-white/40 text-sm tracking-wider leading-relaxed">
              Mediation · Conciliation · Negotiation · Arbitration
            </p>
          </div>

          {/* Center - Quick Links */}
          <div>
            <h4 className="text-white mb-6 text-sm uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a
                    href={`/#${link.toLowerCase()}`}
                    className="text-white/60 hover:text-[#E87722] transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Contact Info */}
          <div>
            <h4 className="text-white mb-6 text-sm uppercase tracking-widest">Contact</h4>
            <div className="space-y-4">
              <a
                href="mailto:disputeresolutionhub@gmail.com"
                className="flex items-center gap-3 text-white/60 hover:text-[#E87722] transition-colors group"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">disputeresolutionhub@gmail.com</span>
              </a>
              <a
                href="tel:0113907602"
                className="flex items-center gap-3 text-white/60 hover:text-[#E87722] transition-colors group"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">0113907602</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          <p className="text-center text-white/40 text-xs tracking-wide">
            © 2026 The DR Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}