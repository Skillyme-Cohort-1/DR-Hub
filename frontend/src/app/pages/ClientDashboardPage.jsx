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
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  const { profileForm, profileLoading, updateField } = useProfile();
  const { myBookings, bookingsLoading, bookingsError, upcomingBookings, stats } = useBookings();
  const { myPayments, paymentsLoading, paymentsError } = usePayments();
  const docs = useDocuments();
  const { checkins, checkinsLoading, checkinsError } = useCheckins();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const handlePayDeposit = (booking) => {
    const role       = (profileForm.role || "").toUpperCase();
    const bookingFee = role === "MEMBER" ? 1000 : 2000;
    navigate("/booking/pay", {
      state: {
        booking,
        bookingFee,
        defaultPhone:        profileForm.phoneNumber || "",
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

  return (
    <div className="min-h-screen bg-background text-foreground">
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