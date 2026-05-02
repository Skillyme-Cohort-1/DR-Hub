import { Link } from "react-router-dom";
import {
  Calendar, CheckCircle, ChevronRight, Clock,
  CreditCard, FileText, TrendingUp,
} from "lucide-react";
import { StatusBadge } from "../ui/StatusBadge";
import { formatBookingDate } from "../../lib/formatters";

const STAT_ICONS   = [Calendar, Clock, CheckCircle, CreditCard];
const STAT_LABELS  = ["Total Bookings", "Upcoming Sessions", "Completed", "Total Spent"];
const STAT_TRENDS  = ["All reservations", "Future reservations", "Finished sessions", "Across all bookings"];

export function MetricsSection({ stats, upcomingBookings, bookingsLoading, bookingsError, onNavigateSection }) {
  const statCards = [
    { value: String(stats.totalBookings),   icon: STAT_ICONS[0], label: STAT_LABELS[0], trend: STAT_TRENDS[0] },
    { value: String(stats.upcomingSessions), icon: STAT_ICONS[1], label: STAT_LABELS[1], trend: STAT_TRENDS[1] },
    { value: String(stats.completed),        icon: STAT_ICONS[2], label: STAT_LABELS[2], trend: STAT_TRENDS[2] },
    { value: stats.totalSpent,               icon: STAT_ICONS[3], label: STAT_LABELS[3], trend: STAT_TRENDS[3] },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Overview</h2>
        <p className="mt-1 text-sm text-foreground/50">Your workspace activity at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.label}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-[#E87722]/30 hover:shadow-md hover:shadow-[#E87722]/5"
            >
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-[#E87722]/5 blur-2xl transition-all group-hover:bg-[#E87722]/10" />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#E87722]/10 text-[#E87722] transition-all group-hover:scale-110 group-hover:bg-[#E87722]/15">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold md:text-4xl">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-foreground/60">{stat.label}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#E87722]">
                  <TrendingUp className="h-3 w-3" /> {stat.trend}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick actions */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/booking">
              <button className="flex w-full items-center gap-3 rounded-lg bg-muted p-4 text-left transition-all hover:bg-accent">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E87722]/10 text-[#E87722]">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Book a Space</p>
                  <p className="text-xs text-foreground/50">Reserve your next workspace</p>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 text-foreground/30" />
              </button>
            </Link>
            <button
              onClick={() => onNavigateSection("documents")}
              className="flex w-full items-center gap-3 rounded-lg bg-muted p-4 text-left transition-all hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E87722]/10 text-[#E87722]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Upload Documents</p>
                <p className="text-xs text-foreground/50">Add credentials or verification files</p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 text-foreground/30" />
            </button>
          </div>
        </div>

        {/* Upcoming sessions */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Upcoming Sessions</h3>
          <div className="space-y-3">
            {bookingsLoading ? (
              <p className="text-sm text-foreground/50">Loading upcoming sessions...</p>
            ) : bookingsError ? (
              <p className="text-sm text-red-400">{bookingsError}</p>
            ) : upcomingBookings.length === 0 ? (
              <p className="text-sm text-foreground/50">No upcoming sessions yet.</p>
            ) : (
              upcomingBookings.slice(0, 2).map((booking) => (
                <div key={booking.id} className="rounded-lg bg-muted p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{booking.room?.name || "N/A"}</p>
                      <p className="text-xs text-foreground/50">{formatBookingDate(booking.date)}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="text-xs text-foreground/50">Booking ref: {booking.reference || booking.id}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}