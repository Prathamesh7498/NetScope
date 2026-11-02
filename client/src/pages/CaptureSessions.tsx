import React, { useState, useEffect } from 'react';
import { fetchSessions, importPcapOffline, CaptureSession } from '../api';

export const CaptureSessions: React.FC = () => {
  const [sessions, setSessions] = useState<CaptureSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchSessions().then(data => {
      setSessions(data);
      setLoading(false);
    });
  }, []);

  const handleSimulateImport = async () => {
    const ok = await importPcapOffline();
    if (ok) {
      setImportStatus('Offline PCAP trace successfully ingested and indexed for offline analysis.');
      setTimeout(() => setImportStatus(null), 5000);
      setShowImportModal(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-white uppercase">
            Capture Sessions & Archives
          </h1>
          <p className="font-mono text-xs text-[#94A3B8] mt-1">
            Historical packet capture records, offline telemetry repositories, and PCAP import archive.
          </p>
        </div>

        {/* Secondary PCAP Import Utility Action */}
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E293B] hover:bg-[#8B5CF6] border border-[#8B5CF6]/40 rounded-xl text-xs font-mono text-white transition-all shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">file_upload</span>
          <span>Import Offline PCAP Capture</span>
        </button>
      </div>

      {importStatus && (
        <div className="p-3.5 bg-[#4C1D95]/40 border border-[#8B5CF6]/50 rounded-xl text-xs font-mono text-[#A78BFA] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#06B6D4]">check_circle</span>
          <span>{importStatus}</span>
        </div>
      )}

      {/* Session Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-8 text-center font-mono text-xs text-[#94A3B8]">
            Loading archived sessions...
          </div>
        ) : (
          sessions.map(s => (
            <div
              key={s.id}
              className="p-5 bg-[#0F172A] border border-[#1E293B] rounded-2xl hover:border-[#8B5CF6]/50 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#4C1D95]/40 border border-[#8B5CF6]/40 font-mono text-[10px] text-[#A78BFA] uppercase font-semibold">
                    {s.interface}
                  </span>
                  <span className="font-mono text-[11px] text-[#94A3B8]">{s.date}</span>
                </div>
                <h3 className="font-mono text-sm font-semibold text-white mb-3">
                  {s.name}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#94A3B8] bg-[#080D1A] p-3 rounded-xl border border-[#1E293B]">
                  <div>
                    <span className="text-[#94A3B8] block text-[9px] uppercase font-semibold">Packets</span>
                    <span className="text-white font-bold">{s.packets.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[9px] uppercase font-semibold">Duration</span>
                    <span className="text-white font-bold">{s.duration}</span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[9px] uppercase font-semibold">Size</span>
                    <span className="text-white font-bold">{s.size}</span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[9px] uppercase font-semibold">Format</span>
                    <span className="text-[#06B6D4] font-bold">pcap-ng</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#94A3B8]">Archive #{s.id}</span>
                <button className="text-xs font-mono text-[#A78BFA] hover:text-[#8B5CF6] font-medium flex items-center gap-1 transition">
                  <span>Inspect Frames</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Secondary Offline PCAP Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B5CF6]">upload_file</span>
                <h2 className="font-mono text-sm font-bold text-white uppercase">
                  Offline PCAP Ingestion Utility
                </h2>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-[#94A3B8] hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="font-mono text-xs text-[#94A3B8] my-4 leading-relaxed">
              NetScope is designed primarily for live operations telemetry. Use this utility to import an offline WireShark (<code className="text-[#A78BFA]">.pcap</code> / <code className="text-[#A78BFA]">.pcapng</code>) file for deep packet dissection and anomaly analysis.
            </p>

            <div className="border-2 border-dashed border-[#1E293B] hover:border-[#8B5CF6]/60 rounded-xl p-8 text-center bg-[#080D1A] cursor-pointer mb-5 transition-all">
              <span className="material-symbols-outlined text-4xl text-[#8B5CF6] mb-2">drive_folder_upload</span>
              <p className="font-mono text-xs text-white mb-1">Drag and drop .pcap file here</p>
              <p className="font-mono text-[10px] text-[#94A3B8]">Max file size: 500 MB • Libpcap & PCAP-NG formats</p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3.5 py-1.5 font-mono text-xs text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#1E293B] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateImport}
                className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-mono text-xs font-bold rounded-xl shadow-md transition"
              >
                Parse & Dissect PCAP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptureSessions;
