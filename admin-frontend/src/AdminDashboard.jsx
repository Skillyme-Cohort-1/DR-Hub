import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { useTheme } from "./context/ThemeContext.jsx";
import { ToastProvider, useToast } from "./context/ToastContext.jsx";
import { useBookings } from "./hooks/useBookings";
import { useUsers } from "./hooks/useUsers";
import { useSlots } from "./hooks/useSlots";
import { useLeads } from "./hooks/useLeads";
import { useRooms } from "./hooks/useRooms";
import { useAttendances } from "./hooks/useAttendances";
import { useCalendarData } from "./hooks/useCalendarData";
import { SIDEBAR_BREAKPOINT } from "./utils/helpers";
import { apiFetch } from "./config/api";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Modal from "./components/Modal.jsx";
import Overview from "./pages/Overview.jsx";
import BookingsPage from "./pages/BookingsPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import ClientsPage from "./pages/ClientsPage.jsx";
import ClientDetails from "./pages/ClientDetails.jsx";
import BookingDetails from "./pages/BookingDetails.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import RoomsPage from "./pages/RoomsPage.jsx";
import RoomDetails from "./pages/RoomDetails.jsx";
import LeadsPage from "./pages/LeadsPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import AttendancesPage from "./pages/AttendancesPage.jsx";
import "./styles/dashboard.css";

function DashboardContent() {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const addToast = useToast();

  // Navigation
  const [activeNav, setActiveNav] = useState("overview");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < SIDEBAR_BREAKPOINT : false
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Booking creation modal (shared across overview + calendar)
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Data hooks
  const { bookings, setBookings, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } =
    useBookings(token);
  const { allSlots } = useSlots(token);
  const needUsers =
    activeNav === "users" || activeNav === "clients" || activeNav === "client-details" || showBookingModal;
  const { users, loading: usersLoading, error: usersError, reload: reloadUsers } = useUsers(token, needUsers);
  const { leads, setLeads, loading: leadsLoading, error: leadsError } = useLeads(token, activeNav === "leads");
  const { rooms, loading: roomsLoading, fetchRooms, createRoom, updateRoom, deleteRoom } = useRooms(token);
  const { attendances, loading: attendancesLoading, refetch: refetchAttendances } = useAttendances(token, activeNav === "attendances");
  const { calendarDays, calendarSlots, calendarRooms, getCalSlot } = useCalendarData(bookings, allSlots);

  // Page-specific state
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingDetailId, setBookingDetailId] = useState(null);
  const [newBooking, setNewBooking] = useState(resetBookingDraft());
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Responsive breakpoint
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${SIDEBAR_BREAKPOINT - 1}px)`);
    const sync = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setMobileMenuOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Derived values
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const newLeadsCount = leads.filter((l) => l.stage === "new").length;
  const memberUserOptions = users.filter((u) => String(u.role || "").toUpperCase() === "MEMBER");

  // Navigation handlers
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleSidebar = () => {
    if (isMobile) setMobileMenuOpen((o) => !o);
    else setSidebarCollapsed((c) => !c);
  };
  const pickNav = (id) => {
    setActiveNav(id);
    if (isMobile) closeMobileMenu();
  };

  const openBookingDetails = (id) => {
    setBookingDetailId(id);
    setActiveNav("booking-details");
  };
  const openBookingFromSlot = (slot) => {
    setNewBooking((p) => ({
      ...p,
      room: slot.roomName || "",
      roomId: slot.roomId || "",
      roomCapacity: slot.roomCapacity || "",
      slot: slot.slotTitle || "",
      slotId: slot.slotId || "",
      date: slot.isoDate || "",
      amount: slot.cost || "",
    }));
    setShowBookingModal(true);
  };
  const openRoomDetails = (room) => {
    setSelectedRoom(room);
    setActiveNav("room-details");
  };
  const selectClient = (client) => {
    setSelectedClient(client);
    setActiveNav("client-details");
  };

  // Booking creation
  const submitNewBooking = async () => {
    if (
      !newBooking.userId ||
      !newBooking.roomId ||
      !newBooking.slotId ||
      !newBooking.date ||
      !newBooking.amount ||
      !newBooking.numberOfAttendees
    ) {
      addToast("Client, slot, date, amount and attendees are required.", "red", "!");
      return;
    }
    const count = Number(newBooking.numberOfAttendees);
    const cap = Number(newBooking.roomCapacity);
    if (Number.isFinite(cap) && cap > 0 && count > cap) {
      addToast(`Attendees cannot exceed room capacity (${cap}).`, "red", "!");
      return;
    }
    setBookingSubmitting(true);
    try {
      const data = await apiFetch("/api/bookings/admin-user", {
        token,
        method: "POST",
        body: {
          roomId: newBooking.roomId,
          slotId: newBooking.slotId,
          userId: newBooking.userId,
          bookingDate: newBooking.date,
          totalCost: Number(newBooking.amount),
          numberOfAttendees: count,
        },
      });
      addToast(data.message || "Booking created successfully.", "green", "\u2713");
      setShowBookingModal(false);
      setNewBooking(resetBookingDraft());
      refetchBookings();
    } catch (err) {
      addToast(err.message || "Could not reach the bookings API.", "red", "\u2717");
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="dh-wrap" data-theme={theme}>
      <Sidebar
        isMobile={isMobile}
        sidebarCollapsed={sidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        activeNav={activeNav}
        pickNav={pickNav}
        closeMobileMenu={closeMobileMenu}
        pendingCount={pendingCount}
        newLeadsCount={newLeadsCount}
        user={user}
      />

      <main className="dh-main">
        <Topbar
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          activeNav={activeNav}
          pendingCount={pendingCount}
          bookings={bookings}
          theme={theme}
          toggleTheme={toggleTheme}
          logout={logout}
        />

        <div className="dh-content">
          {activeNav === "overview" && (
            <Overview
              bookings={bookings}
              setBookings={setBookings}
              token={token}
              calendarDays={calendarDays}
              calendarSlots={calendarSlots}
              calendarRooms={calendarRooms}
              getCalSlot={getCalSlot}
              onNavigate={pickNav}
              onOpenBookingDetails={openBookingDetails}
              onOpenBookingFromSlot={openBookingFromSlot}
            />
          )}
          {activeNav === "bookings" && (
            <BookingsPage
              bookings={bookings}
              setBookings={setBookings}
              token={token}
              loading={bookingsLoading}
              error={bookingsError}
              onOpenBookingDetails={openBookingDetails}
            />
          )}
          {activeNav === "calendar" && (
            <CalendarPage
              bookings={bookings}
              calendarDays={calendarDays}
              calendarSlots={calendarSlots}
              calendarRooms={calendarRooms}
              getCalSlot={getCalSlot}
              onOpenBookingDetails={openBookingDetails}
              onOpenBookingFromSlot={openBookingFromSlot}
            />
          )}
          {activeNav === "clients" && (
            <ClientsPage
              users={users}
              usersLoading={usersLoading}
              usersError={usersError}
              onSelectClient={selectClient}
            />
          )}
          {activeNav === "client-details" && (
            <ClientDetails
              client={selectedClient}
              bookings={bookings}
              token={token}
              onBack={() => setActiveNav("clients")}
            />
          )}
          {activeNav === "booking-details" && (
            <BookingDetails
              bookingId={bookingDetailId}
              token={token}
              setBookings={setBookings}
              onBack={() => setActiveNav("bookings")}
            />
          )}
          {activeNav === "users" && (
            <UsersPage
              users={users}
              usersLoading={usersLoading}
              usersError={usersError}
              token={token}
              onReload={reloadUsers}
            />
          )}
          {activeNav === "rooms" && (
            <RoomsPage
              rooms={rooms}
              roomsLoading={roomsLoading}
              fetchRooms={fetchRooms}
              createRoom={createRoom}
              updateRoom={updateRoom}
              deleteRoom={deleteRoom}
              token={token}
              onOpenRoomDetails={openRoomDetails}
            />
          )}
          {activeNav === "room-details" && (
            <RoomDetails room={selectedRoom} token={token} onBack={() => setActiveNav("rooms")} />
          )}
          {activeNav === "leads" && (
            <LeadsPage
              leads={leads}
              setLeads={setLeads}
              leadsLoading={leadsLoading}
              leadsError={leadsError}
              token={token}
            />
          )}
          {activeNav === "notifications" && (
            <NotificationsPage bookings={bookings} setBookings={setBookings} token={token} />
          )}
          {activeNav === "analytics" && (
            <AnalyticsPage bookings={bookings} calendarRooms={calendarRooms} />
          )}
          {activeNav === "attendances" && (
            <AttendancesPage attendances={attendances} loading={attendancesLoading} token={token} refetch={refetchAttendances} />
          )}
        </div>
      </main>

      {/* Booking Creation Modal (shared across Calendar + Overview) */}
      {showBookingModal && (
        <Modal
          title="New Booking"
          onClose={() => {
            setShowBookingModal(false);
            setNewBooking(resetBookingDraft());
          }}
          footer={
            <>
              <button
                className="dh-btn-cancel"
                onClick={() => {
                  setShowBookingModal(false);
                  setNewBooking(resetBookingDraft());
                }}
              >
                Cancel
              </button>
              <button className="dh-btn-primary" onClick={submitNewBooking} disabled={bookingSubmitting}>
                {bookingSubmitting ? "Creating..." : "Create Booking"}
              </button>
            </>
          }
        >
          <div className="dh-form-row">
            <div className="dh-form-group">
              <label>Client *</label>
              <select
                value={newBooking.userId}
                onChange={(e) => {
                  const u = memberUserOptions.find((m) => String(m.id) === String(e.target.value));
                  setNewBooking((p) => ({ ...p, userId: e.target.value, name: u?.name || "" }));
                }}
              >
                <option value="">Select client</option>
                {memberUserOptions
                  .filter((u) => u.status === "APPROVED")
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.email || m.id}
                    </option>
                  ))}
              </select>
            </div>
            <div className="dh-form-group">
              <label>Number of Attendees *</label>
              <input
                type="number"
                min="1"
                max={newBooking.roomCapacity || undefined}
                value={newBooking.numberOfAttendees}
                onChange={(e) => setNewBooking((p) => ({ ...p, numberOfAttendees: e.target.value }))}
              />
            </div>
          </div>
          <div className="dh-form-row">
            <div className="dh-form-group">
              <label>Room</label>
              <input value={newBooking.room || "-"} readOnly />
            </div>
            <div className="dh-form-group">
              <label>Time Slot</label>
              <input value={newBooking.slot || "-"} readOnly />
            </div>
          </div>
          <div className="dh-form-row">
            <div className="dh-form-group">
              <label>Date</label>
              <input value={newBooking.date || "-"} readOnly />
            </div>
            <div className="dh-form-group">
              <label>Total Cost (Ksh)</label>
              <input value={newBooking.amount || "-"} readOnly />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function resetBookingDraft() {
  return {
    name: "",
    userId: "",
    room: "",
    roomId: "",
    roomCapacity: "",
    date: "",
    slot: "",
    slotId: "",
    amount: "",
    payment: "pending",
    numberOfAttendees: 1,
  };
}

export default function AdminDashboard() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}