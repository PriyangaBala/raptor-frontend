import React from 'react';
import {
  LayoutGrid,
  Languages,
  TrendingUp,
  ShieldCheck,
  Terminal,
  Database,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function Sidebar({
  activeView,
  setActiveView,
  currentUser,
  onLogout
}) {
  const userInitials = (currentUser?.name || currentUser?.email || 'AI')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside className="w-64 bg-[#11162b] text-slate-300 flex flex-col justify-between shrink-0 select-none z-20">
      <div className="p-4 flex flex-col gap-6 overflow-y-auto">
        {/* AISC Official Logo & Portal Brand */}
        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="bg-white p-1 rounded-xl shadow-xs border border-white/20 shrink-0">
            <img
              src="/aisc-logo.png"
              alt="AISC"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <div className="font-bold text-white tracking-wide text-sm leading-tight">Raptor360</div>
            <div className="text-[10px] text-blue-300 font-medium tracking-wider uppercase">Analytics Portal</div>
          </div>
        </div>

        {/* Navigation Menus */}
        <nav className="flex flex-col gap-1.5 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Dashboards
          </div>

          {/* 1. Overview */}
          <button
            onClick={() => {}}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition opacity-60 cursor-not-allowed"
          >
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="w-4 h-4 text-slate-400" />
              <span className="font-medium">Overview</span>
            </div>
          </button>

          {/* 2. WIDA Dashboard (Active) */}
          <button
            onClick={() => setActiveView('wida')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition ${
              activeView === 'wida'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Languages className="w-4 h-4 text-white" />
              <span>WIDA Dashboard</span>
            </div>
            {activeView === 'wida' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
          </button>

          {/* 3. MAP Growth */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="font-medium">MAP Growth</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">soon</span>
          </div>

          {/* 4. Query Manager */}
          <div className="pt-4 pb-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Data Management
            </div>
          </div>
          <button
            onClick={() => setActiveView('query_manager')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition ${
              activeView === 'query_manager'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="font-medium">Query Manager</span>
            </div>
            <span className="text-[9px] font-mono bg-blue-950/80 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded">
              BigQuery
            </span>
          </button>

          {/* 5. Access Control info */}
          <div className="pt-4 pb-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Access Control
            </div>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Live RBAC Mode</span>
            </div>
            <span className="text-[9px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
              @DS_USER_EMAIL
            </span>
          </div>
        </nav>
      </div>

      {/* Bottom: Logged-in Staff User Profile & Logout */}
      <div className="p-3 bg-black/40 border-t border-white/5 space-y-2">
        <div className="text-[10px] text-slate-400 uppercase font-semibold px-1 flex justify-between items-center">
          <span>Signed In Staff</span>
          <span className="text-emerald-400 font-mono text-[9px] bg-emerald-950/60 border border-emerald-800 px-1 py-0.5 rounded">
            LIVE BQ
          </span>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1b223c]/80 border border-white/5">
          <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {userInitials}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {currentUser?.name || currentUser?.email || 'AISC Staff'}
            </div>
            <div className="text-[10px] text-blue-300 truncate font-mono">
              Role: {currentUser?.role || 'Principal'}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 transition text-xs font-semibold cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
