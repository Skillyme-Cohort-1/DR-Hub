import { useState } from 'react';
import { Link } from 'react-router-dom';
// import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Calendar, Clock, TrendingUp, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ReviewsPanel from '../components/ReviewsPanel';

export function ClientDashboard() {
  const [showPastBookings, setShowPastBookings] = useState(false);

  const stats = [
    { label: 'Total Bookings', value: '12', icon: Calendar, trend: '+2 this month' },
    { label: 'Upcoming Sessions', value: '3', icon: Clock, trend: 'Next: Tomorrow' },
    { label: 'Completed', value: '8', icon: CheckCircle, trend: '100% attendance' },
    { label: 'Total Spent', value: 'Ksh 42K', icon: TrendingUp, trend: 'Member savings: 4.2K' },
  ];

  const upcomingBookings = [
    {
      id: 'DRH-20250401-001',
      room: 'Boardroom',
      date: 'Apr 1, 2025',
      time: '10:00am – 1:00pm',
      status: 'confirmed',
      amount: 4500,
    },
    {
      id: 'DRH-20250405-002',
      room: 'Private Office',
      date: 'Apr 5, 2025',
      time: '2:00pm – 5:00pm',
      status: 'pending',
      amount: 3000,
    },
    {
      id: 'DRH-20250410-003',
      room: 'Combined Space',
      date: 'Apr 10, 2025',
      time: '10:00am – 1:00pm',
      status: 'confirmed',
      amount: 6000,
    },
  ];

  const pastBookings = [
    {
      id: 'DRH-20250315-001',
      room: 'Boardroom',
      date: 'Mar 15, 2025',
      time: '10:00am – 1:00pm',
      status: 'completed',
      amount: 4500,
    },
    {
      id: 'DRH-20250310-002',
      room: 'Private Office',
      date: 'Mar 10, 2025',
      time: '2:00pm – 5:00pm',
      status: 'completed',
      amount: 3000,
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20',
      pending: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
      completed: 'bg-white/5 text-white/50 border-white/10',
      cancelled: 'bg-[#C62828]/10 text-[#C62828] border-[#C62828]/20',
    };

    const labels = {
      confirmed: 'Confirmed',
      pending: 'Pending',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };

    return (
      <span className={`px-3 py-1 text-xs border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
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
          </div>

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
            </div>

            {/* Right rail: Reviews (visible on all screens, flows below on mobile) */}
            <div className="lg:col-span-1">
              <div className="top-22.5">
                <ReviewsPanel />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}