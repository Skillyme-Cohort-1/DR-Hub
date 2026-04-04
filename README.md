# 🏛️ DR Hub — Office Hire Digital Platform

> **SkillyMe Cohort 1 · Week 2 Submission**
> Built by **Code Titans**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📌 What We Built

The **DR Hub Office Hire System** is a complete digital booking and operations platform for [The Dispute Resolution Hub](https://drhub.fullcirclecentre.com/) — a community of dispute resolution practitioners (lawyers, mediators, ADR practitioners) based in Nairobi, Kenya.

DR Hub currently manages all office bookings manually — through calls, WhatsApp messages, and spreadsheets. This causes double bookings, admin overload, and zero visibility into business performance.

**Our system replaces this with two connected digital platforms:**

- 🌐 **Client-Facing Website** — where lawyers and ADR practitioners browse, book, and pay for office spaces
- 🖥️ **Admin Dashboard** — where DR Hub staff manage bookings, track clients, view analytics, and stay on top of operations

---

## 👥 Team — Code Titans

> *"We build systems that scale."*

| Name | 
|------|
| **David Dage** | Team Lead |
| **Breattah Okeyo** |
| **Isaac Kahura** | 
| **William Githinji** | 
| **Willis Otieno** | 

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│              CLIENT-FACING WEBSITE                   │
│         (Lawyers & ADR Practitioners)                │
│   Landing Page → Login → Browse → Book → Confirm    │
└───────────────────────┬─────────────────────────────┘
                        │  HTTP Requests (Week 3)
┌───────────────────────▼─────────────────────────────┐
│              BACKEND API — Node.js + Express         │
│      Booking logic · Validation · Scheduling         │
└───────────────────────┬─────────────────────────────┘
                        │  SQL Queries (Week 3)
┌───────────────────────▼─────────────────────────────┐
│              DATABASE — PostgreSQL                   │
│   Bookings · Clients · Rooms · Pricing Rules         │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│              ADMIN DASHBOARD                         │
│            (DR Hub Staff — Internal)                 │
│   Manage bookings · Schedule · Analytics · Leads     │
└─────────────────────────────────────────────────────┘
```

> **Week 2 scope:** Full frontend built and functional with mock data.
> **Week 3:** Backend API + PostgreSQL database integration.

---

## ⚡ Tech Stack

### Client Side 
| Tool | Purpose |
|------|---------|
| **React.js / JavaScript** | UI framework |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **React Router** | Navigation and multi-page routing |
| **tw-animate-css** | Animation utilities |

### Admin Side 
| Tool | Purpose |
|------|---------|
| **React.js / JavaScript** | UI framework |
| **Vite** | Build tool and dev server |
| **Vanilla CSS** | Custom design system (CSS-in-JS) |
| **React useState** | State management |

### Backend (Week 3)
| Tool | Purpose |
|------|---------|
| **Node.js + Express** | REST API server |
| **PostgreSQL** | Relational database |

---

## 🖥️ Features Built — 

### 🌐 Client Side
- **Landing Page** — DR Hub branding, services overview, amenities, Call-to-Action
- **Login Page** — Authentication UI
- **Booking Interface** — Room selector, date picker, 3-slot time selection
- **Dynamic Pricing Display** — Updates in real time based on room, day, and membership status
- **Booking Flow** — Room → Date → Time → Form → Confirmation
- **Pricing Page** — Full pricing table with member vs non-member rates

### 🖥️ Admin Dashboard
- **Overview** — Live stats (total bookings, revenue, pending approvals, members)
- **Bookings Management** — Full table with search, filter, approve/reject actions
- **Room Calendar** — Weekly grid showing all rooms & time slots, colour-coded by status
- **Client Directory** — All clients with booking count and total spend
- **Notifications** — Auto-flags pending approvals, unpaid fees, missing documents
- **Analytics** — Revenue bar chart, booking status breakdown, room utilisation
- **Feedback** — Client reviews after completed sessions
- **Lead Pipeline** — New → Follow-up → Converted tracking
- **New Booking Modal** — Full form with live double-booking prevention
- **Booking Detail Modal** — View client info, doc status, fee status, approve/reject

---

## 💰 Pricing Logic

| Booking Type | Time | Rate |
|---|---|---|
| DR Hub Member (flat rate) | Weekday — Private Office | Ksh 2,000 / 4hrs |
| Boardroom (1–6 pax) | Weekday | Ksh 2,500 / 3hrs |
| Boardroom (1–6 pax) | Weekday Evening (5–8pm) | Ksh 4,000 / 3hrs |
| Private Office (1–3 pax) | Weekday | Ksh 6,000 / 3hrs |
| Private Office (1–3 pax) | Weekday Evening (5–8pm) | Ksh 7,000 / 3hrs |
| Private Office + Boardroom (1–10 pax) | Weekday (10am–5pm) | Ksh 7,500 / 3hrs |
| Office or Boardroom | Weekend (10am–5pm) | Ksh 3,000 flat |

**Booking Rules:**
- Time slots are fixed: **10am–1pm · 2pm–5pm · 5pm–8pm**
- Weekend bookings limited to **10am–5pm** (no evening slot)
- All new clients must upload **proof of professional qualification**
- **Ksh 1,000 non-refundable booking fee** required to confirm any reservation

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm

### Admin Dashboard

```bash
# Clone the repository
git clone https://github.com/Skillyme-Cohort-1/DR-Hub.git

# Navigate to admin frontend
cd DR-Hub/admin-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Opens at **http://localhost:5173**

### Client Side

```bash
# Navigate to client frontend
cd DR-Hub/client-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Opens at **http://localhost:5174**

---

## 📁 Project Structure

```
DR-Hub/
│
├── frontend/                          ← Client-facing website (David Dage)
│   ├── public/
│   └── src/
│       ├── app/
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   │   ├── button.jsx
│       │   │   │   ├── input.jsx
│       │   │   │   ├── label.jsx
│       │   │   │   ├── switch.jsx
│       │   │   │   ├── tabs.jsx
│       │   │   │   └── utils.jsx
│       │   │   ├── Footer.jsx
│       │   │   ├── Logo.jsx
│       │   │   └── Navbar.jsx
│       │   └── pages/
│       │       ├── BookingPage.jsx
│       │       ├── ClientDashboardPage.jsx
│       │       ├── ConfirmationPage.jsx
│       │       ├── HomePage.jsx
│       │       ├── LoginPage.jsx
│       │       ├── NotFound.jsx
│       │       └── PaymentPage.jsx
│       ├── assets/
│       │   ├── hero.png
│       │   ├── react.svg
│       │   └── vite.svg
│       ├── styles/
│       │   ├── fonts.css
│       │   ├── index.css
│       │   ├── tailwind.css
│       │   └── theme.css
│       ├── App.css
│       ├── App.jsx
│       └── main.jsx
│
├── admin-frontend/                    ← Admin dashboard (Breattah Okeyo)
│   └── src/
│       ├── components/
│       │   ├── AnalyticsPanel.jsx
│       │   ├── BookingsTable.jsx
│       │   ├── CalendarPanel.jsx
│       │   ├── LeadsPanel.jsx
│       │   ├── Sidebar.jsx
│       │   ├── StatsRow.jsx
│       │   └── Topbar.jsx
│       ├── data/
│       │   └── mockData.js
│       ├── pages/
│       │   ├── AdminDashboard.jsx
│       │   └── Dashboard.jsx
│       ├── App.jsx
│       └── main.jsx
│
├── docs/                              ← Project documentation
│   ├── system-architecture.md
│   ├── contribution-report.md
│   └── api-plan.md
│
└── README.md                          ← you are here
```

---

## 🔑 Critical Business Logic

### Double Booking Prevention
When creating a new booking the system checks if the selected room is already booked for that date and time slot. If a conflict is found the booking is blocked and an error is shown — no two clients can occupy the same room at the same time.

### Slot-Based Booking
Only three fixed time slots are available — **10am–1pm**, **2pm–5pm**, **5pm–8pm**. No custom times are accepted.

### Role-Based Access
- **Clients** interact with the booking website
- **Admins** access the management dashboard via a separate interface

### Booking Validation
A booking is only confirmed after all three conditions are met:
1. ✅ Slot is available (no conflict)
2. ✅ Proof of qualification uploaded
3. ✅ Ksh 1,000 booking fee paid

---

## ✅ Completed 

- [x] Full admin dashboard — 9 working views
- [x] Live approve/reject booking functionality
- [x] Double-booking prevention logic
- [x] Dynamic pricing calculator
- [x] Room availability calendar
- [x] Client-facing landing page
- [x] Login page UI
- [x] Booking flow UI (client side)
- [x] Mobile responsiveness (admin — fixed and rebased)
- [x] Git branching workflow (feature branches + PRs)

## 🔄 — Coming Next

- [ ] Backend API — Node.js + Express
- [ ] PostgreSQL database integration
- [ ] Server-side double-booking prevention
- [ ] Document upload to cloud storage
- [ ] M-Pesa / payment gateway integration
- [ ] Automated email/SMS notifications
- [ ] Connect client side and admin side via shared API

---

## 🔗 Links

- **GitHub Repository:** https://github.com/Skillyme-Cohort-1/DR-Hub
- **Live Demo:** Coming soon — deployment in Week 3

---

## 📝 Individual Contributions

| Team Member | What They Built |
|---|---|
| David Dage | Client-side website — booking interface, pricing display, React Router navigation, Tailwind styling |
| Breattah Okeyo | Admin dashboard — all 9 management views, booking modals, double-booking prevention, calendar, analytics |
| Isaac Kahura | Landing page — DR Hub branding, hero section, services, amenities, pricing overview |
| Willis Otieno | Login & authentication page — form UI and validation |
| William Githinji| Booking flow |


---

*Code Titans · SkillyMe Cohort 1 · 2026*
*"We build systems that scale."*
