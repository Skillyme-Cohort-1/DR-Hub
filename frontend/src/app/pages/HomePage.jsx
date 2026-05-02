
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
  Wifi,
  Volume2,
  Car,
  Coffee,
  MapPin,
  ArrowRight,
  Star,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import RoomsSection from "../components/RoomsSection";
import { reviewService } from '../../services/reviewApi';
import reviewsData from '../data/reviews.json';

const GOOGLE_REVIEWS_URL = reviewsData.googleUrl || 'https://www.google.com/search?q=DR+Hub+reviews';
const REVIEW_SNIPPET_LIMIT = 210;
const REVIEW_ROTATION_MS = 7000;

const staticTestimonials = [
  {
    name: "A. Mwangi",
    role: "Advocate, Nairobi",
    quote:
      "The boardroom is quiet, professional, and easy to book. It has become our default space for client meetings.",
  },
  {
    name: "L. Njeri",
    role: "ADR Practitioner",
    quote:
      "The environment feels premium without being distracting. Everything from the soundproofing to the setup is deliberate.",
  },
  {
    name: "K. Otieno",
    role: "Legal Consultant",
    quote:
      "It is rare to find a workspace that balances privacy, convenience, and polish this well. DR Hub does it right.",
  },
];

const amenityImage =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80";

function formatReviewSnippet(quote, limit = REVIEW_SNIPPET_LIMIT) {
  const cleanQuote = String(quote || "").trim();

  if (cleanQuote.length <= limit) {
    return cleanQuote;
  }

  return `${cleanQuote.slice(0, limit).trimEnd()}...`;
}

function bookingHref() {
  return localStorage.getItem("isLoggedIn") === "true"
    ? "/booking"
    : "/login?redirect=%2Fbooking";
}

export default function HomePage() {
  const [testimonials, setTestimonials] = useState(staticTestimonials.slice(0, 3));
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const extendedTestimonials = useMemo(() => {
    if (testimonials.length > 1) {
      return [...testimonials, testimonials[0]];
    }
    return testimonials;
  }, [testimonials]);

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

  useEffect(() => {
    if (extendedTestimonials.length <= 1) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      setActiveTestimonial((current) => current + 1);
    }, REVIEW_ROTATION_MS);

    return () => clearInterval(intervalId);
  }, [extendedTestimonials]);

  useEffect(() => {
    if (activeTestimonial === testimonials.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setActiveTestimonial(0);
      }, 500); // Match this with transition duration
      return () => clearTimeout(timer);
    }
  }, [activeTestimonial, testimonials.length]);

  const steps = [
    {
      number: 1,
      title: "Choose your room",
      description: "Boardroom, private office, or combined space — pick what fits your session.",
    },
    {
      number: 2,
      title: "Pick date & time",
      description: "See live availability and reserve a slot that works for you and your clients.",
    },
    {
      number: 3,
      title: "Upload credentials",
      description: "Share professional qualifications once; we keep verification simple and secure.",
    },
    {
      number: 4,
      title: "Pay & confirm",
      description: "Complete payment online and receive instant confirmation and access details.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <Navbar />

      <main id="main-content">
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-17">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1771147372634-976f022c0033?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBib2FyZHJvb20lMjBtZWV0aW5nJTIwc3BhY2V8ZW58MXx8fHwxNzc0OTgyODA4fDA&ixlib=rb-4.1.0&q=80&w=1920)",
            }}
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/55 to-[#030303]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(232,119,34,0.12),transparent_55%)]" />

          <div className="relative z-10 w-full max-w-275 px-4 py-24 sm:px-6 sm:py-32">
            <div className="mx-auto flex max-w-225 flex-col items-start">
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
                <Button
                  asChild
                  className="h-auto rounded-md bg-[#E87722] px-8 py-4 text-base text-white shadow-lg shadow-[#E87722]/20 hover:bg-[#d96d1f]"
                >
                  <Link to={bookingHref()} className="inline-flex items-center gap-2">
                    Book a space
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-auto rounded-md border-white/25 bg-white/5 px-8 py-4 text-base text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/10"
                >
                  <a href="#rooms">View rooms</a>
                </Button>
              </div>

              <ul className="landing-animate-tags flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/65">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E87722]" aria-hidden />
                  Advocates
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E87722]" aria-hidden />
                  ADR practitioners
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E87722]" aria-hidden />
                  DR Hub members
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="rooms" className="scroll-mt-24 border-t border-white/6 bg-[#030303] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-275">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#E87722]">Spaces</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Available rooms</h2>
              <p className="mt-4 text-base leading-relaxed text-white/55">
                Choose a layout for meetings, hybrid hearings, or focused drafting — every room is tuned for
                professional work.
              </p>
            </div>

            <RoomsSection />

          </div>
        </section>

        <section
          id="amenities"
          className="scroll-mt-24 border-t border-white/6 bg-[#050505] px-4 py-20 sm:px-6 lg:py-28"
        >
          <div className="mx-auto grid max-w-275 items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#E87722]">
                Amenities
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Everything you expect from a serious workspace
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/55">
                From reliable video calls to parking and refreshments, details are handled so you can focus on
                your matter.
              </p>

              <ul className="mt-10 space-y-5">
                {[
                  { icon: Wifi, text: "High-speed Wi‑Fi & teleconferencing-ready setups" },
                  { icon: Volume2, text: "Soundproofed rooms for private conversations" },
                  { icon: Car, text: "Complimentary parking for members and guests" },
                  { icon: Coffee, text: "Tea, coffee, and water available on site" },
                  { icon: MapPin, text: "Westlands Business Park, 3rd Floor" },
                ].map((item) => {
                  const AmenityIcon = item.icon;

                  return (
                    <li key={item.text} className="flex gap-4">
                      <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E87722]/30 bg-[#E87722]/10 text-[#E87722]">
                        <AmenityIcon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="pt-2 text-lg text-white/75">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-2xl bg-linear-to-br from-[#E87722]/20 via-transparent to-transparent blur-2xl" />
              <figure className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50">
                <img
                  src={amenityImage}
                  alt="Bright professional office lounge with seating and large windows"
                  className="aspect-4/5 w-full object-cover sm:aspect-5/4 lg:aspect-auto lg:min-h-105"
                  loading="lazy"
                />
              </figure>
            </div>
          </div>
        </section>

        <section
          id="process"
          className="scroll-mt-24 border-t border-white/6 bg-[#030303] px-4 py-20 sm:px-6 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#E87722]">Process</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">How it works</h2>
              <p className="mt-4 text-base text-white/55">Book your space in four straightforward steps.</p>
            </div>

            <ol className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {steps.map((step, index) => (
                <li
                  key={step.number}
                  className="relative rounded-2xl border border-white/8 bg-zinc-900/30 p-6 pt-8 transition-colors hover:border-[#E87722]/25"
                >
                  <span
                    className="absolute right-6 top-4 font-serif text-6xl leading-none text-[#E87722]/15 select-none"
                    aria-hidden
                  >
                    {step.number}
                  </span>
                  <span className="relative mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#E87722] text-sm font-bold text-black">
                    {step.number}
                  </span>
                  <h3 className="relative text-xl font-semibold text-white">{step.title}</h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-white/55">{step.description}</p>
                  {index < steps.length - 1 ? (
                    <span
                      className="pointer-events-none absolute -right-4 top-1/2 hidden h-px w-8 -translate-y-1/2 bg-linear-to-r from-white/20 to-transparent lg:block"
                      aria-hidden
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="testimonials"
          className="scroll-mt-24 border-t border-white/6 bg-[#050505] px-4 py-16 sm:px-6 lg:py-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-start">
              <div className="mx-auto max-w-2xl text-center sm:mx-0 sm:text-left">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#E87722]">
                  Testimonials
                </p>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">Reviews</h2>
              </div>
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#E87722]/40 bg-[#E87722]/8 px-4 py-2 text-sm font-medium text-[#E87722] transition-all duration-200 hover:border-[#E87722]/70 hover:bg-[#E87722]/15 hover:text-[#E87722]"
              >
                Google Reviews
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <p className="mx-auto mb-8 max-w-2xl text-center text-base text-white/55 sm:mx-0 sm:text-left">
              A few recent impressions from members.
            </p>

            <div className="relative h-48 overflow-hidden">
              <div
                className="flex"
                style={{
                  width: `${extendedTestimonials.length * 100}%`,
                  transform: `translateX(-${(activeTestimonial * 100) / extendedTestimonials.length}%)`,
                  transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
                }}
              >
                {extendedTestimonials.map((testimonial, index) => (
                  <article
                    key={`${testimonial.name}-${index}`}
                    className="w-full shrink-0"
                    style={{ flex: `0 0 ${100 / extendedTestimonials.length}%` }}
                  >
                    <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                              testimonial.name
                            )}&background=random`}
                            alt={testimonial.name}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{testimonial.name}</p>
                          <p className="text-sm text-white/50">{testimonial.role}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-yellow-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (testimonial.rating || 5) ? 'fill-current' : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <blockquote className="mt-4 text-lg italic leading-relaxed text-white/80">
                        <p>“{formatReviewSnippet(testimonial.quote)}”</p>
                      </blockquote>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#E87722] px-4 py-20 text-black sm:px-6 sm:py-28">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
          <div className="relative mx-auto flex max-w-180 flex-col items-center text-center">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Ready to book your space?
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-black/70 sm:text-lg">
              Reserve online in minutes. Need a recurring slot or a larger session? We will help you find the
              right room.
            </p>
            <Button
              asChild
              className="mt-10 h-auto rounded-md bg-black px-8 py-4 text-base text-white hover:bg-black/90"
            >
              <Link to={bookingHref()} className="inline-flex items-center gap-2">
                Book now
                <ChevronRight className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

