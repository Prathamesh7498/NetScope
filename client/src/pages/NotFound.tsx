import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 font-mono">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl space-y-4">
        <div className="w-14 h-14 bg-[#1E293B] text-[#A78BFA] rounded-2xl flex items-center justify-center mx-auto border border-[#4C1D95]/40">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA] bg-[#4C1D95]/40 px-2.5 py-0.5 rounded-full border border-[#8B5CF6]/30">
            HTTP 404 Not Found
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight">NOC Route Missing</h1>
          <p className="text-xs text-[#94A3B8] leading-relaxed font-sans">
            The requested packet buffer, interface telemetry, or flow record cannot be located.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>NOC Dashboard</span>
          </Link>
          <Link
            to="/packets"
            className="inline-flex items-center gap-1.5 bg-[#1E293B] hover:bg-[#283548] text-[#94A3B8] hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Packet Explorer</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
