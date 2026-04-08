import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "./config/api";
import { useAuth } from "./context/AuthContext.jsx";
import Rooms from './pages/Rooms';

const SIDEBAR_BREAKPOINT = 960;

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const INITIAL_BOOKINGS = [
  { id: "BK001", name: "Jane Mwangi",    initials: "JM", color: "#6c63ff", type: "ADR Practitioner", room: "Private Office", roomIcon: "🏛️", date: "2026-04-01", slot: "10am–1pm", amount: 6000,  status: "pending",   payment: "paid",    doc: true  },
  { id: "BK002", name: "David Kamau",    initials: "DK", color: "#059669", type: "Young Advocate",   room: "Boardroom",      roomIcon: "📋", date: "2026-04-01", slot: "2pm–5pm",  amount: 2500,  status: "confirmed", payment: "paid",    doc: true  },
  { id: "BK003", name: "Amina Ochieng",  initials: "AO", color: "#F07B2B", type: "DR Hub Member",    room: "Private Office", roomIcon: "🏛️", date: "2026-04-02", slot: "10am–1pm", amount: 2000,  status: "confirmed", payment: "paid",    doc: true  },
  { id: "BK004", name: "Brian Njoroge",  initials: "BN", color: "#3B82F6", type: "ADR Practitioner", room: "Combined",       roomIcon: "⚖️",  date: "2026-04-02", slot: "2pm–5pm",  amount: 7500,  status: "pending",   payment: "pending", doc: true  },
  { id: "BK005", name: "Faith Wanjiku",  initials: "FW", color: "#7C3AED", type: "Young Advocate",   room: "Boardroom",      roomIcon: "📋", date: "2026-04-03", slot: "5pm–8pm",  amount: 4000,  status: "completed", payment: "paid",    doc: true  },
  { id: "BK006", name: "Samuel Mutua",   initials: "SM", color: "#EC4899", type: "ADR Practitioner", room: "Private Office", roomIcon: "🏛️", date: "2026-04-03", slot: "10am–1pm", amount: 6000,  status: "pending",   payment: "paid",    doc: false },
  { id: "BK007", name: "Lydia Ndungu",   initials: "LN", color: "#0891b2", type: "DR Hub Member",    room: "Boardroom",      roomIcon: "📋", date: "2026-04-04", slot: "2pm–5pm",  amount: 2000,  status: "confirmed", payment: "paid",    doc: true  },
  { id: "BK008", name: "Peter Otieno",   initials: "PO", color: "#16a34a", type: "Young Advocate",   room: "Combined",       roomIcon: "⚖️",  date: "2026-04-04", slot: "10am–1pm", amount: 7500,  status: "rejected",  payment: "pending", doc: true  },
];

const INITIAL_LEADS = [
  { id: 1, name: "Samuel Mutua",  initials: "SM", color: "#6c63ff", stage: "new",       phone: "+254 712 111 222", note: "" },
  { id: 2, name: "Lydia Ndungu",  initials: "LN", color: "#F07B2B", stage: "follow-up", phone: "+254 723 333 444", note: "Called twice, interested in boardroom" },
  { id: 3, name: "Peter Otieno",  initials: "PO", color: "#22C55E", stage: "converted", phone: "+254 734 555 666", note: "Booked Private Office for April" },
  { id: 4, name: "Grace Akinyi",  initials: "GA", color: "#3B82F6", stage: "new",       phone: "+254 745 777 888", note: "" },
];

const SLOTS = ["10am–1pm", "2pm–5pm", "5pm–8pm"];
const ROOMS = ["Private Office", "Boardroom", "Combined"];
const DAYS  = ["Mon 30 Mar", "Tue 31 Mar", "Wed 1 Apr", "Thu 2 Apr", "Fri 3 Apr"];
const DUMMY_CLIENT_BOOKINGS = [
  { id: "BK901", room: "Private Office", date: "2026-04-10", slot: "10am–1pm", status: "confirmed", amount: 6000 },
  { id: "BK902", room: "Boardroom", date: "2026-04-14", slot: "2pm–5pm", status: "pending", amount: 2500 },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
  .dh-wrap * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }
  .dh-wrap { display: flex; width: 100%; min-height: 100vh; min-height: 100dvh; background: #0a0a0a; color: #F0EDE8; overflow: hidden; font-size: 13px; }

  /* SIDEBAR */
  .dh-sidebar { width: 248px; flex-shrink: 0; background: linear-gradient(180deg, #141414 0%, #101010 100%); border-right: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; transition: width 0.22s ease, transform 0.28s cubic-bezier(0.4, 0, 0.2, 1); z-index: 100; }
  .dh-sidebar--collapsed { width: 72px; }
  .dh-sidebar--collapsed .dh-logo-the,
  .dh-sidebar--collapsed .dh-logo-badge,
  .dh-sidebar--collapsed .dh-nav-label,
  .dh-sidebar--collapsed .dh-nav-text,
  .dh-sidebar--collapsed .dh-user-info { display: none !important; }
  .dh-sidebar--collapsed .dh-logo-dr { font-size: 17px; letter-spacing: -0.5px; }
  .dh-sidebar--collapsed .dh-logo { padding: 20px 12px; text-align: center; }
  .dh-sidebar--collapsed .dh-nav-item { justify-content: center; padding: 11px 10px; gap: 0; }
  .dh-sidebar--collapsed .dh-nav-count { position: absolute; top: 4px; right: 2px; margin: 0; min-width: 16px; height: 16px; padding: 0 4px; font-size: 9px; display: flex; align-items: center; justify-content: center; }
  .dh-sidebar--collapsed .dh-nav-item { position: relative; }
  .dh-sidebar--collapsed .dh-user { justify-content: center; padding: 14px 10px; }
  .dh-sidebar-backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 90; backdrop-filter: blur(2px); }
  .dh-sidebar-backdrop--visible { display: block; }
  .dh-logo { padding: 24px 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .dh-logo-the { font-size: 10px; letter-spacing: 3px; color: #888; text-transform: uppercase; }
  .dh-logo-dr { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; line-height: 1; }
  .dh-logo-dr span { color: #F07B2B; }
  .dh-logo-badge { display: inline-block; background: rgba(240,123,43,0.12); color: #F07B2B; font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 3px 8px; border-radius: 2px; margin-top: 6px; border: 1px solid rgba(240,123,43,0.2); }
  .dh-nav { flex: 1; padding: 16px 10px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
  .dh-nav-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #555; padding: 10px 10px 4px; font-weight: 600; }
  .dh-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer; color: #888; font-size: 12px; font-weight: 500; border: 1px solid transparent; transition: all 0.15s; width: 100%; text-align: left; background: transparent; font-family: inherit; }
  .dh-nav-ico { font-size: 15px; line-height: 1; flex-shrink: 0; width: 22px; text-align: center; }
  .dh-nav-text { flex: 1; min-width: 0; }
  .dh-nav-item:hover { background: rgba(255,255,255,0.04); color: #F0EDE8; }
  .dh-nav-item.active { background: rgba(240,123,43,0.12); color: #F07B2B; border-color: rgba(240,123,43,0.15); }
  .dh-nav-count { margin-left: auto; background: #F07B2B; color: #fff; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 20px; }
  .dh-user { padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 10px; }
  .dh-av { width: 32px; height: 32px; border-radius: 50%; background: #F07B2B; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0; }

  /* MAIN */
  .dh-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; background: #0a0a0a; }
  .dh-topbar { padding: 14px 20px 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; background: rgba(18,18,18,0.92); backdrop-filter: blur(12px); flex-shrink: 0; gap: 12px; }
  .dh-topbar-left { display: flex; align-items: flex-start; gap: 12px; min-width: 0; flex: 1; }
  .dh-menu-toggle { flex-shrink: 0; width: 40px; height: 40px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #F0EDE8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: background 0.15s, border-color 0.15s; }
  .dh-menu-toggle:hover { background: rgba(240,123,43,0.12); border-color: rgba(240,123,43,0.35); }
  .dh-menu-toggle:focus-visible { outline: 2px solid #F07B2B; outline-offset: 2px; }
  .dh-topbar-titles { min-width: 0; }
  .dh-topbar h1 { font-size: clamp(15px, 2.5vw, 18px); font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; }
  .dh-topbar p { font-size: 11px; color: #888; margin-top: 3px; }
  .dh-topbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
  .dh-chip { background: #1E1E1E; border: 1px solid rgba(255,255,255,0.07); border-radius: 6px; padding: 7px 12px; font-size: 11px; color: #888; }
  .dh-notif { width: 34px; height: 34px; background: #1E1E1E; border: 1px solid rgba(255,255,255,0.07); border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; position: relative; transition: border-color 0.2s; }
  .dh-notif:hover { border-color: #F07B2B; }
  .dh-notif-dot { position: absolute; top: 5px; right: 5px; width: 7px; height: 7px; background: #F07B2B; border-radius: 50%; border: 1.5px solid #161616; }
  .dh-btn-primary { background: #F07B2B; color: #fff; padding: 8px 16px; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
  .dh-btn-primary:hover { background: #fff; color: #F07B2B; }

  /* CONTENT */
  .dh-content { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 20px 20px 28px; width: 100%; max-width: none; }
  .dh-content::-webkit-scrollbar { width: 4px; }
  .dh-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

  /* STATS */
  .dh-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 22px; }
  .dh-stat { background: #1E1E1E; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 20px; cursor: default; transition: border-color 0.2s; }
  .dh-stat:hover { border-color: rgba(255,255,255,0.15); }
  .dh-stat-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .dh-stat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; }
  .dh-stat-num { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
  .dh-stat-label { font-size: 11px; color: #888; }
  .dh-badge-up { background: rgba(34,197,94,0.12); color: #22C55E; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; }
  .dh-badge-warn { background: rgba(245,158,11,0.12); color: #F59E0B; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; }

  /* PANELS */
  .dh-grid2 { display: grid; grid-template-columns: 1.55fr 1fr; gap: 18px; margin-bottom: 18px; align-items: stretch; }
  .dh-grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-bottom: 18px; }
  .dh-leads-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; padding: 20px; }
  .dh-panel { background: #1E1E1E; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; overflow: hidden; }
  .dh-panel-hd { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; justify-content: space-between; align-items: center; }
  .dh-panel-title { font-size: 13px; font-weight: 600; }
  .dh-panel-sub { font-size: 11px; color: #888; margin-top: 2px; }
  .dh-panel-link { font-size: 11px; color: #F07B2B; cursor: pointer; font-weight: 500; background: none; border: none; transition: opacity 0.2s; }
  .dh-panel-link:hover { opacity: 0.7; }

  /* TABLE */
  .dh-table-wrap { overflow-x: auto; }
  table.dh-table { width: 100%; border-collapse: collapse; }
  .dh-table thead th { padding: 9px 14px; text-align: left; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: #888; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.07); white-space: nowrap; }
  .dh-table tbody tr { border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s; cursor: pointer; }
  .dh-table tbody tr:last-child { border-bottom: none; }
  .dh-table tbody tr:hover { background: rgba(255,255,255,0.02); }
  .dh-table td { padding: 11px 14px; vertical-align: middle; }
  .dh-client-cell { display: flex; align-items: center; gap: 9px; }
  .dh-cav { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0; }
  .dh-cname { font-weight: 600; font-size: 12px; }
  .dh-ctype { font-size: 10px; color: #888; }
  .dh-room-chip { display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07); border-radius: 4px; padding: 3px 8px; font-size: 11px; font-weight: 600; white-space: nowrap; }
  .dh-slot-badge { font-size: 10px; color: #888; background: rgba(255,255,255,0.04); padding: 3px 7px; border-radius: 4px; white-space: nowrap; }
  .dh-amount { font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700; color: #F07B2B; }
  .dh-status { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
  .dh-status::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
  .s-confirmed { background: rgba(34,197,94,0.12); color: #22C55E; }
  .s-pending   { background: rgba(245,158,11,0.12); color: #F59E0B; }
  .s-rejected  { background: rgba(239,68,68,0.12);  color: #EF4444; }
  .s-completed { background: rgba(59,130,246,0.12);  color: #3B82F6; }
  .dh-actions { display: flex; gap: 5px; }
  .dh-action-btn { padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 600; cursor: pointer; border: 1px solid; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
  .btn-approve { background: rgba(34,197,94,0.12); border-color: rgba(34,197,94,0.2); color: #22C55E; }
  .btn-approve:hover { background: #22C55E; color: #fff; border-color: #22C55E; }
  .btn-reject  { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.2); color: #EF4444; }
  .btn-reject:hover  { background: #EF4444; color: #fff; border-color: #EF4444; }
  .btn-view    { background: transparent; border-color: rgba(255,255,255,0.1); color: #888; }
  .btn-view:hover    { border-color: #F07B2B; color: #F07B2B; }

  /* CALENDAR */
  .dh-cal { padding: 14px 16px; }
  .dh-cal-hd { display: grid; grid-template-columns: 70px repeat(3,1fr); gap: 5px; margin-bottom: 6px; }
  .dh-cal-hd-item { font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: #888; font-weight: 600; text-align: center; padding: 5px 2px; }
  .dh-cal-row { display: grid; grid-template-columns: 70px repeat(3,1fr); gap: 5px; margin-bottom: 5px; align-items: center; }
  .dh-cal-time { font-size: 10px; color: #888; font-weight: 500; }
  .dh-cal-slot { border-radius: 5px; padding: 8px 6px; font-size: 10px; font-weight: 600; text-align: center; border: 1px solid; transition: all 0.2s; cursor: pointer; min-height: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; }
  .dh-cal-slot:hover { transform: scale(1.03); }
  .cal-booked    { background: rgba(240,123,43,0.12); border-color: rgba(240,123,43,0.25); color: #F07B2B; }
  .cal-available { background: rgba(34,197,94,0.1);  border-color: rgba(34,197,94,0.2);  color: #22C55E; }
  .cal-blocked   { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.07); color: #555; }
  .dh-cal-legend { display: flex; gap: 14px; padding: 12px 0 2px; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.07); }
  .dh-legend-item { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #888; }
  .dh-legend-dot { width: 8px; height: 8px; border-radius: 2px; }

  /* CHARTS */
  .dh-bars { display: flex; align-items: flex-end; gap: 6px; height: 100px; padding: 0 20px 0; }
  .dh-bar-grp { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; }
  .dh-bar { width: 100%; border-radius: 3px 3px 0 0; cursor: pointer; transition: filter 0.2s; }
  .dh-bar:hover { filter: brightness(1.3); }
  .dh-bar-lbl { font-size: 9px; color: #888; font-weight: 500; }

  /* ROOMS */
  .dh-room-row { display: flex; align-items: center; gap: 12px; padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .dh-room-row:last-child { border-bottom: none; }
  .dh-room-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .dh-room-info { flex: 1; }
  .dh-room-name { font-size: 12px; font-weight: 600; }
  .dh-room-cap  { font-size: 10px; color: #888; margin-top: 1px; }
  .dh-bar-bg { background: rgba(255,255,255,0.06); border-radius: 20px; height: 4px; width: 90px; overflow: hidden; }
  .dh-bar-fill { height: 100%; border-radius: 20px; }
  .dh-room-pct { font-size: 11px; font-weight: 700; min-width: 32px; text-align: right; }

  /* ALERTS */
  .dh-alert-item { display: flex; gap: 10px; align-items: flex-start; padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.07); transition: background 0.15s; }
  .dh-alert-item:last-child { border-bottom: none; }
  .dh-alert-item:hover { background: rgba(255,255,255,0.02); }
  .dh-alert-icon { width: 30px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
  .dh-alert-title { font-size: 12px; font-weight: 600; }
  .dh-alert-desc  { font-size: 10px; color: #888; margin-top: 2px; line-height: 1.5; }
  .dh-alert-time  { font-size: 9px; color: #888; margin-left: auto; white-space: nowrap; padding-top: 2px; }

  /* LEADS */
  .dh-lead-row { display: flex; align-items: center; gap: 10px; padding: 10px 20px; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .dh-lead-row:last-child { border-bottom: none; }
  .dh-lead-av { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #fff; flex-shrink: 0; }
  .dh-lead-name { font-size: 12px; font-weight: 600; flex: 1; }
  .dh-lead-stage { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
  .stage-new       { background: rgba(59,130,246,0.12); color: #3B82F6; }
  .stage-follow-up { background: rgba(245,158,11,0.12); color: #F59E0B; }
  .stage-converted { background: rgba(34,197,94,0.12);  color: #22C55E; }
  .dh-lead-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #888; font-size: 10px; font-weight: 600; padding: 3px 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
  .dh-lead-btn:hover { border-color: #F07B2B; color: #F07B2B; }

  /* MODAL */
  .dh-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
  .dh-modal { background: #1E1E1E; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; width: 100%; max-width: 520px; overflow: hidden; }
  .dh-modal-hd { padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; justify-content: space-between; align-items: center; }
  .dh-modal-title { font-size: 15px; font-weight: 700; }
  .dh-modal-close { background: none; border: none; color: #888; font-size: 18px; cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: color 0.2s; }
  .dh-modal-close:hover { color: #fff; }
  .dh-modal-body { padding: 24px; display: flex; flex-direction: column; gap: 14px; }
  .dh-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .dh-form-group { display: flex; flex-direction: column; gap: 5px; }
  .dh-form-group label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #888; font-weight: 600; }
  .dh-form-group input, .dh-form-group select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #F0EDE8; padding: 10px 12px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; transition: border-color 0.2s; width: 100%; }
  .dh-form-group input:focus, .dh-form-group select:focus { border-color: #F07B2B; }
  .dh-form-group select option { background: #1E1E1E; }
  .dh-modal-ft { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.07); display: flex; gap: 10px; justify-content: flex-end; }
  .dh-btn-cancel { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #888; padding: 9px 18px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .dh-btn-cancel:hover { border-color: #fff; color: #fff; }

  /* TOAST */
  .dh-toast-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 2000; display: flex; flex-direction: column; gap: 8px; }
  .dh-toast { background: #1E1E1E; border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 12px 18px; font-size: 12px; font-weight: 600; color: #F0EDE8; display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); animation: slideIn 0.3s ease; min-width: 240px; }
  @keyframes slideIn { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: translateX(0); } }
  .toast-green { border-left: 3px solid #22C55E; }
  .toast-red   { border-left: 3px solid #EF4444; }
  .toast-orange { border-left: 3px solid #F07B2B; }

  /* NOTE INPUT */
  .dh-note-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #F0EDE8; padding: 8px 10px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 12px; outline: none; width: 100%; transition: border-color 0.2s; }
  .dh-note-input:focus { border-color: #F07B2B; }

  /* MISC */
  .dh-empty { padding: 40px; text-align: center; color: #555; font-size: 13px; }
  .dh-filter-bar { display: flex; gap: 8px; padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.07); flex-wrap: wrap; }
  .dh-filter-btn { padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #888; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
  .dh-filter-btn:hover { border-color: #F07B2B; color: #F07B2B; }
  .dh-filter-btn.active-filter { background: rgba(240,123,43,0.15); border-color: rgba(240,123,43,0.3); color: #F07B2B; }
  .dh-search { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 7px 12px; font-family: 'DM Sans', sans-serif; font-size: 12px; color: #F0EDE8; outline: none; width: 200px; transition: border-color 0.2s; }
  .dh-search:focus { border-color: #F07B2B; }
  .dh-search::placeholder { color: #555; }

  @media (max-width: 959px) {
    .dh-sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: min(288px, 88vw); max-width: 100%; transform: translateX(-100%); box-shadow: none; z-index: 200; }
    .dh-sidebar--open { transform: translateX(0); box-shadow: 16px 0 48px rgba(0,0,0,0.55); }
    .dh-sidebar-backdrop--visible { display: block; }
    .dh-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .dh-grid2 { grid-template-columns: 1fr; }
    .dh-grid3 { grid-template-columns: 1fr; }
    .dh-leads-grid { grid-template-columns: 1fr; padding: 16px; }
    .dh-topbar-right .dh-chip { display: none; }
    .dh-content { padding: 16px 14px 24px; }
    .dh-topbar { padding: 12px 14px; }
  }
  @media (max-width: 520px) {
    .dh-stats { grid-template-columns: 1fr; }
    .dh-btn-primary { padding: 8px 12px; font-size: 11px; }
    .dh-filter-bar { flex-direction: column; align-items: stretch; }
    .dh-search { width: 100%; margin-left: 0 !important; }
  }
  @media (min-width: 960px) {
    .dh-sidebar-backdrop { display: none !important; }
  }
  @media (min-width: 960px) and (max-width: 1199px) {
    .dh-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .dh-grid2 { grid-template-columns: 1fr; }
    .dh-grid3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .dh-leads-grid { grid-template-columns: 1fr; }
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function Avatar({ initials, color, size = 28 }) {
  return <div className="dh-cav" style={{ background: color, width: size, height: size, fontSize: size * 0.38 }}>{initials}</div>;
}

function StatusBadge({ status }) {
  return <span className={`dh-status s-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

function mapDocumentStatus(apiStatus) {
  const normalized = String(apiStatus || "").toUpperCase();
  if (normalized === "APPROVED") return "Verified";
  if (normalized === "DECLINED") return "Declined";
  return "Pending";
}

function Toast({ toasts }) {
  return (
    <div className="dh-toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`dh-toast toast-${t.color}`}>
          <span>{t.icon}</span> {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const [isMobile, setIsMobile]       = useState(
    typeof window !== "undefined" ? window.innerWidth < SIDEBAR_BREAKPOINT : false
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]       = useState(false);
  const [activeNav, setActiveNav]     = useState("overview");
  const [bookings, setBookings]       = useState(INITIAL_BOOKINGS);
  const [leads, setLeads]             = useState(INITIAL_LEADS);
  const [filter, setFilter]           = useState("all");
  const [search, setSearch]           = useState("");
  const [toasts, setToasts]           = useState([]);
  const [showModal, setShowModal]     = useState(false);
  const [viewBooking, setViewBooking] = useState(null);
  const [newBooking, setNewBooking]   = useState({ name:"", type:"ADR Practitioner", room:"Private Office", date:"", slot:"10am–1pm", amount:"", payment:"pending" });
  const [noteInputs, setNoteInputs]   = useState({});
  const [users, setUsers]             = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError]   = useState("");
  const [usersReload, setUsersReload] = useState(0);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [clientDocuments, setClientDocuments] = useState([]);
  const [clientDocumentsLoading, setClientDocumentsLoading] = useState(false);
  const [clientDocumentsError, setClientDocumentsError] = useState("");
  const [userFormError, setUserFormError] = useState("");
  const [userFormSubmitting, setUserFormSubmitting] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "",
    address: "",
    city: "",
    country: "",
    occupation: "",
    status: "ACTIVE",
    role: "MEMBER",
  });
  const toastIdRef = useRef(0);
  const clientDocInputRef = useRef(null);
    // ── ROOMS STATE ──
  const [roomsData, setRoomsData] = useState([]);
  const [newRoomData, setNewRoomData] = useState({ name: '', capacity: '', description: '' });
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editRoomData, setEditRoomData] = useState({ name: '', capacity: '', description: '' });
  const [roomsLoading, setRoomsLoading] = useState(false);
  const toastIdRef = useRef(0);

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

  useEffect(() => {
    if (activeNav !== "users" && activeNav !== "clients") return;

    const fetchUsers = async () => {
      if (!token) {
        setUsersError("Authentication token is missing.");
        return;
      }

      setUsersLoading(true);
      setUsersError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setUsersError(data.message || "Failed to fetch users.");
          return;
        }

        setUsers(Array.isArray(data.users) ? data.users : []);
      } catch {
        setUsersError("Could not reach the users API.");
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [activeNav, token, usersReload]);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleSidebar = () => {
    if (isMobile) setMobileMenuOpen((o) => !o);
    else setSidebarCollapsed((c) => !c);
  };

  const pickNav = (id) => {
    setActiveNav(id);
    if (isMobile) closeMobileMenu();
  };

  const loadClientDocuments = async (clientId) => {
    if (!token || !clientId) return;
    setClientDocumentsLoading(true);
    setClientDocumentsError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents?userId=${encodeURIComponent(clientId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setClientDocumentsError(data.message || "Failed to fetch documents.");
        return;
      }
      setClientDocuments(Array.isArray(data.documents) ? data.documents : []);
    } catch {
      setClientDocumentsError("Could not reach documents API.");
    } finally {
      setClientDocumentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav !== "client-details" || !selectedClient?.id) return;
    loadClientDocuments(selectedClient.id);
  }, [activeNav, selectedClient?.id, token]);

  const handleClientDocumentUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!selectedClient || files.length === 0 || !token) return;

    try {
      const createCalls = files.map((file) =>
        fetch(`${API_BASE_URL}/api/documents`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: selectedClient.id,
            documentName: file.name,
            // backend currently stores string path/url, so we keep filename placeholder
            documentFile: file.name,
            status: "PENDING",
          }),
        })
      );

      const results = await Promise.all(createCalls);
      const failures = results.filter((r) => !r.ok).length;
      if (failures > 0) {
        addToast(`${files.length - failures} uploaded, ${failures} failed`, "orange", "!");
      } else {
        addToast(`${files.length} document(s) uploaded`, "green", "📄");
      }
      await loadClientDocuments(selectedClient.id);
    } catch {
      setClientDocumentsError("Could not upload documents.");
    } finally {
      event.target.value = "";
    }
  };

  const updateClientDocumentStatus = async (documentId, status) => {
    if (!selectedClient || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        addToast(data.message || "Failed to update document", "red", "✗");
        return;
      }
      addToast(
        `Document ${status === "APPROVED" ? "approved" : "declined"}`,
        status === "APPROVED" ? "green" : "red",
        status === "APPROVED" ? "✓" : "✗"
      );
      await loadClientDocuments(selectedClient.id);
    } catch {
      addToast("Could not update document", "red", "✗");
    }
  };

  const openCreateUserModal = () => {
    setEditingUserId(null);
    setUserFormError("");
    setUserForm({
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      gender: "",
      address: "",
      city: "",
      country: "",
      occupation: "",
      status: "INACTIVE",
      role: "MEMBER",
    });
    setShowUserModal(true);
  };

  const openEditUserModal = (targetUser) => {
    setEditingUserId(targetUser.id);
    setUserFormError("");
    setUserForm({
      name: targetUser.name || "",
      email: targetUser.email || "",
      password: "",
      phoneNumber: targetUser.phoneNumber || "",
      gender: targetUser.gender || "",
      address: targetUser.address || "",
      city: targetUser.city || "",
      country: targetUser.country || "",
      occupation: targetUser.occupation || "",
      status: targetUser.status || "ACTIVE",
      role: targetUser.role || "MEMBER",
    });
    setShowUserModal(true);
  };

  const submitUserForm = async () => {
    if (!token) {
      setUserFormError("Authentication token is missing.");
      return;
    }

    if (!userForm.name.trim() || !userForm.email.trim()) {
      setUserFormError("Name and email are required.");
      return;
    }

    if (!editingUserId && userForm.password.length < 8) {
      setUserFormError("Password must be at least 8 characters for new users.");
      return;
    }

    setUserFormSubmitting(true);
    setUserFormError("");

    try {
      if (!editingUserId) {
        const createResponse = await fetch(`${API_BASE_URL}/api/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: userForm.name.trim(),
            email: userForm.email.trim(),
            password: userForm.password,
            role: userForm.role,
          }),
        });

        const createData = await createResponse.json().catch(() => ({}));
        if (!createResponse.ok) {
          setUserFormError(createData.message || "Failed to create user.");
          return;
        }

        addToast("User created successfully", "green", "✓");
      } else {
        const updatePayload = {
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          phoneNumber: userForm.phoneNumber || null,
          gender: userForm.gender || null,
          address: userForm.address || null,
          city: userForm.city || null,
          country: userForm.country || null,
          occupation: userForm.occupation || null,
          status: userForm.status,
          role: userForm.role,
        };

        const updateResponse = await fetch(`${API_BASE_URL}/api/users/${editingUserId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        });

        const updateData = await updateResponse.json().catch(() => ({}));
        if (!updateResponse.ok) {
          setUserFormError(updateData.message || "Failed to update user.");
          return;
        }

        addToast("User updated successfully", "green", "✓");
      }

      setShowUserModal(false);
      setUsersReload((v) => v + 1);
    } catch {
      setUserFormError("Could not reach the users API.");
    } finally {
      setUserFormSubmitting(false);
    }
  };

    // ── ROOM FUNCTIONS ──
   const fetchRooms = async () => {
     setRoomsLoading(true);
     try {
       const response = await fetch("http://localhost:3000/api/rooms");
       const data = await response.json();
       if (data.success) {
        setRoomsData(data.data);
       }
     } catch (error) {
       console.error("Error fetching rooms:", error);
     }finally {
      setRoomsLoading(false);
     }
  };

  const createRoom = async () => {
    if (!newRoomData.name || !newRoomData.capacity) {
      alert("Name and capacity are required");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/rooms/admin/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoomData.name,
          capacity: parseInt(newRoomData.capacity),
          description: newRoomData.description
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Room created!");
        setNewRoomData({ name: '', capacity: '', description: '' });
        fetchRooms();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error creating room");
    }
  };

  const updateRoom = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/rooms/admin/rooms/${editingRoomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editRoomData.name,
          capacity: parseInt(editRoomData.capacity),
          description: editRoomData.description
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Room updated!");
        setEditingRoomId(null);
        setEditRoomData({ name: '', capacity: '', description: '' });
        fetchRooms();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error updating room");
    }
  };

  const deleteRoom = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/rooms/admin/rooms/${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        alert("Room deleted!");
        fetchRooms();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error deleting room");
    }
  };

  const startEditRoom = (room) => {
    setEditingRoomId(room.id);
    setEditRoomData({
      name: room.name,
      capacity: room.capacity,
      description: room.description || ''
    });
  };

  // ── TOAST ──
  const addToast = (msg, color = "orange", icon = "✓") => {
    const id = ++toastIdRef.current;
    setToasts(p => [...p, { id, msg, color, icon }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  // ── BOOKING ACTIONS ──
  const approveBooking = (id) => {
    setBookings(p => p.map(b => b.id === id ? { ...b, status: "confirmed" } : b));
    addToast("Booking approved successfully", "green", "✓");
  };
  const rejectBooking = (id) => {
    setBookings(p => p.map(b => b.id === id ? { ...b, status: "rejected" } : b));
    addToast("Booking rejected", "red", "✗");
  };
  const deleteBooking = (id) => {
    setBookings(p => p.filter(b => b.id !== id));
    setViewBooking(null);
    addToast("Booking removed", "orange", "🗑");
  };

  // ── ADD BOOKING ──
  const submitNewBooking = () => {
    if (!newBooking.name || !newBooking.date || !newBooking.amount) {
      addToast("Please fill all required fields", "red", "!");
      return;
    }
    const colors = ["#6c63ff","#059669","#F07B2B","#3B82F6","#7C3AED","#EC4899"];
    const id = "BK" + String(bookings.length + 1).padStart(3, "0");
    const initials = newBooking.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
    const color = colors[bookings.length % colors.length];
    const roomIcon = newBooking.room === "Private Office" ? "🏛️" : newBooking.room === "Boardroom" ? "📋" : "⚖️";
    setBookings(p => [{ id, initials, color, roomIcon, status: "pending", doc: false, ...newBooking, amount: Number(newBooking.amount) }, ...p]);
    setShowModal(false);
    setNewBooking({ name:"", type:"ADR Practitioner", room:"Private Office", date:"", slot:"10am–1pm", amount:"", payment:"pending" });
    addToast(`Booking created for ${newBooking.name}`, "green", "📅");
  };

  // ── LEADS ──
  const advanceLead = (id) => {
    setLeads(p => p.map(l => {
      if (l.id !== id) return l;
      const next = l.stage === "new" ? "follow-up" : l.stage === "follow-up" ? "converted" : "converted";
      addToast(`${l.name} moved to ${next}`, "orange", "→");
      return { ...l, stage: next };
    }));
  };
  const saveNote = (id) => {
    setLeads(p => p.map(l => l.id === id ? { ...l, note: noteInputs[id] || l.note } : l));
    addToast("Note saved", "green", "💬");
  };

  // ── FILTERED BOOKINGS ──
  const filteredBookings = bookings.filter(b => {
    const matchFilter = filter === "all" || b.status === filter;
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.room.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // ── STATS ──
  const totalRevenue = bookings.filter(b => b.payment === "paid").reduce((s, b) => s + b.amount, 0);
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;

  // ── CALENDAR DATA ──
  const calendarData = {};
  bookings.forEach(b => {
    SLOTS.forEach(slot => {
      ROOMS.forEach(room => {
        const key = `${b.date}-${slot}-${room}`;
        if (b.slot === slot && b.room === room && (b.status === "confirmed" || b.status === "pending")) {
          calendarData[key] = { name: b.name.split(" ")[1] || b.name.split(" ")[0], status: b.status };
        }
      });
    });
  });

  const getCalSlot = (day, slot, room) => {
    const dateMap = { "Mon 30 Mar":"2026-03-30","Tue 31 Mar":"2026-03-31","Wed 1 Apr":"2026-04-01","Thu 2 Apr":"2026-04-02","Fri 3 Apr":"2026-04-03" };
    const key = `${dateMap[day]}-${slot}-${room}`;
    if (calendarData[key]) return { type: "booked", ...calendarData[key] };
    if (slot === "5pm–8pm" && room === "Combined") return { type: "blocked" };
    return { type: "available" };
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="dh-wrap">
        <div
          className={`dh-sidebar-backdrop ${isMobile && mobileMenuOpen ? "dh-sidebar-backdrop--visible" : ""}`}
          aria-hidden="true"
          onClick={closeMobileMenu}
        />

        {/* SIDEBAR */}
        <aside
          className={`dh-sidebar ${!isMobile && sidebarCollapsed ? "dh-sidebar--collapsed" : ""} ${isMobile && mobileMenuOpen ? "dh-sidebar--open" : ""}`}
          aria-label="Main navigation"
        >
          <div className="dh-logo">
            <div className="dh-logo-the">The</div>
            <div className="dh-logo-dr">DR<span>hub</span></div>
            <div className="dh-logo-badge">Admin Panel</div>
          </div>
          <nav id="admin-sidebar-nav" className="dh-nav">
            <div className="dh-nav-label">Main</div>
            {[
              { id:"overview",      icon:"📊", label:"Overview" },
              { id:"bookings",      icon:"📅", label:"Bookings",      count: pendingCount },
              { id:"calendar",      icon:"🗓️",  label:"Calendar" },
              { id:"clients",       icon:"👥", label:"Clients" },
              { id:"users",         icon:"🧑", label:"Users" },
              { id:"rooms",         icon:"🏢", label:"Rooms" },
            ].map(n => (
              <button key={n.id} type="button" className={`dh-nav-item ${activeNav===n.id?"active":""}`} onClick={() => pickNav(n.id)}>
                <span className="dh-nav-ico" aria-hidden>{n.icon}</span>
                <span className="dh-nav-text">{n.label}</span>
                {n.count > 0 && <span className="dh-nav-count">{n.count}</span>}
              </button>
            ))}
            <div className="dh-nav-label">Management</div>
            {[
              { id:"leads",         icon:"🎯", label:"Leads",         count: leads.filter(l=>l.stage==="new").length },
              { id:"notifications", icon:"🔔", label:"Notifications", count: pendingCount },
              { id:"analytics",     icon:"📈", label:"Analytics" },
            ].map(n => (
              <button key={n.id} type="button" className={`dh-nav-item ${activeNav===n.id?"active":""}`} onClick={() => pickNav(n.id)}>
                <span className="dh-nav-ico" aria-hidden>{n.icon}</span>
                <span className="dh-nav-text">{n.label}</span>
                {n.count > 0 && <span className="dh-nav-count">{n.count}</span>}
              </button>
            ))}
          </nav>
          <div className="dh-user">
            <div className="dh-av">{(user?.name || "Admin").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
            <div className="dh-user-info">
              <div style={{fontSize:12,fontWeight:600}}>{user?.name || "Administrator"}</div>
              <div style={{fontSize:10,color:"#888"}}>{user?.role || "ADMIN"}</div>
            <div className="dh-av">BO</div>
            <div className="dh-user-info">
              <div style={{fontSize:12,fontWeight:600}}>Breattah Okeyo</div>
              <div style={{fontSize:10,color:"#888"}}>Administrator</div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="dh-main">
          {/* TOPBAR */}
          <header className="dh-topbar">
            <div className="dh-topbar-left">
              <button
                type="button"
                className="dh-menu-toggle"
                onClick={toggleSidebar}
                aria-expanded={isMobile ? mobileMenuOpen : !sidebarCollapsed}
                aria-controls="admin-sidebar-nav"
                title={isMobile ? (mobileMenuOpen ? "Close menu" : "Open menu") : sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isMobile ? (mobileMenuOpen ? "✕" : "☰") : sidebarCollapsed ? "→" : "←"}
              </button>
              <div className="dh-topbar-titles">
              <h1>
                {activeNav === "overview"      && "Good morning, Breattah 👋"}
                {activeNav === "bookings"      && "Bookings"}
                {activeNav === "calendar"      && "Schedule Calendar"}
                {activeNav === "clients"       && "Clients"}
                {activeNav === "client-details"&& "Client Details"}
                {activeNav === "users"         && "Users"}
                {activeNav === "leads"         && "Lead Pipeline"}
                {activeNav === "notifications" && "Notifications"}
                {activeNav === "analytics"     && "Analytics"}
              </h1>
              <p>DR Hub Admin · Wednesday, 1 April 2026</p>
              </div>
            </div>
            <div className="dh-topbar-right">
              <div className="dh-chip">📅 Wed 1 Apr 2026</div>
              <div className="dh-notif" onClick={() => addToast(`${pendingCount} bookings need your approval`, "orange", "🔔")}>
                🔔<span className="dh-notif-dot"></span>
              </div>
              <button className="dh-btn-primary" onClick={logout}>Logout</button>
              <button className="dh-btn-primary" onClick={() => setShowModal(true)}>+ New Booking</button>
            </div>
          </header>

          {/* CONTENT */}
          <div className="dh-content">

            {/* ── OVERVIEW ── */}
            {activeNav === "overview" && (
              <>
                {/* Stats */}
                <div className="dh-stats">
                  <div className="dh-stat">
                    <div className="dh-stat-top">
                      <div className="dh-stat-icon" style={{background:"rgba(240,123,43,0.12)"}}>📅</div>
                      <span className="dh-badge-up">↑ 12%</span>
                    </div>
                    <div className="dh-stat-num">{bookings.length}</div>
                    <div className="dh-stat-label">Total Bookings</div>
                  </div>
                  <div className="dh-stat">
                    <div className="dh-stat-top">
                      <div className="dh-stat-icon" style={{background:"rgba(34,197,94,0.12)"}}>💰</div>
                      <span className="dh-badge-up">↑ 8%</span>
                    </div>
                    <div className="dh-stat-num" style={{fontSize:22}}>
                      {totalRevenue.toLocaleString()}
                    </div>
                    <div className="dh-stat-label">Revenue (Ksh)</div>
                  </div>
                  <div className="dh-stat">
                    <div className="dh-stat-top">
                      <div className="dh-stat-icon" style={{background:"rgba(245,158,11,0.12)"}}>⏳</div>
                      <span className="dh-badge-warn">{pendingCount} new</span>
                    </div>
                    <div className="dh-stat-num" style={{color:"#F59E0B"}}>{pendingCount}</div>
                    <div className="dh-stat-label">Pending Approvals</div>
                  </div>
                  <div className="dh-stat">
                    <div className="dh-stat-top">
                      <div className="dh-stat-icon" style={{background:"rgba(59,130,246,0.12)"}}>✅</div>
                      <span className="dh-badge-up">{confirmedCount} active</span>
                    </div>
                    <div className="dh-stat-num">{confirmedCount}</div>
                    <div className="dh-stat-label">Confirmed Bookings</div>
                  </div>
                </div>

                {/* Table + Calendar */}
                <div className="dh-grid2">
                  <div className="dh-panel">
                    <div className="dh-panel-hd">
                      <div>
                        <div className="dh-panel-title">Recent Bookings</div>
                        <div className="dh-panel-sub">Pending approvals need action</div>
                      </div>
                      <button className="dh-panel-link" onClick={() => pickNav("bookings")}>View all →</button>
                    </div>
                    <div className="dh-table-wrap">
                      <table className="dh-table">
                        <thead><tr>
                          <th>Client</th><th>Room</th><th>Slot</th><th>Amount</th><th>Status</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                          {bookings.slice(0,5).map(b => (
                            <tr key={b.id} onClick={() => setViewBooking(b)}>
                              <td><div className="dh-client-cell"><Avatar initials={b.initials} color={b.color}/><div><div className="dh-cname">{b.name}</div><div className="dh-ctype">{b.type}</div></div></div></td>
                              <td><span className="dh-room-chip">{b.roomIcon} {b.room}</span></td>
                              <td><span className="dh-slot-badge">{b.slot}</span></td>
                              <td><span className="dh-amount">{b.amount.toLocaleString()}</span></td>
                              <td><StatusBadge status={b.status}/></td>
                              <td onClick={e => e.stopPropagation()}>
                                <div className="dh-actions">
                                  {b.status === "pending" ? <>
                                    <button className="dh-action-btn btn-approve" onClick={() => approveBooking(b.id)}>✓</button>
                                    <button className="dh-action-btn btn-reject"  onClick={() => rejectBooking(b.id)}>✗</button>
                                  </> : <button className="dh-action-btn btn-view" onClick={() => setViewBooking(b)}>View</button>}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="dh-panel">
                    <div className="dh-panel-hd">
                      <div>
                        <div className="dh-panel-title">This Week</div>
                        <div className="dh-panel-sub">Room availability at a glance</div>
                      </div>
                      <button className="dh-panel-link" onClick={() => pickNav("calendar")}>Full view →</button>
                    </div>
                    <div className="dh-cal">
                      <div className="dh-cal-hd">
                        <div className="dh-cal-hd-item"></div>
                        {ROOMS.map(r => <div key={r} className="dh-cal-hd-item">{r.split(" ")[0]}</div>)}
                      </div>
                      {["Wed 1 Apr","Thu 2 Apr"].map(day =>
                        SLOTS.map(slot => {
                          const daySlot = `${day} ${slot}`;
                          return (
                            <div key={daySlot} className="dh-cal-row">
                              <div className="dh-cal-time">{day.split(" ")[0]}<br/>{slot}</div>
                              {ROOMS.map(room => {
                                const s = getCalSlot(day, slot, room);
                                return (
                                  <div key={room} className={`dh-cal-slot cal-${s.type}`} onClick={() => s.type === "booked" && addToast(`${s.name} — ${room} ${slot}`, "orange", "📋")}>
                                    <div style={{fontSize:10,fontWeight:700}}>{s.type === "booked" ? s.name : s.type === "available" ? "Free" : "Blocked"}</div>
                                    {s.type === "booked" && <div style={{fontSize:9,opacity:0.7}}>{s.status}</div>}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })
                      )}
                      <div className="dh-cal-legend">
                        {[["cal-booked","Booked"],["cal-available","Available"],["cal-blocked","Blocked"]].map(([cls,lbl]) => (
                          <div key={lbl} className="dh-legend-item"><div className={`dh-legend-dot ${cls}`} style={{border:"1px solid currentColor"}}></div>{lbl}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue + Rooms + Alerts */}
                <div className="dh-grid3">
                  {/* Revenue bars */}
                  <div className="dh-panel">
                    <div className="dh-panel-hd">
                      <div>
                        <div className="dh-panel-title">Weekly Revenue</div>
                        <div className="dh-panel-sub">Ksh · This week</div>
                      </div>
                    </div>
                    <div style={{padding:"16px 20px 8px"}}>
                      <span style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900}}>{totalRevenue.toLocaleString()}</span>
                      <span className="dh-badge-up" style={{marginLeft:10}}>↑ 8%</span>
                    </div>
                    <div className="dh-bars">
                      {[45,70,90,55,65,30].map((h,i) => (
                        <div key={i} className="dh-bar-grp">
                          <div className="dh-bar" style={{height:`${h}%`,background:`rgba(240,123,43,${0.2+h/200})`}} title={`Ksh ${h*1000}`}></div>
                          <div className="dh-bar-lbl">{["M","T","W","T","F","S"][i]}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{height:16}}></div>
                  </div>

                  {/* Room utilisation */}
                  <div className="dh-panel">
                    <div className="dh-panel-hd"><div className="dh-panel-title">Room Utilisation</div></div>
                    {[
                      { name:"Private Office", cap:"1–3 pax", pct:78, color:"#F07B2B" },
                      { name:"Boardroom",      cap:"1–6 pax", pct:55, color:"#3B82F6" },
                      { name:"Combined Space", cap:"1–10 pax",pct:40, color:"#22C55E" },
                    ].map(r => (
                      <div key={r.name} className="dh-room-row">
                        <div className="dh-room-dot" style={{background:r.color}}></div>
                        <div className="dh-room-info">
                          <div className="dh-room-name">{r.name}</div>
                          <div className="dh-room-cap">{r.cap}</div>
                        </div>
                        <div className="dh-bar-bg"><div className="dh-bar-fill" style={{width:`${r.pct}%`,background:r.color}}></div></div>
                        <div className="dh-room-pct">{r.pct}%</div>
                      </div>
                    ))}
                    <div style={{padding:"12px 20px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
                      <div style={{fontSize:10,color:"#888",letterSpacing:1,textTransform:"uppercase",fontWeight:600,marginBottom:8}}>Peak Hours</div>
                      <div style={{display:"flex",gap:8}}>
                        <div style={{flex:1,background:"#F07B2B",borderRadius:4,padding:8,textAlign:"center"}}>
                          <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>10am–1pm</div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",marginTop:2}}>Most booked</div>
                        </div>
                        <div style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:4,padding:8,textAlign:"center"}}>
                          <div style={{fontSize:12,fontWeight:700}}>2pm–5pm</div>
                          <div style={{fontSize:10,color:"#888",marginTop:2}}>2nd busiest</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  <div className="dh-panel">
                    <div className="dh-panel-hd">
                      <div className="dh-panel-title">🔔 Alerts</div>
                      <button className="dh-panel-link" onClick={() => addToast("All alerts cleared","green","✓")}>Clear all</button>
                    </div>
                    {pendingCount > 0 && (
                      <div className="dh-alert-item">
                        <div className="dh-alert-icon" style={{background:"rgba(245,158,11,0.12)"}}>⏳</div>
                        <div>
                          <div className="dh-alert-title">{pendingCount} Pending Approvals</div>
                          <div className="dh-alert-desc">Bookings awaiting your review</div>
                        </div>
                        <div className="dh-alert-time">Now</div>
                      </div>
                    )}
                    {bookings.filter(b=>b.payment==="pending").map(b => (
                      <div key={b.id} className="dh-alert-item">
                        <div className="dh-alert-icon" style={{background:"rgba(240,123,43,0.12)"}}>💳</div>
                        <div>
                          <div className="dh-alert-title">Payment Pending</div>
                          <div className="dh-alert-desc">{b.name} — Ksh {b.amount.toLocaleString()}</div>
                        </div>
                        <div className="dh-alert-time">Today</div>
                      </div>
                    ))}
                    {bookings.filter(b=>!b.doc).map(b => (
                      <div key={b.id} className="dh-alert-item">
                        <div className="dh-alert-icon" style={{background:"rgba(239,68,68,0.12)"}}>📄</div>
                        <div>
                          <div className="dh-alert-title">Missing Document</div>
                          <div className="dh-alert-desc">{b.name} — qualification proof not uploaded</div>
                        </div>
                        <div className="dh-alert-time">Today</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── BOOKINGS ── */}
            {activeNav === "bookings" && (
              <div className="dh-panel">
                <div className="dh-panel-hd">
                  <div>
                    <div className="dh-panel-title">All Bookings</div>
                    <div className="dh-panel-sub">{filteredBookings.length} of {bookings.length} shown</div>
                  </div>
                  <button className="dh-btn-primary" onClick={() => setShowModal(true)}>+ New Booking</button>
                </div>
                <div className="dh-filter-bar">
                  {["all","pending","confirmed","rejected","completed"].map(f => (
                    <button key={f} className={`dh-filter-btn ${filter===f?"active-filter":""}`} onClick={() => setFilter(f)}>
                      {f.charAt(0).toUpperCase()+f.slice(1)}
                      {f !== "all" && <span style={{marginLeft:5,opacity:0.7}}>({bookings.filter(b=>b.status===f).length})</span>}
                    </button>
                  ))}
                  <input className="dh-search" placeholder="Search name or room..." value={search} onChange={e => setSearch(e.target.value)} style={{marginLeft:"auto"}}/>
                </div>
                <div className="dh-table-wrap">
                  <table className="dh-table">
                    <thead><tr>
                      <th>ID</th><th>Client</th><th>Room</th><th>Date</th><th>Slot</th><th>Amount</th><th>Payment</th><th>Doc</th><th>Status</th><th>Actions</th>
                    </tr></thead>
                    <tbody>
                      {filteredBookings.length === 0 && (
                        <tr><td colSpan={10}><div className="dh-empty">No bookings match this filter</div></td></tr>
                      )}
                      {filteredBookings.map(b => (
                        <tr key={b.id} onClick={() => setViewBooking(b)}>
                          <td style={{color:"#888",fontSize:10}}>{b.id}</td>
                          <td><div className="dh-client-cell"><Avatar initials={b.initials} color={b.color}/><div><div className="dh-cname">{b.name}</div><div className="dh-ctype">{b.type}</div></div></div></td>
                          <td><span className="dh-room-chip">{b.roomIcon} {b.room}</span></td>
                          <td style={{color:"#888",fontSize:11}}>{b.date}</td>
                          <td><span className="dh-slot-badge">{b.slot}</span></td>
                          <td><span className="dh-amount">{b.amount.toLocaleString()}</span></td>
                          <td><span className={`dh-status ${b.payment==="paid"?"s-confirmed":"s-pending"}`}>{b.payment}</span></td>
                          <td style={{textAlign:"center"}}>{b.doc ? "✅" : "❌"}</td>
                          <td><StatusBadge status={b.status}/></td>
                          <td onClick={e => e.stopPropagation()}>
                            <div className="dh-actions">
                              {b.status === "pending" ? <>
                                <button className="dh-action-btn btn-approve" onClick={() => approveBooking(b.id)}>✓ Approve</button>
                                <button className="dh-action-btn btn-reject"  onClick={() => rejectBooking(b.id)}>✗ Reject</button>
                              </> : <>
                                <button className="dh-action-btn btn-view"   onClick={() => setViewBooking(b)}>View</button>
                                <button className="dh-action-btn btn-reject" onClick={() => deleteBooking(b.id)}>🗑</button>
                              </>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── CALENDAR ── */}
            {activeNav === "calendar" && (
              <div className="dh-panel">
                <div className="dh-panel-hd">
                  <div>
                    <div className="dh-panel-title">Weekly Schedule — All Rooms</div>
                    <div className="dh-panel-sub">Click a booked slot to view details</div>
                  </div>
                </div>
                <div style={{padding:"16px 20px",overflowX:"auto"}}>
                  <div style={{display:"grid",gridTemplateColumns:`80px repeat(${ROOMS.length},1fr)`,gap:6,minWidth:600,marginBottom:8}}>
                    <div></div>
                    {ROOMS.map(r => <div key={r} style={{fontSize:11,fontWeight:700,color:"#F07B2B",textAlign:"center",padding:8,background:"rgba(240,123,43,0.08)",borderRadius:6}}>{r}</div>)}
                  </div>
                  {DAYS.map(day => (
                    <div key={day}>
                      <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#888",fontWeight:600,padding:"12px 0 6px"}}>{day}</div>
                      {SLOTS.map(slot => (
                        <div key={slot} style={{display:"grid",gridTemplateColumns:`80px repeat(${ROOMS.length},1fr)`,gap:6,minWidth:600,marginBottom:6}}>
                          <div style={{fontSize:10,color:"#888",fontWeight:500,display:"flex",alignItems:"center"}}>{slot}</div>
                          {ROOMS.map(room => {
                            const s = getCalSlot(day, slot, room);
                            return (
                              <div key={room} className={`dh-cal-slot cal-${s.type}`}
                                onClick={() => {
                                  if (s.type === "booked") {
                                    const b = bookings.find(bk => bk.name.includes(s.name) && bk.slot === slot && bk.room === room);
                                    if (b) setViewBooking(b);
                                  }
                                }}>
                                <div style={{fontSize:11,fontWeight:700}}>{s.type==="booked" ? s.name : s.type==="available" ? "Available" : "Blocked"}</div>
                                {s.type==="booked" && <div style={{fontSize:9,opacity:0.7}}>{s.status}</div>}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="dh-cal-legend" style={{marginTop:16}}>
                    {[["cal-booked","Booked"],["cal-available","Available"],["cal-blocked","Blocked"]].map(([cls,lbl]) => (
                      <div key={lbl} className="dh-legend-item"><div className={`dh-legend-dot ${cls}`} style={{border:"1px solid currentColor"}}></div>{lbl}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── CLIENTS ── */}
            {activeNav === "clients" && (
              <div className="dh-panel">
                <div className="dh-panel-hd">
                  <div className="dh-panel-title">Member Clients</div>
                  <input className="dh-search" placeholder="Search member..." value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
                {usersError && (
                  <div style={{ padding: "12px 20px", color: "#ffb4b4" }}>
                    {usersError}
                  </div>
                )}
                <div className="dh-table-wrap">
                  <table className="dh-table">
                    <thead><tr><th>Client</th><th>Email</th><th>Phone</th><th>Gender</th><th>Occupation</th><th>Status</th><th>Created</th></tr></thead>
                    <tbody>
                      {!usersLoading && users
                        .filter((u) => String(u.role || "").toUpperCase() === "MEMBER")
                        .filter((u) => {
                          const q = search.toLowerCase();
                          return (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
                        }).length === 0 && (
                          <tr><td colSpan={7}><div className="dh-empty">No member clients found</div></td></tr>
                        )}
                      {users
                        .filter((u) => String(u.role || "").toUpperCase() === "MEMBER")
                        .filter((u) => {
                          const q = search.toLowerCase();
                          return (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
                        })
                        .map((u) => (
                          <tr
                            key={u.id}
                            onClick={() => {
                              setSelectedClient(u);
                              setActiveNav("client-details");
                            }}
                          >
                            <td>
                              <div className="dh-client-cell">
                                <Avatar
                                  initials={(u.name || "Member").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                                  color="#6c63ff"
                                  size={34}
                                />
                                <div>
                                  <div className="dh-cname">{u.name || "-"}</div>
                                  <div className="dh-ctype">Member</div>
                                </div>
                              </div>
                            </td>
                            <td>{u.email || "-"}</td>
                            <td>{u.phoneNumber || "-"}</td>
                            <td>{u.gender || "-"}</td>
                            <td>{u.occupation || "-"}</td>
                            <td>
                              <span className={`dh-status ${String(u.status || "").toLowerCase() === "active" ? "s-confirmed" : "s-pending"}`}>
                                {u.status || "UNKNOWN"}
                              </span>
                            </td>
                            <td style={{color:"#888",fontSize:11}}>
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                            </td>
                          </tr>
                        ))}
                  <div className="dh-panel-title">All Clients</div>
                  <input className="dh-search" placeholder="Search client..." value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
                <div className="dh-table-wrap">
                  <table className="dh-table">
                    <thead><tr><th>Client</th><th>Type</th><th>Bookings</th><th>Total Spent</th><th>Last Booking</th><th>Doc</th></tr></thead>
                    <tbody>
                      {[...new Map(bookings.map(b => [b.name, b])).values()]
                        .filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
                        .map(b => {
                          const clientBookings = bookings.filter(bk => bk.name === b.name);
                          const totalSpent = clientBookings.filter(bk=>bk.payment==="paid").reduce((s,bk)=>s+bk.amount,0);
                          return (
                            <tr key={b.name}>
                              <td><div className="dh-client-cell"><Avatar initials={b.initials} color={b.color} size={34}/><div><div className="dh-cname">{b.name}</div><div className="dh-ctype">{b.type}</div></div></div></td>
                              <td><span className="dh-slot-badge">{b.type}</span></td>
                              <td style={{fontWeight:700}}>{clientBookings.length}</td>
                              <td><span className="dh-amount">{totalSpent.toLocaleString()}</span></td>
                              <td style={{color:"#888",fontSize:11}}>{b.date}</td>
                              <td style={{textAlign:"center"}}>{b.doc ? "✅" : "❌"}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── CLIENT DETAILS ── */}
            {activeNav === "client-details" && (
              <div style={{ display: "grid", gap: 18 }}>
                <div className="dh-panel">
                  <div className="dh-panel-hd">
                    <div>
                      <div className="dh-panel-title">Client Details</div>
                      <div className="dh-panel-sub">Profile and account information</div>
                    </div>
                    <button className="dh-btn-primary" onClick={() => setActiveNav("clients")}>
                      Back to Clients
                    </button>
                  </div>
                  {!selectedClient ? (
                    <div className="dh-empty">Select a client from the Clients tab.</div>
                  ) : (
                    <div
                      style={{
                        padding: 20,
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: 12,
                      }}
                    >
                      <div><strong>Name:</strong> {selectedClient.name || "-"}</div>
                      <div><strong>Email:</strong> {selectedClient.email || "-"}</div>
                      <div><strong>Phone:</strong> {selectedClient.phoneNumber || "-"}</div>
                      <div><strong>Occupation:</strong> {selectedClient.occupation || "-"}</div>
                      <div><strong>Gender:</strong> {selectedClient.gender || "-"}</div>
                      <div><strong>Status:</strong> {selectedClient.status || "-"}</div>
                      <div><strong>Address:</strong> {selectedClient.address || "-"}</div>
                      <div><strong>City:</strong> {selectedClient.city || "-"}</div>
                      <div><strong>Country:</strong> {selectedClient.country || "-"}</div>
                    </div>
                  )}
                </div>

                <div className="dh-panel">
                  <div className="dh-panel-hd">
                    <div className="dh-panel-title">Documents</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        ref={clientDocInputRef}
                        type="file"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleClientDocumentUpload}
                      />
                      <button
                        className="dh-btn-primary"
                        onClick={() => clientDocInputRef.current?.click()}
                        disabled={!selectedClient}
                      >
                        Upload Document
                      </button>
                    </div>
                  </div>
                  <div className="dh-table-wrap">
                    <table className="dh-table">
                      <thead>
                        <tr><th>ID</th><th>Document</th><th>Type</th><th>Uploaded</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {clientDocumentsLoading && (
                          <tr><td colSpan={6}><div className="dh-empty">Loading documents...</div></td></tr>
                        )}
                        {!clientDocumentsLoading && clientDocumentsError && (
                          <tr><td colSpan={6}><div className="dh-empty">{clientDocumentsError}</div></td></tr>
                        )}
                        {!clientDocumentsLoading && !clientDocumentsError && clientDocuments.length === 0 && (
                          <tr><td colSpan={6}><div className="dh-empty">No documents found</div></td></tr>
                        )}
                        {!clientDocumentsLoading && !clientDocumentsError && clientDocuments.map((doc) => (
                          <tr key={doc.id}>
                            <td style={{ color: "#888", fontSize: 11 }}>{doc.id}</td>
                            <td>{doc.documentName}</td>
                            <td>{doc.documentFile || "Uploaded File"}</td>
                            <td style={{ color: "#888", fontSize: 11 }}>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "-"}</td>
                            <td>
                              <span className={`dh-status ${String(doc.status).toUpperCase() === "APPROVED" ? "s-confirmed" : String(doc.status).toUpperCase() === "DECLINED" ? "s-rejected" : "s-pending"}`}>
                                {mapDocumentStatus(doc.status)}
                              </span>
                            </td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <div className="dh-actions">
                                <button
                                  className="dh-action-btn btn-view"
                                  onClick={() => setPreviewDocument(doc)}
                                >
                                  Preview
                                </button>
                                {String(doc.status).toUpperCase() !== "APPROVED" && (
                                  <>
                                    <button
                                      className="dh-action-btn btn-approve"
                                      onClick={() => updateClientDocumentStatus(doc.id, "APPROVED")}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      className="dh-action-btn btn-reject"
                                      onClick={() => updateClientDocumentStatus(doc.id, "DECLINED")}
                                    >
                                      Decline
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="dh-panel">
                  <div className="dh-panel-hd">
                    <div className="dh-panel-title">Bookings</div>
                  </div>
                  <div className="dh-table-wrap">
                    <table className="dh-table">
                      <thead>
                        <tr><th>ID</th><th>Room</th><th>Date</th><th>Slot</th><th>Amount</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {DUMMY_CLIENT_BOOKINGS.map((booking) => (
                          <tr key={booking.id}>
                            <td style={{ color: "#888", fontSize: 11 }}>{booking.id}</td>
                            <td>{booking.room}</td>
                            <td style={{ color: "#888", fontSize: 11 }}>{booking.date}</td>
                            <td>{booking.slot}</td>
                            <td><span className="dh-amount">{booking.amount.toLocaleString()}</span></td>
                            <td><StatusBadge status={booking.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── USERS ── */}
            {activeNav === "users" && (
              <div className="dh-panel">
                <div className="dh-panel-hd">
                  <div>
                    <div className="dh-panel-title">System Users</div>
                    <div className="dh-panel-sub">
                      {usersLoading ? "Loading users..." : `${users.length} users`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="dh-btn-primary" onClick={() => setUsersReload((v) => v + 1)}>
                      Refresh
                    </button>
                    <button className="dh-btn-primary" onClick={openCreateUserModal}>
                      + New User
                    </button>
                  </div>
                </div>

                {usersError && (
                  <div style={{ padding: "12px 20px", color: "#ffb4b4" }}>
                    {usersError}
                  </div>
                )}

                <div className="dh-table-wrap">
                  <table className="dh-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Occupation</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!usersLoading && users.length === 0 && !usersError && (
                        <tr>
                          <td colSpan={7}>
                            <div className="dh-empty">No users found</div>
                          </td>
                        </tr>
                      )}
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 600 }}>{u.name || "-"}</td>
                          <td>{u.email || "-"}</td>
                          <td>{u.phoneNumber || "-"}</td>
                          <td>{u.occupation || "-"}</td>
                          <td>{u.role || "-"}</td>
                          <td>
                            <span className={`dh-status ${String(u.status || "").toLowerCase() === "active" ? "s-confirmed" : "s-pending"}`}>
                              {u.status || "UNKNOWN"}
                            </span>
                          </td>
                          <td style={{ color: "#888", fontSize: 11 }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                          </td>
                          <td>
                            <button className="dh-action-btn btn-view" onClick={() => openEditUserModal(u)}>
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

{/* ── ROOMS ── */}
{activeNav === "rooms" && (
  <div className="dh-panel">
    <div className="dh-panel-hd">
      <div>
        <div className="dh-panel-title">Room Management</div>
        <div className="dh-panel-sub">Manage office spaces and meeting rooms</div>
      </div>
      <button className="dh-btn-primary" onClick={fetchRooms}>🔄 Refresh</button>
    </div>
    
    {/* Add Room Form */}
    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>
        {editingRoomId ? 'Edit Room' : 'Add New Room'}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '12px' }}>
        <input
          type="text"
          placeholder="Room Name"
          className="dh-search"
          value={editingRoomId ? editRoomData.name : newRoomData.name}
          onChange={(e) => editingRoomId 
            ? setEditRoomData({ ...editRoomData, name: e.target.value })
            : setNewRoomData({ ...newRoomData, name: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Capacity"
          className="dh-search"
          value={editingRoomId ? editRoomData.capacity : newRoomData.capacity}
          onChange={(e) => editingRoomId
            ? setEditRoomData({ ...editRoomData, capacity: e.target.value })
            : setNewRoomData({ ...newRoomData, capacity: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Description"
          className="dh-search"
          value={editingRoomId ? editRoomData.description : newRoomData.description}
          onChange={(e) => editingRoomId
            ? setEditRoomData({ ...editRoomData, description: e.target.value })
            : setNewRoomData({ ...newRoomData, description: e.target.value })
          }
        />
        <button
          className="dh-btn-primary"
          onClick={editingRoomId ? updateRoom : createRoom}
        >
          {editingRoomId ? 'Update Room' : 'Create Room'}
        </button>
      </div>
      {editingRoomId && (
        <button
          className="dh-btn-cancel"
          style={{ marginTop: '10px' }}
          onClick={() => {
            setEditingRoomId(null);
            setEditRoomData({ name: '', capacity: '', description: '' });
          }}
        >
          Cancel Edit
        </button>
      )}
    </div>

    {/* Rooms Grid */}
    <div className="dh-leads-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      {roomsLoading && <div className="dh-empty">Loading rooms...</div>}
      {!roomsLoading && roomsData.length === 0 && (
        <div className="dh-empty">No rooms found. Create your first room!</div>
      )}
      {roomsData.map((room) => (
        <div key={room.id} className="dh-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#F07B2B' }}>{room.name}</h3>
            <span className={`dh-status ${room.is_active ? 's-confirmed' : 's-rejected'}`}>
              {room.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p style={{ marginTop: '8px', color: '#888' }}>👥 Capacity: {room.capacity} people</p>
          <p style={{ marginTop: '4px', color: '#666', fontSize: '12px' }}>{room.description || 'No description'}</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button className="dh-action-btn btn-view" onClick={() => startEditRoom(room)}>✏️ Edit</button>
            <button className="dh-action-btn btn-reject" onClick={() => deleteRoom(room.id)}>🗑️ Delete</button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

            {/* ── ROOMS ── */}
            {activeNav === "rooms" && <Rooms />}

            {/* ── LEADS ── */}
            {activeNav === "leads" && (
              <div className="dh-panel">
                <div className="dh-panel-hd">
                  <div>
                    <div className="dh-panel-title">Lead Pipeline</div>
                    <div className="dh-panel-sub">Track inquiries from new to converted</div>
                  </div>
                  <button className="dh-btn-primary" onClick={() => {
                    const name = prompt("New lead name:");
                    if (!name) return;
                    const phone = prompt("Phone number:");
                    setLeads(p => [...p, { id: Date.now(), name, initials: name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(), color:"#6c63ff", stage:"new", phone: phone||"", note:"" }]);
                    addToast(`${name} added to pipeline`, "green", "🎯");
                  }}>+ Add Lead</button>
                </div>
                {/* Pipeline columns */}
                <div className="dh-leads-grid">
                  {["new","follow-up","converted"].map(stage => (
                    <div key={stage} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:14,border:"1px solid rgba(255,255,255,0.07)"}}>
                      <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:12,
                        color:stage==="new"?"#3B82F6":stage==="follow-up"?"#F59E0B":"#22C55E"}}>
                        {stage} ({leads.filter(l=>l.stage===stage).length})
                      </div>
                      {leads.filter(l => l.stage === stage).map(l => (
                        <div key={l.id} style={{background:"#1E1E1E",borderRadius:8,padding:14,marginBottom:10,border:"1px solid rgba(255,255,255,0.07)"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                            <Avatar initials={l.initials} color={l.color} size={30}/>
                            <div>
                              <div style={{fontSize:12,fontWeight:600}}>{l.name}</div>
                              <div style={{fontSize:10,color:"#888"}}>{l.phone}</div>
                            </div>
                          </div>
                          {l.note && <div style={{fontSize:11,color:"#888",marginBottom:10,fontStyle:"italic",lineHeight:1.5}}>"{l.note}"</div>}
                          <div style={{marginBottom:8}}>
                            <input className="dh-note-input" placeholder="Add a note..." defaultValue={l.note}
                              onChange={e => setNoteInputs(p => ({...p,[l.id]:e.target.value}))}/>
                          </div>
                          <div style={{display:"flex",gap:6}}>
                            <button className="dh-lead-btn" onClick={() => saveNote(l.id)}>💬 Save</button>
                            {stage !== "converted" && (
                              <button className="dh-lead-btn" style={{color:"#22C55E",borderColor:"rgba(34,197,94,0.2)"}}
                                onClick={() => advanceLead(l.id)}>
                                → {stage==="new"?"Follow Up":"Convert"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeNav === "notifications" && (
              <div className="dh-panel">
                <div className="dh-panel-hd">
                  <div className="dh-panel-title">🔔 All Notifications</div>
                  <button className="dh-panel-link" onClick={() => addToast("Notifications cleared","green","✓")}>Clear all</button>
                </div>
                {bookings.filter(b=>b.status==="pending").map(b => (
                  <div key={b.id} className="dh-alert-item">
                    <div className="dh-alert-icon" style={{background:"rgba(245,158,11,0.12)"}}>⏳</div>
                    <div style={{flex:1}}>
                      <div className="dh-alert-title">Pending Approval — {b.name}</div>
                      <div className="dh-alert-desc">{b.room} · {b.slot} · {b.date} · Ksh {b.amount.toLocaleString()}</div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button className="dh-action-btn btn-approve" onClick={() => { approveBooking(b.id); }}>✓ Approve</button>
                      <button className="dh-action-btn btn-reject"  onClick={() => { rejectBooking(b.id); }}>✗ Reject</button>
                    </div>
                  </div>
                ))}
                {bookings.filter(b=>b.payment==="pending").map(b => (
                  <div key={`pay-${b.id}`} className="dh-alert-item">
                    <div className="dh-alert-icon" style={{background:"rgba(240,123,43,0.12)"}}>💳</div>
                    <div>
                      <div className="dh-alert-title">Payment Pending — {b.name}</div>
                      <div className="dh-alert-desc">Ksh {b.amount.toLocaleString()} outstanding for {b.room} on {b.date}</div>
                    </div>
                    <div className="dh-alert-time">Today</div>
                  </div>
                ))}
                {bookings.filter(b=>!b.doc).map(b => (
                  <div key={`doc-${b.id}`} className="dh-alert-item">
                    <div className="dh-alert-icon" style={{background:"rgba(239,68,68,0.12)"}}>📄</div>
                    <div>
                      <div className="dh-alert-title">Missing Qualification Document — {b.name}</div>
                      <div className="dh-alert-desc">Client has not uploaded proof of professional qualification</div>
                    </div>
                    <div className="dh-alert-time">Today</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── ANALYTICS ── */}
            {activeNav === "analytics" && (
              <>
                <div className="dh-stats">
                  <div className="dh-stat">
                    <div className="dh-stat-top"><div className="dh-stat-icon" style={{background:"rgba(240,123,43,0.12)"}}>📅</div><span className="dh-badge-up">↑ 12%</span></div>
                    <div className="dh-stat-num">{bookings.length}</div>
                    <div className="dh-stat-label">Total Bookings</div>
                  </div>
                  <div className="dh-stat">
                    <div className="dh-stat-top"><div className="dh-stat-icon" style={{background:"rgba(34,197,94,0.12)"}}>💰</div><span className="dh-badge-up">↑ 8%</span></div>
                    <div className="dh-stat-num" style={{fontSize:22}}>{totalRevenue.toLocaleString()}</div>
                    <div className="dh-stat-label">Total Revenue (Ksh)</div>
                  </div>
                  <div className="dh-stat">
                    <div className="dh-stat-top"><div className="dh-stat-icon" style={{background:"rgba(59,130,246,0.12)"}}>🏛️</div></div>
                    <div className="dh-stat-num">78%</div>
                    <div className="dh-stat-label">Private Office Utilisation</div>
                  </div>
                  <div className="dh-stat">
                    <div className="dh-stat-top"><div className="dh-stat-icon" style={{background:"rgba(124,58,237,0.12)"}}>⭐</div></div>
                    <div className="dh-stat-num">10am</div>
                    <div className="dh-stat-label">Peak Booking Hour</div>
                  </div>
                </div>
                <div className="dh-grid2">
                  <div className="dh-panel">
                    <div className="dh-panel-hd"><div className="dh-panel-title">Revenue by Day</div></div>
                    <div style={{padding:"20px 20px 10px"}}>
                      <div className="dh-bars" style={{height:140}}>
                        {[["Mon",45000],["Tue",70000],["Wed",90000],["Thu",55000],["Fri",65000],["Sat",30000]].map(([d,v]) => (
                          <div key={d} className="dh-bar-grp">
                            <div style={{fontSize:10,color:"#888",marginBottom:4}}>Ksh {(v/1000).toFixed(0)}k</div>
                            <div className="dh-bar" style={{height:`${v/1000}%`,background:`rgba(240,123,43,${0.3+v/300000})`}}></div>
                            <div className="dh-bar-lbl">{d}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="dh-panel">
                    <div className="dh-panel-hd"><div className="dh-panel-title">Bookings by Room</div></div>
                    <div style={{padding:20,display:"flex",flexDirection:"column",gap:16}}>
                      {ROOMS.map((room,i) => {
                        const count = bookings.filter(b=>b.room===room).length;
                        const pct = Math.round((count/bookings.length)*100);
                        const colors = ["#F07B2B","#3B82F6","#22C55E"];
                        return (
                          <div key={room}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                              <span style={{fontSize:12,fontWeight:600}}>{room}</span>
                              <span style={{fontSize:12,color:"#888"}}>{count} bookings ({pct}%)</span>
                            </div>
                            <div className="dh-bar-bg" style={{width:"100%"}}>
                              <div className="dh-bar-fill" style={{width:`${pct}%`,background:colors[i]}}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{padding:"0 20px 20px"}}>
                      <div style={{background:"rgba(240,123,43,0.08)",border:"1px solid rgba(240,123,43,0.15)",borderRadius:8,padding:14}}>
                        <div style={{fontSize:11,color:"#F07B2B",fontWeight:700,marginBottom:4}}>💡 Insight</div>
                        <div style={{fontSize:12,color:"#888",lineHeight:1.6}}>Private Office is the most in-demand space. Consider adding capacity or increasing the rate.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </main>

        {/* ── BOOKING DETAIL MODAL ── */}
        {viewBooking && (
          <div className="dh-modal-overlay" onClick={() => setViewBooking(null)}>
            <div className="dh-modal" onClick={e => e.stopPropagation()}>
              <div className="dh-modal-hd">
                <div>
                  <div className="dh-modal-title">Booking {viewBooking.id}</div>
                  <StatusBadge status={viewBooking.status}/>
                </div>
                <button className="dh-modal-close" onClick={() => setViewBooking(null)}>✕</button>
              </div>
              <div className="dh-modal-body">
                <div style={{display:"flex",alignItems:"center",gap:14,padding:"4px 0"}}>
                  <Avatar initials={viewBooking.initials} color={viewBooking.color} size={48}/>
                  <div>
                    <div style={{fontSize:16,fontWeight:700}}>{viewBooking.name}</div>
                    <div style={{fontSize:12,color:"#888",marginTop:3}}>{viewBooking.type}</div>
                  </div>
                </div>
                {[
                  ["Room",        `${viewBooking.roomIcon} ${viewBooking.room}`],
                  ["Date",        viewBooking.date],
                  ["Time Slot",   viewBooking.slot],
                  ["Amount",      `Ksh ${viewBooking.amount.toLocaleString()}`],
                  ["Payment",     viewBooking.payment],
                  ["Document",    viewBooking.doc ? "✅ Uploaded" : "❌ Missing"],
                ].map(([k,v]) => (
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                    <span style={{fontSize:12,color:"#888"}}>{k}</span>
                    <span style={{fontSize:12,fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="dh-modal-ft">
                {viewBooking.status === "pending" && <>
                  <button className="dh-action-btn btn-approve" style={{padding:"9px 18px",fontSize:12}} onClick={() => { approveBooking(viewBooking.id); setViewBooking(null); }}>✓ Approve</button>
                  <button className="dh-action-btn btn-reject"  style={{padding:"9px 18px",fontSize:12}} onClick={() => { rejectBooking(viewBooking.id);  setViewBooking(null); }}>✗ Reject</button>
                </>}
                <button className="dh-action-btn btn-reject" style={{padding:"9px 18px",fontSize:12}} onClick={() => deleteBooking(viewBooking.id)}>🗑 Delete</button>
                <button className="dh-btn-cancel" onClick={() => setViewBooking(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* ── NEW BOOKING MODAL ── */}
        {showModal && (
          <div className="dh-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="dh-modal" onClick={e => e.stopPropagation()}>
              <div className="dh-modal-hd">
                <div className="dh-modal-title">New Booking</div>
                <button className="dh-modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div className="dh-modal-body">
                <div className="dh-form-row">
                  <div className="dh-form-group">
                    <label>Client Name *</label>
                    <input placeholder="Jane Mwangi" value={newBooking.name} onChange={e => setNewBooking(p=>({...p,name:e.target.value}))}/>
                  </div>
                  <div className="dh-form-group">
                    <label>Client Type</label>
                    <select value={newBooking.type} onChange={e => setNewBooking(p=>({...p,type:e.target.value}))}>
                      <option>ADR Practitioner</option>
                      <option>Young Advocate</option>
                      <option>DR Hub Member</option>
                    </select>
                  </div>
                </div>
                <div className="dh-form-row">
                  <div className="dh-form-group">
                    <label>Room</label>
                    <select value={newBooking.room} onChange={e => setNewBooking(p=>({...p,room:e.target.value}))}>
                      <option>Private Office</option>
                      <option>Boardroom</option>
                      <option>Combined</option>
                    </select>
                  </div>
                  <div className="dh-form-group">
                    <label>Time Slot</label>
                    <select value={newBooking.slot} onChange={e => setNewBooking(p=>({...p,slot:e.target.value}))}>
                      {SLOTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="dh-form-row">
                  <div className="dh-form-group">
                    <label>Date *</label>
                    <input type="date" value={newBooking.date} onChange={e => setNewBooking(p=>({...p,date:e.target.value}))}/>
                  </div>
                  <div className="dh-form-group">
                    <label>Amount (Ksh) *</label>
                    <input type="number" placeholder="6000" value={newBooking.amount} onChange={e => setNewBooking(p=>({...p,amount:e.target.value}))}/>
                  </div>
                </div>
              </div>
              <div className="dh-modal-ft">
                <button className="dh-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="dh-btn-primary" onClick={submitNewBooking}>Create Booking</button>
              </div>
            </div>
          </div>
        )}

        {/* ── USER FORM MODAL ── */}
        {showUserModal && (
          <div className="dh-modal-overlay" onClick={() => setShowUserModal(false)}>
            <div className="dh-modal" onClick={(e) => e.stopPropagation()}>
              <div className="dh-modal-hd">
                <div className="dh-modal-title">
                  {editingUserId ? "Edit User" : "Add User"}
                </div>
                <button className="dh-modal-close" onClick={() => setShowUserModal(false)}>
                  ✕
                </button>
              </div>
              <div className="dh-modal-body">
                <div className="dh-form-row">
                  <div className="dh-form-group">
                    <label>Name *</label>
                    <input
                      value={userForm.name}
                      onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="dh-form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {!editingUserId && (
                  <>
                    <div className="dh-form-group">
                      <label>Password *</label>
                      <input
                        type="password"
                        minLength={8}
                        value={userForm.password}
                        onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))}
                        placeholder="At least 8 characters"
                      />
                    </div>
                    <div className="dh-form-group">
                      <label>Role</label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                  </>
                )}

                {editingUserId && (
                  <>
                    <div className="dh-form-row">
                      <div className="dh-form-group">
                        <label>Phone Number</label>
                        <input
                          value={userForm.phoneNumber}
                          onChange={(e) => setUserForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                          placeholder="+254..."
                        />
                      </div>
                      <div className="dh-form-group">
                        <label>Gender</label>
                        <select
                          value={userForm.gender}
                          onChange={(e) => setUserForm((p) => ({ ...p, gender: e.target.value }))}
                        >
                          <option value="">Not set</option>
                          <option value="MALE">MALE</option>
                          <option value="FEMALE">FEMALE</option>
                          <option value="OTHER">OTHER</option>
                        </select>
                      </div>
                    </div>

                    <div className="dh-form-row">
                      <div className="dh-form-group">
                        <label>City</label>
                        <input
                          value={userForm.city}
                          onChange={(e) => setUserForm((p) => ({ ...p, city: e.target.value }))}
                          placeholder="City"
                        />
                      </div>
                      <div className="dh-form-group">
                        <label>Country</label>
                        <input
                          value={userForm.country}
                          onChange={(e) => setUserForm((p) => ({ ...p, country: e.target.value }))}
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div className="dh-form-group">
                      <label>Occupation</label>
                      <input
                        value={userForm.occupation}
                        onChange={(e) => setUserForm((p) => ({ ...p, occupation: e.target.value }))}
                        placeholder="Occupation"
                      />
                    </div>

                    <div className="dh-form-group">
                      <label>Address</label>
                      <input
                        value={userForm.address}
                        onChange={(e) => setUserForm((p) => ({ ...p, address: e.target.value }))}
                        placeholder="Address"
                      />
                    </div>

                    <div className="dh-form-row">
                      <div className="dh-form-group">
                        <label>Status</label>
                        <select
                          value={userForm.status}
                          onChange={(e) => setUserForm((p) => ({ ...p, status: e.target.value }))}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </div>
                      <div className="dh-form-group">
                        <label>Role</label>
                        <select
                          value={userForm.role}
                          onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}
                        >
                          <option value="MEMBER">MEMBER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {userFormError && (
                  <div style={{ color: "#ffb4b4", fontSize: 12 }}>{userFormError}</div>
                )}
              </div>
              <div className="dh-modal-ft">
                <button className="dh-btn-cancel" onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
                <button className="dh-btn-primary" onClick={submitUserForm} disabled={userFormSubmitting}>
                  {userFormSubmitting ? "Saving..." : editingUserId ? "Save Changes" : "Create User"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DOCUMENT PREVIEW MODAL ── */}
        {previewDocument && (
          <div className="dh-modal-overlay" onClick={() => setPreviewDocument(null)}>
            <div className="dh-modal" onClick={(e) => e.stopPropagation()}>
              <div className="dh-modal-hd">
                <div className="dh-modal-title">Document Preview</div>
                <button className="dh-modal-close" onClick={() => setPreviewDocument(null)}>✕</button>
              </div>
              <div className="dh-modal-body">
                <div><strong>Name:</strong> {previewDocument.documentName}</div>
                <div><strong>Status:</strong> {mapDocumentStatus(previewDocument.status)}</div>
                <div><strong>Uploaded:</strong> {previewDocument.createdAt ? new Date(previewDocument.createdAt).toLocaleString() : "-"}</div>
                <div><strong>Reference:</strong> {previewDocument.documentFile || "-"}</div>
                {String(previewDocument.documentFile || "").startsWith("http") ? (
                  <a
                    href={previewDocument.documentFile}
                    target="_blank"
                    rel="noreferrer"
                    className="dh-panel-link"
                  >
                    Open document in new tab
                  </a>
                ) : (
                  <div style={{ color: "#888", fontSize: 12 }}>
                    File content preview is not available yet. This document currently stores a filename reference.
                  </div>
                )}
              </div>
              <div className="dh-modal-ft">
                <button className="dh-btn-cancel" onClick={() => setPreviewDocument(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* TOASTS */}
        <Toast toasts={toasts}/>
      </div>
    </>
  );
}

