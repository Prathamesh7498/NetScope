import React, { useState, useEffect } from 'react';
import { fetchFlows } from '../api';

export const FlowDetails: React.FC = () => {
  const [flows, setFlows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [protoFilter, setProtoFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlows().then((data) => {
      setFlows(data);
      setLoading(false);
    });
    const interval = setInterval(() => {
      fetchFlows().then(setFlows);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filtered = flows.filter((f) => {
    const matchProto = protoFilter === 'All' || f.proto === protoFilter;
    const matchSearch =
      (f.src || '').includes(search) ||
      (f.dst || '').includes(search) ||
      (f.process || '').toLowerCase().includes(search.toLowerCase()) ||
      String(f.id).includes(search);
    return matchProto && matchSearch;
  });

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Title */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0F172A]/95 backdrop-blur-xl p-6 shadow-xl border border-[#1E293B]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[24px] text-[#8B5CF6]">swap_calls</span>
              <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
                Real Host Socket Connection Matrix
              </h1>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 font-sans">
              Live bidirectional socket session tracking on host OS (Local Socket ↔ Remote Socket), process association, and status.
            </p>
          </div>
          <span className="font-mono text-xs text-[#A78BFA] bg-[#4C1D95]/40 px-3.5 py-1.5 rounded-lg border border-[#8B5CF6]/40 font-bold shadow-sm">
            {filtered.length} ACTIVE SOCKETS
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by IP, socket, or process name (e.g. chrome, python)..."
            className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] transition-all"
          />
          <span className="material-symbols-outlined text-[16px] text-[#94A3B8] absolute left-3 top-2.5">
            search
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {['All', 'TCP', 'UDP'].map((p) => (
            <button
              key={p}
              onClick={() => setProtoFilter(p)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all ${
                protoFilter === p
                  ? 'bg-[#8B5CF6] text-white border border-[#A78BFA]/30 shadow-sm'
                  : 'bg-[#080D1A] text-[#94A3B8] hover:text-white border border-[#1E293B] hover:bg-[#1E293B]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Flows Table */}
      <div className="rounded-2xl bg-[#0F172A] p-6 shadow-2xl flex flex-col gap-4 border border-[#1E293B]">
        <div className="overflow-x-auto rounded-xl bg-[#080D1A] border border-[#1E293B]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#1E293B] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#1E293B]">
                <th className="py-2.5 px-3">Flow ID</th>
                <th className="py-2.5 px-3">Local Socket</th>
                <th className="py-2.5 px-3">Remote Socket</th>
                <th className="py-2.5 px-3">Protocol</th>
                <th className="py-2.5 px-3">Process</th>
                <th className="py-2.5 px-3 text-right">Packets</th>
                <th className="py-2.5 px-3 text-right">Volume</th>
                <th className="py-2.5 px-3 text-center">Socket State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-[#1E293B]/50 transition-colors">
                  <td className="py-2.5 px-3 text-[#A78BFA] font-semibold">{f.id}</td>
                  <td className="py-2.5 px-3 text-white font-medium">{f.src}</td>
                  <td className="py-2.5 px-3 text-slate-200">{f.dst}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#4C1D95]/40 text-[#A78BFA] border border-[#8B5CF6]/30 text-[10px] font-bold">
                      {f.proto}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#A78BFA] font-semibold text-[11px]">
                    {f.process || 'System Socket'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-white font-semibold">
                    {f.packets}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#06B6D4]">
                    {f.bytes}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        f.status === 'ESTABLISHED'
                          ? 'bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30'
                          : f.status === 'SYN_SENT' || f.status === 'SYN_FLOOD'
                          ? 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/30'
                          : 'bg-[#1E293B] text-[#A78BFA]'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FlowDetails;
