import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-[#0F172A] border-b border-[#1E293B] text-[#A78BFA] px-4 py-2 text-xs flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold bg-[#06B6D4]/15 text-[#00F2FE] px-2.5 py-0.5 rounded-full border border-[#06B6D4]/40 text-[11px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00F2FE]" />
          REAL-TIME TELEMETRY ACTIVE
        </span>
        <span className="text-[#94A3B8] hidden sm:inline">
          Live packet streams, byte dumps, and socket flows are actively captured from host network adapters.
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[#94A3B8] text-[11px]">
        <Activity className="w-3.5 h-3.5 text-[#06B6D4]" />
        <span>Connected to NCS Live Engine</span>
      </div>
    </div>
  );
};

export default DemoBanner;
