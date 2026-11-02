import React, { useState, useEffect } from 'react';
import { fetchProtocolStats, ProtocolStatsData } from '../api';

export const ProtocolStats: React.FC = () => {
  const [data, setData] = useState<ProtocolStatsData>({
    transport: [
      { proto: 'TCP (Transmission Control Protocol)', pct: 82, bytes: '39.5 MB', color: 'bg-[#8B5CF6]' },
      { proto: 'UDP (User Datagram Protocol)', pct: 15, bytes: '7.2 MB', color: 'bg-[#06B6D4]' },
      { proto: 'ICMP (Internet Control Message Protocol)', pct: 3, bytes: '1.4 MB', color: 'bg-[#94A3B8]' },
    ],
    application: [
      { proto: 'TLS 1.3 / HTTPS (Encrypted)', pct: 68, bytes: '32.7 MB', color: 'bg-[#A78BFA]' },
      { proto: 'DNS (Domain Name Queries)', pct: 18, bytes: '8.6 MB', color: 'bg-[#F59E0B]' },
      { proto: 'HTTP/2 & GRPC (Web API)', pct: 14, bytes: '6.7 MB', color: 'bg-[#F43F5E]' },
    ],
    topEndpoints: [
      { ip: '192.168.43.193', hostname: 'host-operator.local', rxBytes: '42.8 MB', txBytes: '12.4 MB', pkts: '54,200', role: 'Active Host Workstation' },
      { ip: '142.250.190.46', hostname: 'google-edge.1e100.net', rxBytes: '28.1 MB', txBytes: '3.2 MB', pkts: '24,100', role: 'External Cloud CDN' },
      { ip: '1.1.1.1', hostname: 'one.one.one.one', rxBytes: '410 KB', txBytes: '380 KB', pkts: '4,800', role: 'Recursive DNS Resolver' },
    ]
  });

  useEffect(() => {
    fetchProtocolStats().then(setData);
    const interval = setInterval(() => {
      fetchProtocolStats().then(setData);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Title */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0F172A]/95 backdrop-blur-xl p-6 shadow-xl border border-[#1E293B]">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[24px] text-[#8B5CF6]">pie_chart</span>
          <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
            Protocol Statistics & Endpoint Telemetry
          </h1>
        </div>
        <p className="text-xs text-[#94A3B8] mt-1 font-sans">
          Live L4/L7 protocol distribution, bandwidth utilization, and high-volume host endpoints.
        </p>
      </div>

      {/* Layer Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transport Layer (L4) */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B]">
            <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#8B5CF6]">activity_zone</span>
              <span>Layer 4 Transport Distribution</span>
            </h2>
            <span className="text-xs text-[#A78BFA] font-mono font-semibold">Active Sockets</span>
          </div>

          <div className="space-y-4 pt-2 font-mono">
            {data.transport.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs text-white">
                  <span className="font-semibold">{item.proto}</span>
                  <span className="text-[#A78BFA] font-bold">{item.bytes} ({item.pct}%)</span>
                </div>
                <div className="w-full bg-[#080D1A] h-2 rounded-full overflow-hidden border border-[#1E293B]">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Layer (L7) */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B]">
            <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#A78BFA]">public</span>
              <span>Layer 7 Application Breakdown</span>
            </h2>
            <span className="text-xs text-[#A78BFA] font-mono font-semibold">Identified Streams</span>
          </div>

          <div className="space-y-4 pt-2 font-mono">
            {data.application.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs text-white">
                  <span className="font-semibold">{item.proto}</span>
                  <span className="text-[#A78BFA] font-bold">{item.bytes} ({item.pct}%)</span>
                </div>
                <div className="w-full bg-[#080D1A] h-2 rounded-full overflow-hidden border border-[#1E293B]">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Endpoints Table */}
      <div className="rounded-2xl bg-[#0F172A] p-6 shadow-2xl flex flex-col gap-4 border border-[#1E293B]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#06B6D4]">devices</span>
            <h3 className="font-sans text-base font-semibold text-white">High-Volume Talkers & Endpoints</h3>
          </div>
          <span className="font-mono text-xs text-[#94A3B8]">Active endpoints sorted by cumulative traffic</span>
        </div>

        <div className="overflow-x-auto rounded-xl bg-[#080D1A] border border-[#1E293B]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#1E293B] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#1E293B]">
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">Resolved Host</th>
                <th className="py-2.5 px-3">Role / Service</th>
                <th className="py-2.5 px-3 text-right">Packets</th>
                <th className="py-2.5 px-3 text-right">Inbound (Rx)</th>
                <th className="py-2.5 px-3 text-right">Outbound (Tx)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60">
              {data.topEndpoints.map((ep, idx) => (
                <tr key={idx} className="hover:bg-[#1E293B]/50 transition-colors">
                  <td className="py-2.5 px-3 text-[#A78BFA] font-semibold">{ep.ip}</td>
                  <td className="py-2.5 px-3 text-white">{ep.hostname}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#4C1D95]/40 text-[#A78BFA] border border-[#8B5CF6]/30 text-[10px] font-bold">
                      {ep.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-white font-semibold">{ep.pkts}</td>
                  <td className="py-2.5 px-3 text-right text-[#06B6D4] font-bold">{ep.rxBytes}</td>
                  <td className="py-2.5 px-3 text-right text-[#A78BFA] font-bold">{ep.txBytes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProtocolStats;
