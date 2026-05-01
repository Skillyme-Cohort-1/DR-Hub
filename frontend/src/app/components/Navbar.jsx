import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Rooms",      href: "/#rooms" },
  { label: "Amenities",  href: "/#amenities" },
  { label: "How it works", href: "/#process" },
  { label: "Reviews",    href: "/#testimonials" },
  { label: "Contact Us", href: "/contact" },
];

export function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location              = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || open
          ? "border-border bg-background backdrop-blur-none"
          : "border-transparent bg-gradient-to-b from-black/70 to-transparent backdrop-blur-[2px]"
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:text-foreground"
      >
        Skip to content
      </a>

      <nav
        className="mx-auto flex h-[4.25rem] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6"
        aria-label="Primary"
      >
        <Link
          to="/"
          className="shrink-0 rounded-md outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-[#E87722]"
        >
          <Logo />
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map(({ label, href }) => (
            <li key={href}>
              {href.startsWith("/#") ? (
                <a
                  href={href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                >
                  {label}
                </a>
              ) : (
                <Link
                  to={href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                >
                  {label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Button variant="ghost" asChild className="text-foreground/80 hover:bg-accent hover:text-foreground">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild className="rounded-md bg-[#E87722] px-5 text-white hover:bg-[#d96d1f]">
            <Link to="/booking">Book a space</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-accent lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-x-0 top-[4.25rem] bottom-0 z-40 bg-background transition-opacity duration-200 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
      >
        <div className="relative mx-auto flex max-w-[1280px] flex-col gap-1 px-4 py-6 sm:px-6">
          {navLinks.map(({ label, href }) =>
            href.startsWith("/#") ? (
              <a
                key={href}
                href={href}
                className="rounded-lg px-4 py-3 text-lg font-medium text-foreground/90 hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                to={href}
                className="rounded-lg px-4 py-3 text-lg font-medium text-foreground/90 hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            )
          )}

          <hr className="my-4 border-border" />

          <Button variant="ghost" asChild className="justify-start text-foreground hover:bg-accent">
            <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
          </Button>
          <Button asChild className="mt-2 justify-center rounded-md bg-[#E87722] text-white hover:bg-[#d96d1f]">
            <Link to="/booking" onClick={() => setOpen(false)}>Book a space</Link>
          </Button>

          {/* Theme toggle — bottom right of mobile menu */}
          <div className="mt-4 flex justify-end">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}