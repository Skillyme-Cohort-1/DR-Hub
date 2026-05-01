import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
  Wifi, Volume2, Car, Coffee, MapPin,
  ArrowRight, Star, ChevronRight,
} from "lucide-react";
import RoomsSection from "../components/RoomsSection";
import { reviewService } from '../../services/reviewApi';
import amenitiesImg from '../../assets/amenitiesImage.jpg';

const staticTestimonials = [
  {
    name: "A. Mwangi",
    role: "Advocate, Nairobi",
    quote: "The boardroom is quiet, professional, and easy to book. It has become our default space for client meetings.",
  },
  {
    name: "L. Njeri",
    role: "ADR Practitioner",
    quote: "The environment feels premium without being distracting. Everything from the soundproofing to the setup is deliberate.",
  },
  {
    name: "K. Otieno",
    role: "Legal Consultant",
    quote: "It is rare to find a workspace that balances privacy, convenience, and polish this well. DR Hub does it right.",
  },
];

const amenityImage = amenitiesImg;

function bookingHref() {
  return localStorage.getItem("isLoggedIn") === "true"
    ? "/booking"
    : "/login?redirect=%2Fbooking";
}

export default function HomePage() {
  const [testimonials, setTestimonials] = useState(staticTestimonials.slice(0, 3));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await reviewService.getReviews();
        if (mounted && data?.reviews?.length) {
          setTestimonials(data.reviews.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching testimonials:", err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const steps = [
    { number: 1, title: "Choose your room",   description: "Boardroom, private office, or combined space — pick what fits your session." },
    { number: 2, title: "Pick date & time",   description: "See live availability and reserve a slot that works for you and your clients." },
    { number: 3, title: "Upload credentials", description: "Share professional qualifications once; we keep verification simple and secure." },
    { number: 4, title: "Pay & confirm",      description: "Complete payment online and receive instant confirmation and access details." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main id="main-content">

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-[4.25rem]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1771147372634-976f022c0033?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBib2FyZHJvb20lMjBtZWV0aW5nJTIwc3BhY2V8ZW58MXx8fHwxNzc0OTgyODA4fDA&ixlib=rb-4.1.0&q=80&w=1920)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(232,119,34,0.12),_transparent_55%)]" />

          <div className="relative z-10 w-full max-w-[1100px] px-4 py-24 sm:px-6 sm:py-32">
            <div className="mx-auto flex max-w-[900px] flex-col items-start">
              <p className="landing-animate-hero mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#E87722]">
                Westlands · Nairobi
              </p>
              <h1 className="landing-animate-hero mb-6 max-w-[18ch] text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                Premium office space for legal professionals
              </h1>
              <p className="landing-animate-hero mb-10 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
                Soundproofed rooms, reliable connectivity, and a calm setting for hearings, mediations, and
                confidential client work.
              </p>
              <div className="landing-animate-hero mb-12 flex flex-wrap gap-3 sm:gap-4">
                <Button asChild className="h-auto rounded-md bg-[#E87722] px-8 py-4 text-base text-white shadow-lg shadow-[#E87722]/20 hover:bg-[#d96d1f]">
                  <Link to={bookingHref()} className="inline-flex items-center gap-2">
                    Book a space <ArrowRight className="h-5 w-5" aria-hidden />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto rounded-md border-white/25 bg-white/5 px-8 py-4 text-base text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/10">
                  <a href="#rooms">View rooms</a>
                </Button>
              </div>
              <ul className="landing-animate-tags flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/65">
                {["Advocates", "ADR practitioners", "DR Hub members"].map((tag) => (
                  <li key={tag} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E87722]" aria-hidden />
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Rooms ──────────────────────────────────────────────────────── */}
        <section id="rooms" className="scroll-mt-24 border-t border-border bg-background px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#E87722]">Spaces</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Available rooms</h2>
              <p className="mt-4 text-base leading-relaxed text-foreground/55">
                Choose a layout for meetings, hybrid hearings, or focused drafting — every room is tuned for
                professional work.
              </p>
            </div>
            <RoomsSection />
          </div>
        </section>

        {/* ── Amenities ──────────────────────────────────────────────────── */}
        <section id="amenities" className="scroll-mt-24 border-t border-border bg-muted/30 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto grid max-w-[1100px] items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#E87722]">Amenities</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Everything you expect from a serious workspace
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/55">
                From reliable video calls to parking and refreshments, details are handled so you can focus on
                your matter.
              </p>
              <ul className="mt-10 space-y-5">
                {[
                  { icon: Wifi,    text: "High-speed Wi‑Fi & teleconferencing-ready setups" },
                  { icon: Volume2, text: "Soundproofed rooms for private conversations" },
                  { icon: Car,     text: "Complimentary parking for members and guests" },
                  { icon: Coffee,  text: "Tea, coffee, and water available on site" },
                  { icon: MapPin,  text: "Westlands Business Park, 3rd Floor" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-4">
                    <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E87722]/30 bg-[#E87722]/10 text-[#E87722]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="pt-2 text-lg text-foreground/75">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-2xl bg-gradient-to-br from-[#E87722]/20 via-transparent to-transparent blur-2xl" />
              <figure className="relative overflow-hidden rounded-2xl border border-border shadow-2xl shadow-black/20">
                <img
                  src={amenityImage}
                  alt="Bright professional office lounge with seating and large windows"
                  className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-auto lg:min-h-[420px]"
                  loading="lazy"
                />
              </figure>
            </div>
          </div>
        </section>

        {/* ── Process ────────────────────────────────────────────────────── */}
        <section id="process" className="scroll-mt-24 border-t border-border bg-background px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1280px]">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#E87722]">Process</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">How it works</h2>
              <p className="mt-4 text-base text-foreground/55">Book your space in four straightforward steps.</p>
            </div>
            <ol className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {steps.map((step, index) => (
                <li
                  key={step.number}
                  className="relative rounded-2xl border border-border bg-card p-6 pt-8 transition-colors hover:border-[#E87722]/25"
                >
                  <span className="absolute right-6 top-4 font-serif text-6xl leading-none text-[#E87722]/15 select-none" aria-hidden>
                    {step.number}
                  </span>
                  <span className="relative mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E87722] text-sm font-bold text-white">
                    {step.number}
                  </span>
                  <h3 className="relative text-xl font-semibold">{step.title}</h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-foreground/55">{step.description}</p>
                  {index < steps.length - 1 ? (
                    <span className="pointer-events-none absolute -right-4 top-1/2 hidden h-px w-8 -translate-y-1/2 bg-gradient-to-r from-border to-transparent lg:block" aria-hidden />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Testimonials ───────────────────────────────────────────────── */}
        <section id="testimonials" className="scroll-mt-24 border-t border-border bg-muted/30 px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-[1280px]">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#E87722]">Testimonials</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Trusted by legal professionals
              </h2>
              <p className="mt-4 text-base text-foreground/55">
                Members use DR Hub for confidential meetings, mediation sessions, and focused legal work.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {testimonials.map((t) => (
                <Card
                  key={t.name}
                  className="border border-border bg-card p-0 transition-all duration-300 hover:-translate-y-1 hover:border-[#E87722]/40"
                >
                  <CardContent className="flex h-full flex-col gap-6 px-6 py-8">
                    <div className="flex gap-1 text-[#E87722]" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
                      ))}
                    </div>
                    <p className="text-lg leading-relaxed text-foreground/75">"{t.quote}"</p>
                    <div className="mt-auto border-t border-border pt-6">
                      <p className="text-lg font-semibold">{t.name}</p>
                      <p className="text-sm text-foreground/45">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#E87722] px-4 py-20 text-black sm:px-6 sm:py-28">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
          <div className="relative mx-auto flex max-w-[720px] flex-col items-center text-center">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Ready to book your space?
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-black/70 sm:text-lg">
              Reserve online in minutes. Need a recurring slot or a larger session? We will help you find the
              right room.
            </p>
            <Button asChild className="mt-10 h-auto rounded-md bg-black px-8 py-4 text-base text-white hover:bg-black/90">
              <Link to={bookingHref()} className="inline-flex items-center gap-2">
                Book now <ChevronRight className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}