import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Live Overview', path: '/', icon: 'dashboard' },
  { name: 'Live Capture', path: '/live', icon: 'stream' },
  { name: 'Packet Explorer', path: '/packets', icon: 'terminal' },
  { name: 'Protocols', path: '/protocols', icon: 'donut_large' },
  { name: 'Connections', path: '/flows', icon: 'swap_calls' },
  { name: 'Security Events', path: '/anomalies', icon: 'security' },
  { name: 'Capture Sessions', path: '/sessions', icon: 'history_toggle_off' },
  { name: 'Settings', path: '/settings', icon: 'settings' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0F172A] border-r border-[#1E293B] z-50 flex flex-col justify-between shadow-2xl select-none">
      <div className="flex flex-col">
        {/* Brand Header with NCS Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] opacity-60 blur-xs"></div>
              <img
                src="/ncs-icon-circle.png"
                alt="NCS Logo"
                className="relative w-8 h-8 rounded-full object-cover border border-[#06B6D4] shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold tracking-wider text-white flex items-center gap-1.5">
                NETSCOPE <span className="text-[#06B6D4] font-extrabold">NCS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-pulse"></span>
              </span>
              <span className="font-mono text-[9px] text-[#A78BFA] uppercase tracking-widest font-semibold">
                NOC TELEMETRY
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#1E293B] border border-[#06B6D4]/40 text-[#00F2FE] font-mono text-[9px] uppercase font-bold">
            v3.5
          </span>
        </div>

        {/* Section Label */}
        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              Live Operations
            </span>
            <span className="font-mono text-[10px] text-[#06B6D4] font-bold">STREAM ONLINE</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1 px-3 overflow-y-auto max-h-[calc(100vh-250px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-mono ${
                  isActive
                    ? 'bg-[#06B6D4]/15 text-[#00F2FE] font-semibold border-l-2 border-[#06B6D4] shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
                }`
              }
            >
              <span className="material-symbols-outlined text-[18px] opacity-90">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#1E293B] bg-[#080D1A] flex flex-col gap-2">
        <div className="p-2.5 rounded-lg bg-[#0F172A] border border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-ping"></span>
            <span className="font-mono text-[10px] text-slate-200 uppercase font-semibold">
              KERNEL SNIFFER
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#00F2FE] font-bold">REAL-TIME</span>
        </div>
        <div className="flex items-center justify-between px-1 text-[10px] font-mono text-[#94A3B8]">
          <span>HOST: WI-FI / ETH</span>
          <span className="text-[#A78BFA]">SSE: ACTIVE</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
