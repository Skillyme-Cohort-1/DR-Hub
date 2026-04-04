import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Rooms", href: "/#rooms" },
  { label: "Amenities", href: "/#amenities" },
  { label: "How it works", href: "/#process" },
  { label: "Reviews", href: "/#testimonials" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || open
          ? "border-white/10 bg-black/85 backdrop-blur-md"
          : "border-transparent bg-gradient-to-b from-black/70 to-transparent backdrop-blur-[2px]"
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-black"
      >
        Skip to content
      </a>

      <nav
        className="mx-auto flex h-[4.25rem] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6"
        aria-label="Primary"
      >
        <Link
          to="/"
          className="shrink-0 rounded-md outline-none ring-offset-2 ring-offset-black focus-visible:ring-2 focus-visible:ring-[#E87722]"
        >
          <Logo className="text-white" />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className="rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" asChild className="text-white/80 hover:bg-white/10 hover:text-white">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            className="rounded-md bg-[#E87722] px-5 text-white hover:bg-[#d96d1f]"
          >
            <Link to="/booking">Book a space</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-x-0 top-[4.25rem] bottom-0 z-40 bg-black/95 backdrop-blur-lg transition-opacity duration-200 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-1 px-4 py-6 sm:px-6">
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="rounded-lg px-4 py-3 text-lg font-medium text-white/90 hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <hr className="my-4 border-white/10" />
          <Button variant="ghost" asChild className="justify-start text-white hover:bg-white/10">
            <Link to="/login" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </Button>
          <Button
            asChild
            className="mt-2 justify-center rounded-md bg-[#E87722] text-white hover:bg-[#d96d1f]"
          >
            <Link to="/booking" onClick={() => setOpen(false)}>
              Book a space
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
