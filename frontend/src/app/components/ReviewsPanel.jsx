import React, { useEffect, useState } from 'react';
import { ArrowUpRight, BadgeCheck, Quote, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { reviewService } from '../../services/reviewApi';
import reviewsData from '../data/reviews.json';

const GOOGLE_REVIEWS_URL = reviewsData.googleUrl || 'https://www.google.com/search?q=DR+Hub+reviews';
const DEFAULT_RATING = 5;

export default function ReviewsPanel({ maxItems = 3 }) {
  const [reviews, setReviews] = useState(reviewsData.reviews || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await reviewService.getReviews();
        
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err.message);
        // Keep existing reviews as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const visibleReviews = reviews.slice(0, maxItems);
  const averageRating = visibleReviews.length
    ? (
        visibleReviews.reduce((sum, review) => sum + (Number(review.rating) || DEFAULT_RATING), 0) /
        visibleReviews.length
      ).toFixed(1)
    : DEFAULT_RATING.toFixed(1);

  return (
    <aside className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0B] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-6">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#E87722]/45 to-transparent" />

      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E87722]/20 bg-[#E87722]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F0A15D]">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            Client trust
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-white">Reviews</h3>
          <p className="mt-1 text-sm leading-relaxed text-white/60">
            Feedback from advocates, ADR practitioners, and legal consultants.
          </p>
        </div>
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-medium text-[#E87722] transition-colors hover:text-[#F0A15D]"
          aria-label="View reviews on Google (opens in new tab)"
        >
          View on Google
        </a>
      </div>

      <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4 backdrop-blur-sm">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-1 text-[#E87722]" aria-label={`${averageRating} out of 5 stars`}>
              {Array.from({ length: DEFAULT_RATING }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
              ))}
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-white">{averageRating}</span>
              <span className="text-sm text-white/45">/ 5.0</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">Featured voices</p>
            <p className="mt-2 text-sm font-medium text-white/75">{visibleReviews.length || maxItems} recent testimonials</p>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {visibleReviews.length > 0 ? (
          visibleReviews.map((r) => (
            <article
              key={r.name}
              className="group rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-4 transition-colors hover:border-[#E87722]/20"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white/90">{r.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">{r.role}</div>
                </div>
                <div className="rounded-full border border-[#E87722]/15 bg-[#E87722]/10 p-2 text-[#E87722]">
                  <Quote className="h-3.5 w-3.5" aria-hidden />
                </div>
              </div>

              <div className="mb-3 flex items-center gap-1 text-[#E87722]" aria-hidden>
                {Array.from({ length: Number(r.rating) || DEFAULT_RATING }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>

              <p className="text-sm leading-6 text-white/68">"{r.quote}"</p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center text-sm text-white/60">
            {loading ? 'Loading reviews...' : error ? 'Unable to load reviews' : 'No reviews available'}
          </div>
        )}
      </div>

      <div className="mt-5">
        <Button
          asChild
          className="h-11 w-full rounded-xl bg-[#E87722] text-white shadow-[0_14px_30px_rgba(232,119,34,0.22)] transition-all hover:bg-[#d46a1a] hover:shadow-[0_18px_36px_rgba(232,119,34,0.28)]"
        >
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
            {loading ? 'Loading...' : 'See all reviews on Google'}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </Button>
      </div>
    </aside>
  );
}
