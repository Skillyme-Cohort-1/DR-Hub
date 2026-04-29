import { useState } from 'react';
import { Link } from 'react-router-dom';
// import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Calendar, Clock, TrendingUp, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ReviewsPanel from '../components/ReviewsPanel';
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  Trash2,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  TrendingUp,
  Upload,
  UserCircle2,
  X,
} from "lucide-react";

const stats = [
  { label: "Total Bookings", value: "12", icon: Calendar, trend: "+2 this month" },
  { label: "Upcoming Sessions", value: "3", icon: Clock, trend: "Next: Tomorrow" },
  { label: "Completed", value: "8", icon: CheckCircle, trend: "100% attendance" },
  { label: "Total Spent", value: "Ksh 42K", icon: CreditCard, trend: "Member savings: 4.2K" },
];

const upcomingBookings = [
  { id: "DRH-20250401-001", room: "Boardroom", date: "Apr 1, 2025", time: "10:00am - 1:00pm", status: "confirmed", amount: 4500 },
  { id: "DRH-20250405-002", room: "Private Office", date: "Apr 5, 2025", time: "2:00pm - 5:00pm", status: "pending", amount: 3000 },
  { id: "DRH-20250410-003", room: "Combined Space", date: "Apr 10, 2025", time: "10:00am - 1:00pm", status: "confirmed", amount: 6000 },
];

const checkins = [
  { bookingId: "DRH-20250401-001", date: "Apr 1, 2025", time: "9:45am", method: "QR Check-in" },
  { bookingId: "DRH-20250315-001", date: "Mar 15, 2025", time: "9:50am", method: "Front desk" },
];

const payments = [
  { reference: "PAY-74821", date: "Mar 15, 2025", amount: "Ksh 4,500", status: "Paid" },
  { reference: "PAY-74875", date: "Apr 5, 2025", amount: "Ksh 3,000", status: "Pending" },
];

function getStatusBadge(status) {
  const styles = {
    confirmed: "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20",
    pending: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    paid: "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20",
    verified: "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20",
  };
  return (
    <span className={`rounded border px-3 py-1 text-xs ${styles[status.toLowerCase()] || "border-white/10 text-white/70"}`}>
      {status}
    </span>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useProfile } from "../hooks/useProfile";
import { useBookings } from "../hooks/useBookings";
import { usePayments } from "../hooks/usePayments";
import { useDocuments } from "../hooks/useDocuments";
import { useCheckins } from "../hooks/useCheckins";

import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { DashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { MetricsSection } from "../components/dashboard/MetricsSection";
import { BookingsSection } from "../components/dashboard/BookingsSection";
import { DocumentsSection } from "../components/dashboard/DocumentsSection";
import { CheckinsSection } from "../components/dashboard/CheckinsSection";
import { PaymentsSection } from "../components/dashboard/PaymentsSection";
import { ProfileSection } from "../components/dashboard/ProfileSection";

export function ClientDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("metrics");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { profileForm, profileLoading, updateField } = useProfile();
  const { myBookings, bookingsLoading, bookingsError, upcomingBookings, stats } = useBookings();
  const { myPayments, paymentsLoading, paymentsError } = usePayments();
  const docs = useDocuments();
  const { checkins, checkinsLoading, checkinsError } = useCheckins();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* <Navbar /> */}

      <div className="pt-18">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-white mb-2 tracking-tight" style={{ fontSize: '40px', lineHeight: '1.2' }}>
              My Dashboard
            </h1>
            <p className="text-white/50">Manage your bookings and view your history</p>
  const renderContent = () => {
    if (activeSection === "bookings") {
      return (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Your Bookings</h2>
              <p className="mt-1 text-sm text-white/50">Manage and track your workspace reservations</p>
            </div>
            <Link to="/booking">
              <Button className="inline-flex items-center gap-2 rounded-lg bg-[#E87722] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E87722]/20 transition-all hover:bg-[#d46a1a] hover:shadow-[#E87722]/30">
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Booking ID</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Room</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Date</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Time</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Status</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Amount</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white/70">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingBookings.map((booking, index) => (
                    <tr key={booking.id} className="group border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-4 text-sm font-mono text-white/60">{booking.id}</td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-white">{booking.room}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-white/70">{booking.date}</td>
                      <td className="px-4 py-4 text-sm text-white/70">{booking.time}</td>
                      <td className="px-4 py-4">{getStatusBadge(booking.status)}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-white">Ksh {booking.amount.toLocaleString()}</td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-sm font-medium text-[#E87722] transition-colors hover:text-[#f39c4d]">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );
    }

    if (activeSection === "documents") {
      const formatDocumentDate = (value) => {
        if (!value) return "Unknown date";
        const date = new Date(value);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      };

      return (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Documents</h2>
              <p className="mt-1 text-sm text-white/50">Manage your credentials and verification documents</p>
            </div>
          </div>

          <form
            onSubmit={handleUploadDocument}
            className="grid gap-3 rounded-xl border border-white/10 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] p-4 md:grid-cols-[1.3fr_1fr_auto]"
          >
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Document name (optional)"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#E87722]/50"
            />
            <input
              type="file"
              onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-[#E87722] file:px-3 file:py-1.5 file:text-white"
            />
            <Button
              type="submit"
              disabled={uploadingDocument}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E87722] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d46a1a] disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {uploadingDocument ? "Uploading..." : "Upload"}
            </Button>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-[#0F0F0F] border border-white/10 p-6">
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-12 h-12 bg-[#E87722]/10 flex items-center justify-center border border-[#E87722]/20">
                          <Icon className="w-6 h-6 text-[#E87722]" />
                        </div>
                      </div>
                      <div className="text-4xl text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{stat.value}</div>
                      <div className="text-sm text-white/50 mb-2">{stat.label}</div>
                      <div className="text-xs text-[#E87722]">{stat.trend}</div>
                    </div>
                  );
                })}
              </div>

              {/* Upcoming Bookings */}
              <div className="bg-[#0F0F0F] border border-white/10 p-8 mb-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-white tracking-tight" style={{ fontSize: '24px', lineHeight: '1.2' }}>
                    Upcoming Bookings
                  </h2>
                  <Link to="/booking">
                    <Button className="bg-[#E87722] text-white hover:bg-[#d46a1a] rounded-none px-6">
                      New Booking
                    </Button>
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-4 text-xs text-white/50 uppercase tracking-wider">Booking ID</th>
                        <th className="text-left py-4 px-4 text-xs text-white/50 uppercase tracking-wider">Room</th>
                        <th className="text-left py-4 px-4 text-xs text-white/50 uppercase tracking-wider">Date</th>
                        <th className="text-left py-4 px-4 text-xs text-white/50 uppercase tracking-wider">Time</th>
                        <th className="text-left py-4 px-4 text-xs text-white/50 uppercase tracking-wider">Status</th>
                        <th className="text-left py-4 px-4 text-xs text-white/50 uppercase tracking-wider">Amount</th>
                        <th className="text-right py-4 px-4 text-xs text-white/50 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingBookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-4 px-4 text-sm text-white/70">{booking.id}</td>
                          <td className="py-4 px-4 text-sm text-white">{booking.room}</td>
                          <td className="py-4 px-4 text-sm text-white/70">{booking.date}</td>
                          <td className="py-4 px-4 text-sm text-white/70">{booking.time}</td>
                          <td className="py-4 px-4">{getStatusBadge(booking.status)}</td>
                          <td className="py-4 px-4 text-sm text-white">Ksh {booking.amount.toLocaleString()}</td>
                          <td className="py-4 px-4 text-right">
                            <button className="text-[#E87722] hover:text-white text-sm mr-4 transition-colors">
                              View Details
                            </button>
                            <button className="text-[#C62828] hover:text-white text-sm transition-colors">
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Past Bookings */}
              <div className="bg-[#0F0F0F] border border-white/10 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-white tracking-tight" style={{ fontSize: '24px', lineHeight: '1.2' }}>
                    Past Bookings
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPastBookings(!showPastBookings)}
                    className="text-white/60 hover:text-white hover:bg-white/5 border border-white/10 rounded-none"
                  >
                    {showPastBookings ? (
                      <>Hide History <ChevronUp className="w-4 h-4 ml-2" /></>
                    ) : (
                      <>Show History <ChevronDown className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </div>

                {showPastBookings && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-4 px-4 text-xs text-white/50 uppercase tracking-wider">Booking ID</th>
                          <th className="text-left py-4 px-4 text-xs text-white/50 uppercase tracking-wider">Room</th>
                          <th className="text-left py-4 px-4 text-xs text-white/50 uppercase tracking-wider">Date</th>
                          <th className="text-left py-4 px-4 text-xs text-white/50 uppercase tracking-wider">Time</th>
                          <th className="text-left py-4 px-4 text-xs text-white/50 uppercase tracking-wider">Status</th>
                          <th className="text-left py-4 px-4 text-xs text-white/50 uppercase tracking-wider">Amount</th>
                          <th className="text-right py-4 px-4 text-xs text-white/50 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastBookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-4 px-4 text-sm text-white/70">{booking.id}</td>
                            <td className="py-4 px-4 text-sm text-white">{booking.room}</td>
                            <td className="py-4 px-4 text-sm text-white/70">{booking.date}</td>
                            <td className="py-4 px-4 text-sm text-white/70">{booking.time}</td>
                            <td className="py-4 px-4">{getStatusBadge(booking.status)}</td>
                            <td className="py-4 px-4 text-sm text-white">Ksh {booking.amount.toLocaleString()}</td>
                            <td className="py-4 px-4 text-right">
                              <button className="text-[#E87722] hover:text-white text-sm mr-4 transition-colors">
                                View Details
                              </button>
                              <button className="text-[#E87722] hover:text-white text-sm transition-colors">
                                Leave Feedback
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
          {documentsError ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {documentsError}
            </div>
          ) : null}

          {documentsLoading ? (
            <div className="rounded-xl border border-white/10 bg-[#0F0F0F] p-6 text-sm text-white/60">Loading documents...</div>
          ) : null}

          {!documentsLoading && documents.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#0F0F0F] p-6 text-sm text-white/60">
              No documents uploaded yet.
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {documents.map((documentItem) => (
              <div key={documentItem.id} className="group overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] p-5 transition-all hover:border-[#E87722]/30 hover:shadow-lg hover:shadow-[#E87722]/10">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E87722]/10 text-[#E87722]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{documentItem.documentName}</p>
                      <p className="mt-0.5 text-xs text-white/50">Uploaded: {formatDocumentDate(documentItem.createdAt)}</p>
                    </div>
                  </div>
                  {getStatusBadge(documentItem.status || "PENDING")}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleDownloadDocument(documentItem)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewDocument(documentItem)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(documentItem.id)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 transition-colors hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (activeSection === "checkins") {
      return (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Check-in History</h2>
            <p className="mt-1 text-sm text-white/50">Track your arrival records and access history</p>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Booking ID</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Date</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Time</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {checkins.map((checkin) => (
                    <tr key={`${checkin.bookingId}-${checkin.time}`} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-4 text-sm font-mono text-white/60">{checkin.bookingId}</td>
                      <td className="px-4 py-4 text-sm text-white/70">{checkin.date}</td>
                      <td className="px-4 py-4 text-sm text-white/70">{checkin.time}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E87722]/10 px-3 py-1 text-xs font-medium text-[#E87722]">
                          <CheckCircle className="h-3 w-3" />
                          {checkin.method}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );
    }

    if (activeSection === "payments") {
      return (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Payment History</h2>
            <p className="mt-1 text-sm text-white/50">View your transaction records and invoices</p>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Reference</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Date</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Amount</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Status</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white/70">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.reference} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-4 text-sm font-mono text-white">{payment.reference}</td>
                      <td className="px-4 py-4 text-sm text-white/70">{payment.date}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-white">{payment.amount}</td>
                      <td className="px-4 py-4">{getStatusBadge(payment.status)}</td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-sm font-medium text-[#E87722] transition-colors hover:text-[#f39c4d]">
                          Download Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );
    }

    if (activeSection === "profile") {
      const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.split(" ");
        return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0].toUpperCase();
      };

      if (profileLoading) {
        return (
          <section className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#E87722]/20 border-t-[#E87722]" />
              <p className="mt-4 text-white/50">Loading profile...</p>
            </div>
          </section>
        );
      }

      return (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Profile Settings</h2>
            <p className="mt-1 text-sm text-white/50">Manage your personal information and account details</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] p-6 md:p-8">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#E87722] to-[#d46a1a] text-2xl font-bold text-white shadow-lg shadow-[#E87722]/30">
                {getInitials(profileForm.name)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{profileForm.name || "User"}</h3>
                <p className="text-sm text-white/50">{profileForm.occupation || "No occupation specified"}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-[#2E7D32]/10 px-2 py-0.5 text-xs font-medium text-[#2E7D32]">
                    {profileForm.role}
                  </span>
                  <span className="rounded-full bg-[#2E7D32]/10 px-2 py-0.5 text-xs font-medium text-[#2E7D32]">
                    {profileForm.status}
                  </span>
                </div>
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-white/80">
                    Full Name
                  </label>
                  <input
                    id="name"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all focus:border-[#E87722]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#E87722]/20"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all focus:border-[#E87722]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#E87722]/20"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-white/80">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all focus:border-[#E87722]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#E87722]/20"
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="mb-2 block text-sm font-medium text-white/80">
                    Gender
                  </label>
                  <select
                    id="gender"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-[#E87722]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#E87722]/20"
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="occupation" className="mb-2 block text-sm font-medium text-white/80">
                    Occupation
                  </label>
                  <input
                    id="occupation"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all focus:border-[#E87722]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#E87722]/20"
                    value={profileForm.occupation}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, occupation: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="address" className="mb-2 block text-sm font-medium text-white/80">
                    Address
                  </label>
                  <input
                    id="address"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all focus:border-[#E87722]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#E87722]/20"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="mb-2 block text-sm font-medium text-white/80">
                    City
                  </label>
                  <input
                    id="city"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all focus:border-[#E87722]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#E87722]/20"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Nairobi"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="mb-2 block text-sm font-medium text-white/80">
                    Country
                  </label>
                  <input
                    id="country"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all focus:border-[#E87722]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#E87722]/20"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, country: e.target.value }))}
                    placeholder="e.g. Kenya"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h4 className="mb-4 text-sm font-semibold text-white/80">Account Information</h4>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/50">
                      Account Created
                    </label>
                    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/70">
                      {formatDate(profileForm.createdAt)}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/50">
                      Last Updated
                    </label>
                    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/70">
                      {formatDate(profileForm.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Button type="button" className="rounded-lg bg-[#E87722] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E87722]/20 transition-all hover:bg-[#d46a1a] hover:shadow-[#E87722]/30">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </section>
      );
    }

    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Overview</h2>
          <p className="mt-1 text-sm text-white/50">Your workspace activity at a glance</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article
                key={stat.label}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] p-6 transition-all hover:border-[#E87722]/30 hover:shadow-lg hover:shadow-[#E87722]/10"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-[#E87722]/5 blur-2xl transition-all group-hover:bg-[#E87722]/10" />
                <div className="relative">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#E87722]/10 text-[#E87722] transition-all group-hover:scale-110 group-hover:bg-[#E87722]/15">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-3xl font-bold text-white md:text-4xl">{stat.value}</p>
                  <p className="mt-2 text-sm font-medium text-white/60">{stat.label}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#E87722]">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/booking">
                <button className="flex w-full items-center gap-3 rounded-lg bg-white/5 p-4 text-left text-white transition-all hover:bg-white/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E87722]/10 text-[#E87722]">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Book a Space</p>
                    <p className="text-xs text-white/50">Reserve your next workspace</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-white/30" />
                </button>
              </Link>
              <button
                onClick={() => setActiveSection("documents")}
                className="flex w-full items-center gap-3 rounded-lg bg-white/5 p-4 text-left text-white transition-all hover:bg-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E87722]/10 text-[#E87722]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Upload Documents</p>
                  <p className="text-xs text-white/50">Add credentials or verification files</p>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 text-white/30" />
              </button>
            </div>
          </div>
  const handlePayDeposit = (booking) => {
    const role = (profileForm.role || "").toUpperCase();
    const bookingFee = role === "MEMBER" ? 1000 : 2000;
    navigate("/booking/pay", {
      state: {
        booking,
        bookingFee,
        defaultPhone: profileForm.phoneNumber || "",
        reservationTypeName: booking?.room?.name || "Room booking",
      },
    });
  };

  const sectionContent = {
    metrics: (
      <MetricsSection
        stats={stats}
        upcomingBookings={upcomingBookings}
        bookingsLoading={bookingsLoading}
        bookingsError={bookingsError}
        onNavigateSection={setActiveSection}
      />
    ),
    bookings: (
      <BookingsSection
        bookings={myBookings}
        loading={bookingsLoading}
        error={bookingsError}
        onPayDeposit={handlePayDeposit}
      />
    ),
    documents: (
      <DocumentsSection
        documents={docs.documents}
        documentsLoading={docs.documentsLoading}
        documentsError={docs.documentsError}
        documentName={docs.documentName}
        setDocumentName={docs.setDocumentName}
        documentFile={docs.documentFile}
        setDocumentFile={docs.setDocumentFile}
        uploadingDocument={docs.uploadingDocument}
        onUpload={docs.handleUploadDocument}
        onDelete={docs.handleDeleteDocument}
        onDownload={docs.handleDownloadDocument}
        onView={docs.handleViewDocument}
      />
    ),
    checkins: (
      <CheckinsSection
        checkins={checkins}
        loading={checkinsLoading}
        error={checkinsError}
      />
    ),
    payments: (
      <PaymentsSection
        payments={myPayments}
        loading={paymentsLoading}
        error={paymentsError}
      />
    ),
    profile: (
      <ProfileSection
        profileForm={profileForm}
        profileLoading={profileLoading}
        onUpdateField={updateField}
      />
    ),
  };

            {/* Right rail: Reviews (visible on all screens, flows below on mobile) */}
            <div className="lg:col-span-1">
              <div className="top-22.5">
                <ReviewsPanel />
              </div>
            </div>
  return (
    <div className="min-h-screen bg-[#0F1A2E]">
      <DashboardHeader
        profileForm={profileForm}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      <div className="flex">
        <DashboardSidebar
          activeSection={activeSection}
          onSelect={setActiveSection}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1 p-4 md:p-6">
          {sectionContent[activeSection]}
        </main>
      </div>
    </div>
  );
}