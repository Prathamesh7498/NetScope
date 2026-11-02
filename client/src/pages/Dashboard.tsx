import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchStatsSummary, fetchLivePackets, fetchAnomalies, StatsSummary, StreamPacket } from '../api';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsSummary>({
    totalMbps: 18.2,
    rxMbps: 13.4,
    txMbps: 4.8,
    pps: 1940,
    activeConversations: 60,
    tcpStreams: 48,
    udpFlows: 12,
    kernelBufferDrops: 0,
    anomaliesCount: 3
  });

  const [packets, setPackets] = useState<StreamPacket[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      fetchStatsSummary().then(setStats);
      fetchLivePackets().then((pkts) => {
        if (pkts && pkts.length > 0) setPackets(pkts);
      });
      fetchAnomalies().then((anom) => {
        if (anom && anom.length > 0) setAnomalies(anom);
      });
    };

    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Banner with NCS Emblem */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0F172A]/95 backdrop-blur-xl p-6 shadow-xl border border-[#1E293B]">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#06B6D4]/15 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-[#8B5CF6]/15 blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0 hidden sm:block">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] opacity-70 blur-xs"></div>
              <img
                src="/ncs-icon-circle.png"
                alt="NCS Logo"
                className="relative w-14 h-14 rounded-full object-cover border-2 border-[#06B6D4] shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#00F2FE] font-bold">
                  NCS LIVE COMMAND TELEMETRY
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-ping"></span>
              </div>
              <h1 className="font-sans text-2xl font-bold tracking-tight text-white mt-1">
                Network Operations Overview
              </h1>
              <p className="font-sans text-xs text-[#94A3B8] mt-1">
                Real-time packet inspection, host socket forensics & live interface telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/live"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] hover:from-[#00F2FE] hover:to-[#A78BFA] text-[#080D1A] font-mono text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">stream</span>
              <span>LAUNCH LIVE CAPTURE</span>
            </Link>

            <Link
              to="/upload"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#283548] text-slate-200 font-mono text-xs uppercase font-semibold transition-all border border-[#1E293B] shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-[#00F2FE]">file_open</span>
              <span>PCAP WORKSPACE</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards with Midnight Pulse Palette */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 - Real-time Throughput (Neon Cyan #06B6D4) */}
        <div className="rounded-2xl p-5 bg-[#0F172A] shadow-lg flex flex-col justify-between border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              REAL-TIME THROUGHPUT
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#06B6D4]">speed</span>
          </div>
          <div className="my-2.5 font-mono">
            <div className="text-3xl font-bold text-white">
              {stats.totalMbps} <span className="text-sm font-normal text-[#94A3B8]">Mbps</span>
            </div>
            <span className="text-xs text-[#06B6D4] flex items-center gap-1 mt-1 font-semibold">
              Rx: {stats.rxMbps} Mbps • Tx: {stats.txMbps} Mbps
            </span>
          </div>
          <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#06B6D4] h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]"
              style={{ width: `${Math.min(stats.totalMbps * 4, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2 - Ingest Rate (Electric Purple #8B5CF6 / Vibrant Violet #A78BFA) */}
        <div className="rounded-2xl p-5 bg-[#0F172A] shadow-lg flex flex-col justify-between border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              INGEST RATE (PPS)
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#8B5CF6]">timeline</span>
          </div>
          <div className="my-2.5 font-mono">
            <div className="text-3xl font-bold text-[#A78BFA]">
              {stats.pps.toLocaleString()} <span className="text-sm font-normal text-[#94A3B8]">pps</span>
            </div>
            <span className="text-xs text-[#A78BFA] flex items-center gap-1 mt-1">
              Zero buffer drops (0.00%)
            </span>
          </div>
          <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#8B5CF6] h-full w-[65%] rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
          </div>
        </div>

        {/* Metric 3 - Active Conversations (Neon Orange #F59E0B) */}
        <div className="rounded-2xl p-5 bg-[#0F172A] shadow-lg flex flex-col justify-between border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              ACTIVE CONVERSATIONS
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#F59E0B]">swap_calls</span>
          </div>
          <div className="my-2.5 font-mono">
            <div className="text-3xl font-bold text-white">{stats.activeConversations}</div>
            <span className="text-xs text-[#F59E0B] flex items-center gap-1 mt-1 font-semibold">
              {stats.tcpStreams} TCP Streams • {stats.udpFlows} UDP Flows
            </span>
          </div>
          <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#F59E0B] h-full w-[78%] rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
          </div>
        </div>

        {/* Metric 4 - Security Alerts (Cyber Rose #F43F5E) */}
        <div className="rounded-2xl p-5 bg-[#0F172A] shadow-lg flex flex-col justify-between border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              SECURITY ALERTS
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#F43F5E]">security</span>
          </div>
          <div className="my-2.5 font-mono">
            <div className="text-3xl font-bold text-[#F43F5E]">{stats.anomaliesCount} ACTIVE</div>
            <span className="text-xs text-[#F43F5E]/80 flex items-center gap-1 mt-1 font-semibold">
              SYN Scan, DNS Tunnel, Sweep
            </span>
          </div>
          <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#F43F5E] h-full w-full rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Live Stream Sample & Recent Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Quick Stream Summary */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0F172A] p-6 shadow-xl flex flex-col gap-4 border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#06B6D4]">stream</span>
              <h3 className="font-sans text-base font-semibold text-white">Live Captured Stream Preview</h3>
            </div>
            <Link to="/live" className="text-xs font-mono text-[#00F2FE] hover:underline font-bold transition">
              OPEN FULL DISSECTOR →
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl bg-[#080D1A] border border-[#1E293B]">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#1E293B] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#1E293B]">
                  <th className="py-2.5 px-3">Seq</th>
                  <th className="py-2.5 px-3">Protocol</th>
                  <th className="py-2.5 px-3">Source → Destination</th>
                  <th className="py-2.5 px-3 text-right">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60">
                {(packets.length > 0 ? packets.slice(0, 6) : [
                  { id: 101, seq: 101, proto: 'TLSv1.3', src: '192.168.43.193:54210', dst: '142.250.190.46:443', len: 1420 },
                  { id: 102, seq: 102, proto: 'DNS', src: '192.168.43.193:58102', dst: '1.1.1.1:53', len: 78 },
                  { id: 103, seq: 103, proto: 'TCP', src: '192.168.43.193:51900', dst: '13.107.4.52:443', len: 64 }
                ]).map((pkt) => (
                  <tr key={pkt.id || pkt.seq} className="hover:bg-[#1E293B]/50 transition-colors">
                    <td className="py-2.5 px-3 text-[#00F2FE] font-semibold">{pkt.seq || pkt.id}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#06B6D4]/15 text-[#00F2FE] border border-[#06B6D4]/30 text-[10px] font-bold">
                        {pkt.proto}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 truncate max-w-[280px]">
                      {pkt.src} → {pkt.dst}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#94A3B8] font-semibold">{pkt.len} B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Security Anomalies */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0F172A] p-6 shadow-xl flex flex-col gap-4 border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#F43F5E]">warning</span>
              <h3 className="font-sans text-base font-semibold text-white">Detected Security Alerts</h3>
            </div>
            <Link to="/anomalies" className="text-xs font-mono text-[#F43F5E] hover:underline font-bold transition">
              VIEW ALL ({anomalies.length || 3}) →
            </Link>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {(anomalies.length > 0 ? anomalies.slice(0, 3) : [
              {
                id: 'ANOM-801',
                type: 'SYN Flood / Half-Open Exhaustion',
                severity: 'CRITICAL',
                source: '198.51.100.44',
                target: '192.168.43.193:443',
                description: 'Unanswered TCP SYN packets exceeding normal window baseline.'
              },
              {
                id: 'ANOM-802',
                type: 'Subdomain DNS Tunneling',
                severity: 'HIGH',
                source: '192.168.43.193',
                target: '8.8.8.8:53',
                description: 'High-entropy TXT records detected over recursive resolver.'
              }
            ]).map((anom) => (
              <div
                key={anom.id}
                className={`p-3.5 rounded-xl bg-[#080D1A] border transition-all ${
                  anom.severity === 'CRITICAL'
                    ? 'border-[#F43F5E]/50 hover:border-[#F43F5E]'
                    : anom.severity === 'HIGH'
                    ? 'border-[#F59E0B]/50 hover:border-[#F59E0B]'
                    : 'border-[#06B6D4]/40 hover:border-[#06B6D4]'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={
                      anom.severity === 'CRITICAL'
                        ? 'text-[#F43F5E] font-bold text-xs'
                        : anom.severity === 'HIGH'
                        ? 'text-[#F59E0B] font-bold text-xs'
                        : 'text-[#00F2FE] font-bold text-xs'
                    }
                  >
                    {anom.type}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      anom.severity === 'CRITICAL'
                        ? 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/30'
                        : anom.severity === 'HIGH'
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
                        : 'bg-[#06B6D4]/20 text-[#00F2FE] border border-[#06B6D4]/30'
                    }`}
                  >
                    {anom.severity}
                  </span>
                </div>
                <p className="font-sans text-xs text-[#94A3B8] mt-1">{anom.description}</p>
                <div className="text-[10px] text-[#A78BFA] mt-1.5 font-mono">
                  {anom.source} → {anom.target}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
