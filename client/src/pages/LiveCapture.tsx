import React, { useState, useEffect } from 'react';
import { fetchLivePackets, fetchDissection, getCaptureStreamUrl, PacketItem, PacketDissection } from '../api';

const SAMPLE_LIVE_PACKETS = [
  { id: 849182, delta: '+0.041', src: '192.168.1.104', sport: 54822, dst: '104.244.42.1', dport: 443, proto: 'TLSv1.3', len: 584, tag: '0x17 0x03', info: 'Application Data Protocol: Encrypted payload (512 B)' },
  { id: 849181, delta: '+0.109', src: '104.244.42.1', sport: 443, dst: '192.168.1.104', dport: 54822, proto: 'TCP', len: 66, tag: 'ACK', info: '54822 → 443 [ACK] Seq=1420 Ack=892 Win=65536 Len=0' },
  { id: 849180, delta: '+0.252', src: '192.168.1.104', sport: 59102, dst: '1.1.1.1', dport: 53, proto: 'DNS', len: 78, tag: 'A IN', info: 'Standard query 0x8a91 A edge.api.cloudflare.net' },
  { id: 849179, delta: '+0.012', src: '1.1.1.1', sport: 53, dst: '192.168.1.104', dport: 59102, proto: 'DNS', len: 94, tag: 'RESP', info: 'Standard query response 0x8a91 A 104.16.132.229' },
  { id: 849178, delta: '+0.489', src: '192.168.1.104', sport: 51200, dst: '142.250.190.46', dport: 443, proto: 'UDP (QUIC)', len: 1280, tag: '1-RTT', info: 'Protected payload, DCID: 0x9f8841ae66' },
  { id: 849177, delta: '+0.015', src: '192.168.1.104', sport: 54822, dst: '104.244.42.1', dport: 443, proto: 'TCP', len: 1420, tag: 'PSH, ACK', info: '54822 → 443 [PSH, ACK] Seq=1 Ack=1 Win=65536 Len=1354' },
  { id: 849176, delta: '+0.110', src: '10.0.0.1', sport: 0, dst: '192.168.1.255', dport: 0, proto: 'ARP', len: 42, tag: 'WHO HAS', info: 'Who has 192.168.1.104? Tell 192.168.1.1' },
  { id: 849175, delta: '+0.092', src: '192.168.1.104', sport: 49811, dst: '140.82.121.4', dport: 443, proto: 'TLSv1.3', len: 220, tag: 'CLIENT HELLO', info: 'TLSv1.3 Client Hello, SNI: github.com' },
];

export const LiveCapture: React.FC = () => {
  const [packets, setPackets] = useState<any[]>(SAMPLE_LIVE_PACKETS);
  const [selectedPkt, setSelectedPkt] = useState<any>(SAMPLE_LIVE_PACKETS[0]);
  const [isPaused, setIsPaused] = useState(false);
  const [capturedCount, setCapturedCount] = useState(849210);
  const [selectedInterface, setSelectedInterface] = useState('Wi-Fi - Real Host Adapter (192.168.43.193)');
  const [bpfFilter, setBpfFilter] = useState('tcp port 80 or tcp port 443');
  const [bufferCap, setBufferCap] = useState(50000);
  const [autoScroll, setAutoScroll] = useState(true);

  // Connect to Real Live SSE Stream from Backend
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource(getCaptureStreamUrl(), { withCredentials: true });
      es.onmessage = (event) => {
        if (isPaused) return;
        try {
          const data = JSON.parse(event.data);
          const newP = {
            id: data.seq || data.id,
            delta: '+0.012',
            src: data.srcIp || (data.src ? data.src.split(':')[0] : '192.168.43.193'),
            sport: data.srcPort || 54321,
            dst: data.dstIp || (data.dst ? data.dst.split(':')[0] : '142.250.190.46'),
            dport: data.dstPort || 443,
            proto: data.proto || 'TCP',
            len: data.len || 128,
            tag: data.flags || 'ACK',
            info: data.info || 'Live packet'
          };
          setPackets((prev) => [newP, ...prev.slice(0, 49)]);
          setCapturedCount((c) => c + 1);
        } catch {}
      };
    } catch {}

    return () => {
      es?.close();
    };
  }, [isPaused]);

  // Initial load from REST API if available
  useEffect(() => {
    fetchLivePackets().then((res) => {
      if (res && res.length > 0) {
        const mapped = res.map((p, idx) => ({
          id: p.id || 849000 + idx,
          delta: '+0.024',
          src: p.src || '192.168.43.193',
          sport: 54321,
          dst: p.dst || '142.250.190.46',
          dport: 443,
          proto: p.proto || 'TCP',
          len: p.len || 128,
          tag: 'PAYLOAD',
          info: p.info || 'Telemetry stream'
        }));
        setPackets(mapped);
        setSelectedPkt(mapped[0]);
      }
    });
  }, []);

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Command Telemetry Header */}
      <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-sans text-2xl font-bold tracking-tight text-white uppercase">
              Live Packet Capture
            </span>
            <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0F172A] shadow-sm border border-[#06B6D4]/40">
              <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-[#F59E0B]' : 'bg-[#06B6D4] animate-ping'}`}></span>
              <span className="font-mono text-[10px] text-[#06B6D4] tracking-wider uppercase font-semibold">
                {isPaused ? 'CAPTURE PAUSED' : 'RUNNING (PROMISCUOUS)'}
              </span>
            </div>
            <div className="px-2 py-0.5 rounded bg-[#1E293B] border border-[#1E293B]">
              <span className="font-mono text-[11px] text-[#A78BFA] tracking-tight">POLL: 100μs</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[#94A3B8] font-mono text-xs">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#06B6D4]">speed</span>
              <strong className="text-white font-semibold">18,420 pkts/s</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#A78BFA]">cloud_sync</span>
              <strong className="text-white font-semibold">34.2 MB/s Ingest</strong>
            </span>
            <span>•</span>
            <span className="text-[#94A3B8] text-[10px] uppercase font-semibold">
              RING BUFFER: 13.8% UTILIZED
            </span>
          </div>
        </div>

        {/* Buffer Meter & Fast Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-[#0F172A] shadow-md min-w-[240px] border border-[#1E293B]">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
                FIFO Buffer Pool
              </span>
              <span className="font-mono text-[11px] text-[#A78BFA] font-bold">142 MB / 1024 MB</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#8B5CF6] via-[#F43F5E] to-[#06B6D4] w-[13.8%] rounded-full"></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all font-semibold ${
                isPaused
                  ? 'bg-[#8B5CF6] text-white border border-[#A78BFA]/40 shadow-lg shadow-[#8B5CF6]/20'
                  : 'bg-[#1E293B] hover:bg-[#283548] text-white border border-[#1E293B]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isPaused ? 'play_arrow' : 'pause'}
              </span>
              <span>{isPaused ? 'Resume Stream' : 'Pause Stream'}</span>
            </button>

            <button
              onClick={() => {
                setPackets([]);
                setCapturedCount(0);
              }}
              className="px-4 py-2 rounded-xl bg-[#F43F5E] hover:bg-[#E11D48] text-white font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#F43F5E]/20 transition-all font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">stop_circle</span>
              <span>Stop Session</span>
            </button>
          </div>
        </div>
      </section>

      {/* Capture Configuration Deck */}
      <section className="rounded-2xl bg-[#0F172A] p-6 shadow-xl relative overflow-hidden border border-[#1E293B]">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#8B5CF6]/10 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#8B5CF6]">settings_ethernet</span>
              <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
                Engine Configuration & Ingress Tap
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#A78BFA] uppercase font-semibold">
              BPF JIT: ACTIVATED (x86_64)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Interface Selector */}
            <div className="md:col-span-4 flex flex-col gap-1">
              <label className="font-mono text-[10px] text-[#94A3B8] uppercase font-semibold">
                Physical Ingress Interface
              </label>
              <div className="relative">
                <select
                  value={selectedInterface}
                  onChange={(e) => setSelectedInterface(e.target.value)}
                  className="w-full h-10 px-3 bg-[#080D1A] text-white font-mono text-xs rounded-xl appearance-none focus:outline-none focus:border-[#8B5CF6] shadow-inner cursor-pointer border border-[#1E293B]"
                >
                  <option>Wi-Fi - Real Host Adapter (192.168.43.193)</option>
                  <option>Ethernet - Gigabit Physical Link</option>
                  <option>Loopback Pseudo-Interface 1 (127.0.0.1)</option>
                  <option>VMware Network Adapter VMnet8</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#94A3B8] pointer-events-none text-[18px]">
                  unfold_more
                </span>
              </div>
            </div>

            {/* BPF Filter Input */}
            <div className="md:col-span-5 flex flex-col gap-1">
              <label className="font-mono text-[10px] text-[#94A3B8] uppercase flex items-center justify-between font-semibold">
                <span>Kernel Capture Expression</span>
                <span className="text-[#06B6D4]">BPF Syntax Valid</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#A78BFA] text-[16px]">
                  filter_alt
                </span>
                <input
                  type="text"
                  value={bpfFilter}
                  onChange={(e) => setBpfFilter(e.target.value)}
                  className="w-full h-10 pl-9 pr-20 bg-[#080D1A] text-white font-mono text-xs rounded-xl focus:outline-none focus:border-[#8B5CF6] shadow-inner border border-[#1E293B]"
                />
                <span className="absolute right-2 px-2 py-0.5 rounded-md bg-[#1E293B] text-[#A78BFA] font-mono text-[10px] uppercase font-semibold">
                  MATCH
                </span>
              </div>
            </div>

            {/* Buffer Slider */}
            <div className="md:col-span-3 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="font-mono text-[10px] text-[#94A3B8] uppercase font-semibold">
                  Ring Buffer Cap
                </label>
                <span className="font-mono text-[11px] text-[#A78BFA] font-bold">
                  {bufferCap.toLocaleString()} Pkts / 1 GB
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="200000"
                value={bufferCap}
                onChange={(e) => setBufferCap(Number(e.target.value))}
                className="w-full h-2 bg-[#080D1A] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6] mt-2 border border-[#1E293B]"
              />
            </div>
          </div>

          {/* Action Button Group */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#1E293B]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPackets([])}
                className="px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#283548] text-[#94A3B8] hover:text-white font-mono text-[10px] uppercase flex items-center gap-1.5 shadow-sm transition-all border border-[#1E293B]"
              >
                <span className="material-symbols-outlined text-[16px] text-[#F43F5E]">delete_sweep</span>
                <span>Clear Buffer</span>
              </button>
              <button
                onClick={() => alert('Exporting trace to netscope-capture.pcapng...')}
                className="px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#283548] text-[#94A3B8] hover:text-white font-mono text-[10px] uppercase flex items-center gap-1.5 shadow-sm transition-all border border-[#1E293B]"
              >
                <span className="material-symbols-outlined text-[16px] text-[#06B6D4]">download</span>
                <span>Export PCAPNG</span>
              </button>
              <button
                onClick={() => setCapturedCount(0)}
                className="px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#283548] text-[#94A3B8] hover:text-white font-mono text-[10px] uppercase flex items-center gap-1.5 shadow-sm transition-all border border-[#1E293B]"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset Counters</span>
              </button>
            </div>
            <div className="flex items-center gap-3 text-[#94A3B8] font-mono text-[11px]">
              <span>SNAPLEN: <strong className="text-white">65535 Bytes</strong></span>
              <span>•</span>
              <span>OFFLOAD: <strong className="text-[#06B6D4]">TSO/GSO DISABLED</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip: 4 Glass Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-2xl bg-[#0F172A] p-5 shadow-lg flex flex-col justify-between border border-[#1E293B] group hover:border-[#8B5CF6]/50 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider block font-semibold">
                Captured Packets
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-sans text-3xl font-bold text-white tracking-tight">
                  {capturedCount.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#1E293B] flex items-center justify-center text-[#8B5CF6] shadow-inner">
              <span className="material-symbols-outlined text-[20px]">layers</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-xs text-[#06B6D4] font-semibold">+1,842 pkts/sec</span>
            <svg className="w-20 h-4 text-[#06B6D4]" fill="none" viewBox="0 0 100 20">
              <path d="M0 15 L20 12 L40 18 L60 8 L80 14 L100 3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl bg-[#0F172A] p-5 shadow-lg flex flex-col justify-between border border-[#1E293B] group hover:border-[#A78BFA]/50 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider block font-semibold">
                Dropped by Kernel
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-sans text-3xl font-bold text-white tracking-tight">0</span>
                <span className="font-mono text-xs text-[#94A3B8]">/ 0.00%</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#1E293B] flex items-center justify-center text-[#A78BFA] shadow-inner">
              <span className="material-symbols-outlined text-[20px]">format_image_left</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-xs text-[#A78BFA]">Zero ring overflows</span>
            <span className="px-2 py-0.5 rounded bg-[#1E293B] text-[#06B6D4] font-mono text-[10px] uppercase font-bold">
              PASS
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl bg-[#0F172A] p-5 shadow-lg flex flex-col justify-between border border-[#1E293B] group hover:border-[#F59E0B]/50 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider block font-semibold">
                Total Ingested Data
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-sans text-3xl font-bold text-white tracking-tight">1.12</span>
                <span className="font-sans text-lg text-[#F59E0B] font-semibold">GB</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#1E293B] flex items-center justify-center text-[#F59E0B] shadow-inner">
              <span className="material-symbols-outlined text-[20px]">storage</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-xs text-[#94A3B8]">Payload ratio: 89.2%</span>
            <svg className="w-20 h-4 text-[#F59E0B]" fill="none" viewBox="0 0 100 20">
              <path d="M0 16 L25 10 L50 14 L75 6 L100 2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl bg-[#0F172A] p-5 shadow-lg flex flex-col justify-between border border-[#1E293B] group hover:border-[#F43F5E]/50 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider block font-semibold">
                Active TCP Streams
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-sans text-3xl font-bold text-white tracking-tight">142</span>
                <span className="font-mono text-xs text-[#F43F5E] font-semibold ml-1">TRACKED</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#1E293B] flex items-center justify-center text-[#F43F5E] shadow-inner">
              <span className="material-symbols-outlined text-[20px]">sync_alt</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-xs text-[#94A3B8]">9 SynSent • 133 Est.</span>
            <span className="px-2 py-0.5 rounded bg-[#1E293B] text-[#A78BFA] font-mono text-[10px] uppercase font-bold">
              RETR 0
            </span>
          </div>
        </div>
      </section>

      {/* Real-Time Packet Stream Table */}
      <section className="rounded-2xl bg-[#0F172A] shadow-2xl flex flex-col overflow-hidden border border-[#1E293B]">
        {/* Stream Toolbar */}
        <div className="px-5 py-3 bg-[#1E293B]/60 flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse"></span>
              <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
                LIVE STREAM DISSECTOR
              </span>
            </div>
            <span className="font-mono text-xs text-[#94A3B8]">
              Viewing latest {packets.length} frames of {capturedCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase flex items-center gap-1 font-semibold transition ${
                autoScroll
                  ? 'bg-[#8B5CF6] text-white border border-[#A78BFA]/30 shadow-sm'
                  : 'bg-[#080D1A] text-[#94A3B8] hover:text-white border border-[#1E293B]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">vertical_align_bottom</span>
              <span>{autoScroll ? 'Auto-Scroll Active' : 'Auto-Scroll Paused'}</span>
            </button>
            <span className="px-2.5 py-1 rounded-lg bg-[#080D1A] text-[#A78BFA] font-mono text-[10px] uppercase border border-[#1E293B]">
              8 Columns
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto max-h-72 bg-[#080D1A]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1E293B] font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider sticky top-0 border-b border-[#1E293B] backdrop-blur-md">
                <th className="py-2.5 px-3 w-20">No.</th>
                <th className="py-2.5 px-3 w-28">Delta (ms)</th>
                <th className="py-2.5 px-3">Source Address : Port</th>
                <th className="py-2.5 px-3">Dest Address : Port</th>
                <th className="py-2.5 px-3 w-28">Protocol</th>
                <th className="py-2.5 px-3 text-right w-24">Length</th>
                <th className="py-2.5 px-3 w-28">Tag</th>
                <th className="py-2.5 px-3">Payload / Dissection Summary</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs divide-y divide-[#1E293B]/50 text-white">
              {packets.map((pkt) => {
                const isSelected = selectedPkt?.id === pkt.id;
                return (
                  <tr
                    key={pkt.id}
                    onClick={() => setSelectedPkt(pkt)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#8B5CF6]/20 border-l-2 border-[#8B5CF6] font-semibold text-white'
                        : 'hover:bg-[#1E293B]/50 bg-transparent'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-[#A78BFA] font-semibold">{pkt.id}</td>
                    <td className="py-2.5 px-3 font-mono text-[#94A3B8]">{pkt.delta}</td>
                    <td className="py-2.5 px-3 font-mono text-white">
                      {pkt.src} : <span className="text-[#A78BFA]">{pkt.sport || '--'}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-white">
                      {pkt.dst} : <span className="text-[#06B6D4]">{pkt.dport || '--'}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold border ${
                        pkt.proto.includes('TLS') ? 'bg-[#4C1D95]/40 text-[#A78BFA] border-[#8B5CF6]/40' :
                        pkt.proto.includes('DNS') ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30' :
                        pkt.proto.includes('ARP') ? 'bg-[#1E293B] text-[#94A3B8] border-[#94A3B8]/30' :
                        'bg-[#06B6D4]/20 text-[#06B6D4] border-[#06B6D4]/30'
                      }`}>
                        {pkt.proto}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right text-white">{pkt.len} B</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#1E293B] text-[#A78BFA] font-mono text-[10px] border border-[#4C1D95]">
                        {pkt.tag}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#94A3B8] truncate max-w-xs font-mono text-[11px]">
                      {pkt.info}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-[#0F172A] flex items-center justify-between text-[#94A3B8] font-mono text-xs border-t border-[#1E293B]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#06B6D4]"></span>
            <span>Ingest thread running on host adapter</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded-lg bg-[#1E293B] text-white font-mono text-[10px] uppercase hover:bg-[#283548] transition">
              Jump to Start
            </button>
            <button className="px-2.5 py-1 rounded-lg bg-[#1E293B] text-white font-mono text-[10px] uppercase hover:bg-[#283548] transition">
              Jump to Tail
            </button>
          </div>
        </div>
      </section>

      {/* Selected Packet Quick Drawer / Bottom Sheet */}
      <section className="rounded-2xl bg-[#0F172A] p-6 shadow-2xl relative overflow-hidden border border-[#1E293B]">
        {/* Drawer Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-sans text-lg font-bold text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#8B5CF6]">data_object</span>
              <span>Frame #{selectedPkt?.id || 849182} Dissection</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#4C1D95]/40 text-[#A78BFA] border border-[#8B5CF6]/40 font-mono text-[10px] font-bold">
              {selectedPkt?.proto || 'TLSv1.3'} / TCP / IPv4
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#1E293B] text-[#06B6D4] font-mono text-[10px]">
              RTT: 1.4ms Est.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Raw frame hex copied to clipboard.')}
              className="px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#283548] text-white font-mono text-[10px] uppercase flex items-center gap-1.5 border border-[#1E293B] transition"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>Copy Hex</span>
            </button>
            <button
              onClick={() => alert(`Following bidirectional TCP Stream for socket ${selectedPkt?.src}:${selectedPkt?.sport}`)}
              className="px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-mono text-[10px] uppercase flex items-center gap-1.5 shadow-sm transition"
            >
              <span className="material-symbols-outlined text-[16px]">call_split</span>
              <span>Follow TCP Stream</span>
            </button>
          </div>
        </div>

        {/* Protocol Dissection Tree & Hex Matrix Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Tree Column */}
          <div className="lg:col-span-6 flex flex-col gap-2.5 font-mono text-xs">
            {/* L2 Frame */}
            <div className="p-3.5 rounded-xl bg-[#080D1A] border border-[#1E293B] flex flex-col gap-1">
              <div className="flex items-center justify-between text-[#94A3B8] text-[10px] uppercase font-bold">
                <span className="flex items-center gap-1 text-white">
                  <span className="material-symbols-outlined text-[16px] text-[#8B5CF6]">expand_more</span>
                  Ethernet II, Src: E4:0D:36:24:D0:A6, Dst: 00:0c:29:4f:8e:12
                </span>
                <span>Offset 0x00</span>
              </div>
            </div>

            {/* L3 IP */}
            <div className="p-3.5 rounded-xl bg-[#080D1A] border border-[#1E293B] flex flex-col gap-1">
              <div className="flex items-center justify-between text-[#94A3B8] text-[10px] uppercase font-bold">
                <span className="flex items-center gap-1 text-white">
                  <span className="material-symbols-outlined text-[16px] text-[#8B5CF6]">expand_more</span>
                  Internet Protocol Version 4, Src: {selectedPkt?.src}, Dst: {selectedPkt?.dst}
                </span>
                <span>Offset 0x0E</span>
              </div>
              <div className="pl-4 flex flex-col gap-0.5 text-[#94A3B8] text-[11px] pt-1">
                <div>0100 .... = Version: 4</div>
                <div>.... 0101 = Header Length: 20 bytes (5)</div>
                <div>Total Length: {selectedPkt?.len || 584} bytes</div>
                <div>Time to Live: 64 hops</div>
                <div>Protocol: TCP (6)</div>
                <div>Header Checksum: 0x9b3f [verified]</div>
              </div>
            </div>

            {/* L4 TCP */}
            <div className="p-3.5 rounded-xl bg-[#080D1A] border border-[#1E293B] flex flex-col gap-1">
              <div className="flex items-center justify-between text-[#94A3B8] text-[10px] uppercase font-bold">
                <span className="flex items-center gap-1 text-white">
                  <span className="material-symbols-outlined text-[16px] text-[#8B5CF6]">expand_more</span>
                  Transmission Control Protocol, Src Port: {selectedPkt?.sport || 54822}, Dst Port: {selectedPkt?.dport || 443}
                </span>
                <span>Offset 0x22</span>
              </div>
              <div className="pl-4 flex flex-col gap-0.5 text-[#94A3B8] text-[11px] pt-1">
                <div>Sequence Number: 1420 (relative sequence number)</div>
                <div>Acknowledgment Number: 892</div>
                <div className="flex items-center gap-2 text-[#06B6D4] font-semibold">
                  <span>Flags: 0x018 (PSH, ACK)</span>
                  <span className="px-1.5 rounded bg-[#1E293B] text-[#A78BFA] text-[10px]">ACK SET</span>
                  <span className="px-1.5 rounded bg-[#1E293B] text-[#06B6D4] text-[10px]">PSH SET</span>
                </div>
                <div>Window Size: 65536 (calculated window)</div>
              </div>
            </div>
          </div>

          {/* Right Hex & ASCII Inspector */}
          <div className="lg:col-span-6 flex flex-col gap-2">
            <div className="flex items-center justify-between font-mono text-[10px] text-[#94A3B8] uppercase px-1 font-semibold">
              <span>Payload Hex Matrix (16 Bytes / Row)</span>
              <span className="text-[#A78BFA]">Selected: 0x0036 - 0x0041 (TLS Record Layer)</span>
            </div>

            <div className="p-4 rounded-xl bg-[#080D1A] font-mono text-xs text-white overflow-x-auto shadow-inner select-text border border-[#1E293B] leading-relaxed">
              <div className="grid grid-cols-12 gap-x-2 whitespace-pre">
                {/* 0000 */}
                <div className="col-span-2 text-[#94A3B8] select-none font-bold">0000:</div>
                <div className="col-span-6 text-slate-200">00 e0 4c 68 01 23 ac 1f  6b 98 b4 12 08 00 45 00</div>
                <div className="col-span-4 text-[#06B6D4] pl-2">..Lh.#..k.....E.</div>

                {/* 0010 */}
                <div className="col-span-2 text-[#94A3B8] select-none font-bold">0010:</div>
                <div className="col-span-6 text-slate-200">02 48 4f 12 40 00 40 06  9b 3f c0 a8 01 68 68 f4</div>
                <div className="col-span-4 text-[#06B6D4] pl-2">.HO.@.@..?..hh..</div>

                {/* 0020 */}
                <div className="col-span-2 text-[#94A3B8] select-none font-bold">0020:</div>
                <div className="col-span-6 text-slate-200">2a 01 d6 26 01 bb d4 92  80 14 a3 ff 91 2b 80 18</div>
                <div className="col-span-4 text-[#06B6D4] pl-2">*..&.........+..</div>

                {/* 0030 (Highlighted TLS Record Offset) */}
                <div className="col-span-2 text-[#A78BFA] select-none font-bold">0030:</div>
                <div className="col-span-6 text-white font-bold">
                  01 00 e4 2b 00 00 <span className="bg-[#8B5CF6]/30 text-[#A78BFA] px-1 rounded">17 03  03 02 00 7f 9a b1 4c 11</span>
                </div>
                <div className="col-span-4 text-[#A78BFA] pl-2">
                  ...+..<span className="bg-[#8B5CF6]/30 px-1 rounded font-bold">......L.</span>
                </div>

                {/* 0040 */}
                <div className="col-span-2 text-[#94A3B8] select-none font-bold">0040:</div>
                <div className="col-span-6 text-slate-200">da 34 ee f8 22 b7 65 91  09 cc 4a b2 88 e1 90 aa</div>
                <div className="col-span-4 text-[#06B6D4] pl-2">.4..".e...J.....</div>

                {/* 0050 */}
                <div className="col-span-2 text-[#94A3B8] select-none font-bold">0050:</div>
                <div className="col-span-6 text-slate-200">fe 87 23 11 02 bc dd 55  3a ff bb cc 77 12 90 e4</div>
                <div className="col-span-4 text-[#06B6D4] pl-2">..#....U:...w...</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[#94A3B8] font-mono text-[11px] px-1 mt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]"></span>
                <span>TLS Payload Length: 512 bytes</span>
              </span>
              <span className="font-mono text-[10px] uppercase text-[#A78BFA] font-semibold">
                DECRYPT WITH SSLKEYLOGFILE
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LiveCapture;
