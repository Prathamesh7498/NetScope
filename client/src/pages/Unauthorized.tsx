import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, KeyRound } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 font-mono">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl space-y-4">
        <div className="w-14 h-14 bg-[#F43F5E]/15 text-[#F43F5E] rounded-2xl flex items-center justify-center mx-auto border border-[#F43F5E]/30">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#F43F5E] bg-[#F43F5E]/15 px-2.5 py-0.5 rounded-full border border-[#F43F5E]/30">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight">Privileged Interface Restricted</h1>
          <p className="text-xs text-[#94A3B8] leading-relaxed font-sans">
            Capturing packets on raw network sockets requires root or CAP_NET_RAW privileges.
          </p>
        </div>

        <div className="bg-[#080D1A] p-3 rounded-xl border border-[#1E293B] text-[11px] text-[#94A3B8] text-left space-y-1">
          <p>Required: CAP_NET_RAW / WinPcap Admin</p>
          <p>Current: UNPRIVILEGED_VIEWER</p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 bg-[#1E293B] hover:bg-[#283548] text-[#94A3B8] hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Login as Root</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
