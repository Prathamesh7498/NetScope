import React, { useState, useEffect } from 'react';
import { X, Play, Terminal, ShieldCheck } from 'lucide-react';
import { fetchInterfaces, NetworkInterface, startCapture } from '../api';

interface LiveCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveCaptureModal: React.FC<LiveCaptureModalProps> = ({ isOpen, onClose }) => {
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [selectedNic, setSelectedNic] = useState('Wi-Fi');
  const [bpfFilter, setBpfFilter] = useState('tcp port 80 or tcp port 443');
  const [promiscuous, setPromiscuous] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    fetchInterfaces().then((data) => {
      setInterfaces(data.interfaces);
      if (data.activeInterface) setSelectedNic(data.activeInterface);
    });
  }, []);

  if (!isOpen) return null;

  const handleStart = async () => {
    setCapturing(true);
    await startCapture(selectedNic, bpfFilter);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#06B6D4]/15 text-[#00F2FE] flex items-center justify-center border border-[#06B6D4]/40">
              <span className="material-symbols-outlined text-[20px]">radar</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono">Real-Time Packet Capture Engine</h2>
              <p className="text-xs text-[#94A3B8]">Bind live network sniffer to host interface</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#1E293B] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Status Banner */}
        <div className="bg-[#06B6D4]/10 border border-[#06B6D4]/30 rounded-xl p-3.5 text-xs text-[#00F2FE] flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#06B6D4] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-white">LIVE TELEMETRY ACTIVE (NCS SUBSYSTEM)</p>
            <p className="text-[#94A3B8] leading-relaxed text-[11px]">
              Capturing live packet telemetry and socket traces from real host adapters. Deep packet dissector extracts raw bytes and headers in real-time.
            </p>
          </div>
        </div>

        {/* Form Controls */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#94A3B8] mb-1 font-mono">
              Capture Interface (Network Adapter)
            </label>
            <select
              value={selectedNic}
              onChange={(e) => setSelectedNic(e.target.value)}
              className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl px-3 py-2.5 text-white font-mono focus:border-[#06B6D4] focus:outline-none transition-all cursor-pointer"
            >
              {interfaces.map((nic) => (
                <option key={nic.id} value={nic.id} className="bg-[#0F172A]">
                  {nic.name} — {nic.ip} ({nic.status}, {nic.speed})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#94A3B8] mb-1 font-mono">
              Berkeley Packet Filter (BPF Expression)
            </label>
            <div className="relative">
              <Terminal className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={bpfFilter}
                onChange={(e) => setBpfFilter(e.target.value)}
                placeholder="e.g. host 192.168.43.193 or tcp port 443"
                className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl pl-9 pr-3 py-2.5 text-white font-mono text-xs focus:border-[#06B6D4] focus:outline-none transition-all placeholder:text-[#94A3B8]/60"
              />
            </div>
            <p className="text-[10px] text-[#94A3B8] mt-1">
              Evaluated by kernel BPF bytecode filter before user-space buffer copy.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#1E293B]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={promiscuous}
                onChange={(e) => setPromiscuous(e.target.checked)}
                className="rounded text-[#06B6D4] bg-[#080D1A] border-[#1E293B] focus:ring-[#06B6D4]"
              />
              <span className="text-white font-medium">
                Enable Promiscuous Mode (Capture all subnet broadcast & unicast frames)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={authorized}
                onChange={(e) => setAuthorized(e.target.checked)}
                className="rounded text-[#06B6D4] bg-[#080D1A] border-[#1E293B] focus:ring-[#06B6D4]"
              />
              <span className="text-[#00F2FE] font-medium">
                Administrative authorization confirmed for operator inspection.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1E293B]">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#94A3B8] hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#1E293B] transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!authorized}
            onClick={handleStart}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] hover:from-[#00F2FE] hover:to-[#A78BFA] disabled:opacity-40 text-[#080D1A] font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-[#06B6D4]/25 transition font-mono"
          >
            <Play className="w-3.5 h-3.5 fill-[#080D1A]" />
            <span>{capturing ? 'Initializing Interface...' : 'Start Real Packet Capture'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
