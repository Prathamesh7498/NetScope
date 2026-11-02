import React, { useState } from 'react';

export const Settings: React.FC = () => {
  const [snaplen, setSnaplen] = useState(65535);
  const [ringBufferSize, setRingBufferSize] = useState(1024);
  const [truncatePayload, setTruncatePayload] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6 max-w-4xl">
      {/* Title */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0F172A]/95 backdrop-blur-xl p-6 shadow-xl border border-[#1E293B]">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[24px] text-[#8B5CF6]">settings</span>
          <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
            Capture Engine & Driver Configuration
          </h1>
        </div>
        <p className="text-xs text-[#94A3B8] mt-1 font-sans">
          Tune ring buffer allocation, snaplen payload limits, and network operator credentials.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-[#4C1D95]/40 border border-[#8B5CF6]/50 text-[#A78BFA] text-xs font-mono font-semibold px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[18px] text-[#06B6D4]">check_circle</span>
          <span>Capture driver parameters updated in kernel session profile.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Network Operator Identity */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#8B5CF6]">terminal</span>
            <span>Network Engineer Credentials</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-[#94A3B8] mb-1 font-medium">Operator Call-Sign / ID</label>
              <input
                type="text"
                defaultValue="operator.sec"
                className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6] transition-all"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-1 font-medium">Assigned Security Clearance</label>
              <input
                type="text"
                defaultValue="Tier 4 (Full Promiscuous Ingress)"
                disabled
                className="w-full bg-[#080D1A]/60 border border-[#1E293B] rounded-xl px-3 py-2 text-[#94A3B8] cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Capture Engine Tuning */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#A78BFA]">tune</span>
            <span>Ring Buffer & Ingress Limits</span>
          </h2>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[#94A3B8] mb-1">
                <span>Kernel Snaplen (Bytes per Frame)</span>
                <span className="text-[#A78BFA] font-bold">{snaplen} Bytes</span>
              </div>
              <input
                type="range"
                min="68"
                max="65535"
                step="1"
                value={snaplen}
                onChange={(e) => setSnaplen(Number(e.target.value))}
                className="w-full h-2 bg-[#080D1A] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6] border border-[#1E293B]"
              />
              <span className="text-[10px] text-[#94A3B8] block mt-1">
                Full payload dissection requires 65535 (standard jumbo headroom).
              </span>
            </div>

            <div>
              <div className="flex justify-between text-[#94A3B8] mb-1">
                <span>DMA Ring Buffer Allocation</span>
                <span className="text-[#06B6D4] font-bold">{ringBufferSize} MB</span>
              </div>
              <input
                type="range"
                min="128"
                max="4096"
                step="128"
                value={ringBufferSize}
                onChange={(e) => setRingBufferSize(Number(e.target.value))}
                className="w-full h-2 bg-[#080D1A] rounded-lg appearance-none cursor-pointer accent-[#06B6D4] border border-[#1E293B]"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={truncatePayload}
                  onChange={(e) => setTruncatePayload(e.target.checked)}
                  className="rounded text-[#8B5CF6] bg-[#080D1A] border-[#1E293B] focus:ring-[#8B5CF6]"
                />
                <span className="text-white">Truncate payload for high-throughput lines (Save RAM)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-mono text-xs font-bold shadow-lg shadow-[#8B5CF6]/30 transition-all"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
