import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SAMPLE_PCAPS = [
  { id: 'dmz', name: 'enterprise-dmz-traffic-2025.pcapng', size: '184.2 MB', frames: '1,482,904', hash: 'e7f1...94a8' },
  { id: 'core', name: 'core-backbone-synflood-sample.pcap', size: '412.0 MB', frames: '3,891,040', hash: '8a2b...19ff' },
  { id: 'tls', name: 'c2-beaconing-outbound-encrypted.cap', size: '29.6 MB', frames: '284,112', hash: '3c4d...8811' },
];

export const PcapUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState(SAMPLE_PCAPS[0]);
  const [activeTab, setActiveTab] = useState<'summary' | 'protocols' | 'flows' | 'anomalies'>('summary');
  const [flowFilter, setFlowFilter] = useState('');

  const sampleFlows = [
    { id: 'FL-00812', src: '10.240.12.84:54210', dst: '198.51.100.24:443', proto: 'TLS 1.3', pkts: '412,890', bytes: '54.2 MB', dur: '00:38:12', isBad: false },
    { id: 'FL-00941', src: '10.240.12.84:48122', dst: '203.0.113.88:80', proto: 'HTTP (AUTH)', pkts: '1,042', bytes: '894 KB', dur: '00:01:45', isBad: true },
    { id: 'FL-01032', src: '10.240.12.19:59102', dst: '1.1.1.1:53', proto: 'DNS', pkts: '82,109', bytes: '9.4 MB', dur: '00:41:09', isBad: false },
    { id: 'FL-01188', src: '192.168.1.188:various', dst: '10.0.0.1:443', proto: 'TCP (SYN)', pkts: '42,500', bytes: '2.7 MB', dur: '00:00:38', isBad: true },
  ];

  const filteredFlows = sampleFlows.filter(f =>
    f.id.toLowerCase().includes(flowFilter.toLowerCase()) ||
    f.src.includes(flowFilter) ||
    f.dst.includes(flowFilter) ||
    f.proto.toLowerCase().includes(flowFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Command & File Context Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0F172A]/95 backdrop-blur-xl p-6 shadow-xl border border-[#1E293B]">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#8B5CF6]/15 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-[#4C1D95]/20 blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#A78BFA] font-bold">
                OFFLINE TELEMETRY INGESTION
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]"></span>
              <span className="font-mono text-xs text-[#94A3B8]">NODE: LAB-ALPHA-09</span>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-sans text-2xl font-bold tracking-tight text-white">
                PCAP / PCAPNG Analysis Workspace
              </span>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1E293B] shadow-inner border border-[#1E293B]">
                <span className="material-symbols-outlined text-[16px] text-[#8B5CF6]">storage</span>
                <select
                  value={selectedFile.id}
                  onChange={(e) => {
                    const found = SAMPLE_PCAPS.find(p => p.id === e.target.value);
                    if (found) setSelectedFile(found);
                  }}
                  className="bg-transparent font-mono text-xs text-[#A78BFA] font-medium focus:outline-none cursor-pointer pr-2"
                >
                  {SAMPLE_PCAPS.map((f) => (
                    <option key={f.id} value={f.id} className="bg-[#0F172A] text-white">
                      {f.name} ({f.size})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch xl:self-auto justify-end">
            <button
              onClick={() => alert('Configuring wire parsing profiles...')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#283548] text-white font-mono text-xs uppercase font-semibold transition-all border border-[#1E293B] shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>PARSE PROFILES</span>
            </button>

            <button
              onClick={() => alert('Select a local PCAP or PCAPNG trace to parse...')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-mono text-xs font-bold shadow-[0_0_20px_rgba(139,92,246,0.35)] border border-[#A78BFA]/40 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>UPLOAD NEW PCAP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drag & Drop Ingestion Zone */}
      <div className="relative group rounded-2xl p-6 bg-[#0F172A] shadow-2xl transition-all overflow-hidden border border-[#1E293B]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/10 via-[#4C1D95]/15 to-[#06B6D4]/5 opacity-60"></div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-[#080D1A] border border-[#1E293B]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#4C1D95]/30 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6] shadow-[0_0_24px_rgba(139,92,246,0.2)]">
              <span className="material-symbols-outlined text-[32px]">inventory_2</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-sans text-base font-semibold text-white">
                  {selectedFile.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#06B6D4]/20 text-[#06B6D4] font-mono text-[10px] uppercase tracking-wider font-bold border border-[#06B6D4]/30">
                  COMPLETED
                </span>
                <span className="font-mono text-xs text-[#94A3B8]">MD5: {selectedFile.hash}</span>
              </div>
              <p className="font-sans text-xs text-[#94A3B8] mt-1">
                {selectedFile.size} total volume • {selectedFile.frames} frames parsed in 3.4s via WireSpeed Promiscuous Engine • LinkType: DLT_EN10MB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex flex-col items-end mr-2 hidden lg:flex">
              <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
                INGESTION THROUGHPUT
              </span>
              <span className="font-mono text-sm text-[#06B6D4] font-bold">436,148 frames/sec</span>
            </div>

            <button
              onClick={() => alert(`Re-indexing ${selectedFile.name}...`)}
              className="px-3.5 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#283548] text-white font-mono text-xs uppercase font-semibold transition-colors border border-[#1E293B]"
            >
              RE-INDEX
            </button>
            <button
              onClick={() => alert('Dismissing current trace file...')}
              className="px-3.5 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#283548] text-[#94A3B8] hover:text-white font-mono text-xs uppercase transition-colors border border-[#1E293B]"
            >
              DISMISS FILE
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-1.5 mt-4 rounded-full bg-[#1E293B] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#06B6D4] w-full shadow-[0_0_12px_rgba(139,92,246,0.6)]"></div>
        </div>
      </div>

      {/* Key Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="relative rounded-2xl p-5 bg-[#0F172A] shadow-lg flex flex-col justify-between border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              TOTAL PARSED FRAMES
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#06B6D4]">data_array</span>
          </div>
          <div className="my-2.5">
            <div className="font-sans text-3xl font-bold text-white tracking-tight">1.48M</div>
            <span className="font-mono text-xs text-[#06B6D4] flex items-center gap-1 mt-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">arrow_circle_up</span> 100% Capture Integrity
            </span>
          </div>
          <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#06B6D4] h-full w-full rounded-full"></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="relative rounded-2xl p-5 bg-[#0F172A] shadow-lg flex flex-col justify-between border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              ENCRYPTED PAYLOAD %
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#A78BFA]">enhanced_encryption</span>
          </div>
          <div className="my-2.5">
            <div className="font-sans text-3xl font-bold text-[#A78BFA] tracking-tight">78.4%</div>
            <span className="font-mono text-xs text-[#94A3B8] flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px] text-[#A78BFA]">lock</span> 1.16M TLS 1.3 / HTTPS
            </span>
          </div>
          <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#8B5CF6] h-full w-[78.4%] rounded-full"></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="relative rounded-2xl p-5 bg-[#0F172A] shadow-lg flex flex-col justify-between border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              AVERAGE FRAME SIZE
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#F59E0B]">straighten</span>
          </div>
          <div className="my-2.5">
            <div className="font-sans text-3xl font-bold text-white tracking-tight">
              1,248 <span className="text-base text-[#94A3B8] font-normal">B</span>
            </div>
            <span className="font-mono text-xs text-[#F59E0B] flex items-center gap-1 mt-1">
              MTU Ceiling: 1514 Bytes (Std Ethernet)
            </span>
          </div>
          <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#F59E0B] h-full w-[82%] rounded-full"></div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="relative rounded-2xl p-5 bg-[#0F172A] shadow-lg flex flex-col justify-between border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              CAPTURE TIME SPAN
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#F43F5E]">history_toggle_off</span>
          </div>
          <div className="my-2.5">
            <div className="font-sans text-3xl font-bold text-[#F43F5E] tracking-tight font-mono">
              00:42:15
            </div>
            <span className="font-mono text-xs text-[#94A3B8] flex items-center gap-1 mt-1">
              08:14:02.102 → 08:56:17.391 UTC
            </span>
          </div>
          <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#F43F5E] h-full w-full rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Multi-Tab Navigation Ribbon */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-[#0F172A] overflow-x-auto shadow-md border border-[#1E293B]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs uppercase font-semibold transition-all ${
              activeTab === 'summary'
                ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30'
                : 'hover:bg-[#1E293B] text-[#94A3B8] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">overview</span>
            <span>Summary Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('protocols')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs uppercase font-semibold transition-all ${
              activeTab === 'protocols'
                ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30'
                : 'hover:bg-[#1E293B] text-[#94A3B8] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">pie_chart</span>
            <span>Protocol Distribution</span>
          </button>

          <button
            onClick={() => setActiveTab('flows')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs uppercase font-semibold transition-all ${
              activeTab === 'flows'
                ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30'
                : 'hover:bg-[#1E293B] text-[#94A3B8] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">forum</span>
            <span>Conversations (3,412)</span>
          </button>

          <button
            onClick={() => setActiveTab('anomalies')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs uppercase font-semibold transition-all ${
              activeTab === 'anomalies'
                ? 'bg-[#F43F5E] text-white shadow-md shadow-[#F43F5E]/30'
                : 'hover:bg-[#1E293B] text-[#F43F5E] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>Security Anomalies (17)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <span className="font-mono text-xs text-[#94A3B8] hidden md:inline font-semibold">
            FILTER: ALL LAYERS
          </span>
          <button
            onClick={() => alert('Downloading PCAP summary report...')}
            className="w-8 h-8 rounded-xl bg-[#1E293B] hover:bg-[#283548] flex items-center justify-center text-white transition-colors border border-[#1E293B]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>
        </div>
      </div>

      {/* Core Analytics Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Protocol Breakdown (Hierarchical Tree) */}
        <div className="lg:col-span-6 rounded-2xl bg-[#0F172A] p-6 shadow-xl flex flex-col gap-4 border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[22px] text-[#8B5CF6]">account_tree</span>
              <div>
                <h3 className="font-sans text-base font-semibold text-white">Hierarchical Protocol Breakdown</h3>
                <p className="font-sans text-xs text-[#94A3B8]">L2 to L7 Encapsulation traversal</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#1E293B] text-[#A78BFA] font-mono text-[10px] uppercase font-bold border border-[#1E293B]">
              TREE VIEW
            </span>
          </div>

          <div className="flex flex-col gap-3 font-mono text-xs pt-1">
            {/* L2: Ethernet II */}
            <div className="p-3.5 rounded-xl bg-[#080D1A] flex flex-col gap-2 border border-[#1E293B]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <span className="material-symbols-outlined text-[16px] text-[#94A3B8]">lan</span>
                  <span>Ethernet II</span>
                  <span className="text-[#94A3B8] text-[11px]">(IEEE 802.3)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#94A3B8]">1,482,904 pkts</span>
                  <span className="font-bold text-[#8B5CF6]">100.0%</span>
                </div>
              </div>
              <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#8B5CF6] h-full w-full rounded-full"></div>
              </div>
            </div>

            {/* L3: IPv4 Branch */}
            <div className="ml-4 p-3.5 rounded-xl bg-[#080D1A] flex flex-col gap-2 border border-[#1E293B]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <span className="material-symbols-outlined text-[16px] text-[#A78BFA]">subdirectory_arrow_right</span>
                  <span>IPv4 (Internet Protocol v4)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#94A3B8]">1,396,895 pkts</span>
                  <span className="font-bold text-[#A78BFA]">94.2%</span>
                </div>
              </div>
              <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#4C1D95] h-full w-[94.2%] rounded-full"></div>
              </div>
            </div>

            {/* L4: TCP Branch */}
            <div className="ml-8 p-3.5 rounded-xl bg-[#080D1A] flex flex-col gap-2 border border-[#1E293B]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <span className="material-symbols-outlined text-[16px] text-[#06B6D4]">alt_route</span>
                  <span>Transmission Control Protocol (TCP)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#94A3B8]">1,217,464 pkts</span>
                  <span className="font-bold text-[#06B6D4]">82.1%</span>
                </div>
              </div>
              <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#06B6D4] h-full w-[82.1%] rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)]"></div>
              </div>
            </div>

            {/* L7: TLS Branch */}
            <div className="ml-12 p-3.5 rounded-xl bg-[#0F172A] flex flex-col gap-2 border border-[#1E293B]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-[#A78BFA]">
                  <span className="material-symbols-outlined text-[16px] text-[#A78BFA]">lock</span>
                  <span>TLS 1.2 / TLS 1.3 Records</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#94A3B8]">952,024 pkts</span>
                  <span className="font-bold text-[#A78BFA]">64.2%</span>
                </div>
              </div>
              <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#8B5CF6] h-full w-[64.2%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Identified Security Artifacts */}
        <div className="lg:col-span-6 rounded-2xl bg-[#0F172A] p-6 shadow-xl flex flex-col gap-4 border border-[#1E293B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[22px] text-[#F43F5E]">security_update_warning</span>
              <div>
                <h3 className="font-sans text-base font-semibold text-white">Identified Security Artifacts</h3>
                <p className="font-sans text-xs text-[#94A3B8]">Signatures & heuristic anomaly detections</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-lg bg-[#F43F5E]/20 text-[#F43F5E] font-mono text-[10px] font-bold border border-[#F43F5E]/40">
              3 CRITICAL PATTERNS
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Anomaly 1 */}
            <div className="p-4 rounded-xl bg-[#080D1A] flex flex-col gap-2 border border-[#F43F5E]/50">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] animate-pulse"></span>
                  <span className="font-sans text-sm font-bold text-[#F43F5E]">
                    Unencrypted Basic Auth Detected
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#F43F5E]/20 text-[#F43F5E] text-[10px] uppercase font-bold border border-[#F43F5E]/30">
                  HIGH SEVERITY
                </span>
              </div>
              <p className="font-sans text-xs text-[#94A3B8]">
                Cleartext credentials discovered over plain HTTP POST to endpoint <code className="text-[#8B5CF6] px-1 py-0.5 bg-[#1E293B] rounded">/internal-api/auth/v1</code>. Base64 payload reveals operator administrative session hash.
              </p>
              <div className="flex items-center justify-between pt-1 text-[#94A3B8] text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">stream</span> Frame #419,002 • TCP Stream #104
                </span>
                <Link to="/packets" className="text-[#A78BFA] hover:text-[#8B5CF6] uppercase font-bold text-[10px] transition">
                  Extract Credential →
                </Link>
              </div>
            </div>

            {/* Anomaly 2 */}
            <div className="p-4 rounded-xl bg-[#080D1A] flex flex-col gap-2 border border-[#F59E0B]/50">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                  <span className="font-sans text-sm font-bold text-[#F59E0B]">
                    14 DNS Tunneling Queries to Dynamic TLDs
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] uppercase font-bold border border-[#F59E0B]/30">
                  SUSPICIOUS C2
                </span>
              </div>
              <p className="font-sans text-xs text-[#94A3B8]">
                High entropy Shannon score (4.92) detected in subdomain prefixes destined for <code className="text-[#A78BFA] px-1 py-0.5 bg-[#1E293B] rounded">*.ns.sync-telemetry-cache.xyz</code>. Exfiltration signature matched.
              </p>
              <div className="flex items-center justify-between pt-1 text-[#94A3B8] text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span> 14 events across 00:08:12
                </span>
                <Link to="/anomalies" className="text-[#F59E0B] hover:underline uppercase font-bold text-[10px] transition">
                  Isolate Source IP →
                </Link>
              </div>
            </div>

            {/* Anomaly 3 */}
            <div className="p-4 rounded-xl bg-[#080D1A] flex flex-col gap-2 border border-[#8B5CF6]/40">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A78BFA]"></span>
                  <span className="font-sans text-sm font-bold text-[#A78BFA]">
                    3 SSL Certificate Expiry / Self-Signed Warnings
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#4C1D95]/40 text-[#A78BFA] text-[10px] uppercase font-bold border border-[#8B5CF6]/30">
                  CRYPTOGRAPHIC RISK
                </span>
              </div>
              <p className="font-sans text-xs text-[#94A3B8]">
                Server Hello messages presented X.509 cert with expired validity timestamp (<code className="text-[#94A3B8]">CN=internal-proxy.edge</code>) or untrusted authority chain during handshake negotiation.
              </p>
              <div className="flex items-center justify-between pt-1 text-[#94A3B8] text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">lock_reset</span> Handshake #892, #910, #1,104
                </span>
                <Link to="/packets" className="text-[#A78BFA] hover:text-[#8B5CF6] uppercase font-bold text-[10px] transition">
                  View Cert Chain →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Extracted Flows Table */}
      <div className="rounded-2xl bg-[#0F172A] p-6 shadow-2xl flex flex-col gap-4 border border-[#1E293B]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#8B5CF6]">dataset</span>
              <h3 className="font-sans text-base font-semibold text-white">Top Extracted Flows in File</h3>
            </div>
            <p className="font-sans text-xs text-[#94A3B8]">
              Aggregated conversation channels ordered by cumulative payload size
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={flowFilter}
                onChange={(e) => setFlowFilter(e.target.value)}
                placeholder="Filter extracted flows..."
                className="h-9 pl-9 pr-3 rounded-xl bg-[#080D1A] text-white font-mono text-xs placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] border border-[#1E293B] transition-all"
              />
              <span className="material-symbols-outlined text-[16px] text-[#94A3B8] absolute left-2.5 top-2.5 pointer-events-none">
                search
              </span>
            </div>

            <button
              onClick={() => alert('Exporting flows to CSV...')}
              className="px-4 py-2 rounded-xl bg-[#8B5CF6] text-white font-mono text-xs uppercase font-bold hover:bg-[#7C3AED] shadow-md shadow-[#8B5CF6]/30 transition-all"
            >
              EXPORT CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl bg-[#080D1A] border border-[#1E293B]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#1E293B] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#1E293B]">
                <th className="py-2.5 px-3">Flow ID</th>
                <th className="py-2.5 px-3">Source (Socket)</th>
                <th className="py-2.5 px-3">Destination (Socket)</th>
                <th className="py-2.5 px-3">Protocol</th>
                <th className="py-2.5 px-3 text-right">Packets</th>
                <th className="py-2.5 px-3 text-right">Bytes</th>
                <th className="py-2.5 px-3 text-right">Duration</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60">
              {filteredFlows.map((flow) => (
                <tr
                  key={flow.id}
                  className={`transition-colors ${
                    flow.isBad ? 'bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20' : 'hover:bg-[#1E293B]/50'
                  }`}
                >
                  <td className={`py-2.5 px-3 font-semibold ${flow.isBad ? 'text-[#F43F5E]' : 'text-[#A78BFA]'}`}>
                    {flow.id}
                  </td>
                  <td className="py-2.5 px-3 text-white">{flow.src}</td>
                  <td className="py-2.5 px-3 text-white">{flow.dst}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                      flow.isBad
                        ? 'bg-[#F43F5E]/20 text-[#F43F5E] border-[#F43F5E]/40'
                        : 'bg-[#4C1D95]/40 text-[#A78BFA] border-[#8B5CF6]/30'
                    }`}>
                      {flow.proto}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-white font-semibold">{flow.pkts}</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${flow.isBad ? 'text-[#F43F5E]' : 'text-[#06B6D4]'}`}>
                    {flow.bytes}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#94A3B8]">{flow.dur}</td>
                  <td className="py-2.5 px-3 text-center">
                    <Link
                      to="/packets"
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] uppercase font-bold transition-all border ${
                        flow.isBad
                          ? 'bg-[#F43F5E]/20 text-[#F43F5E] hover:bg-[#F43F5E] hover:text-white border-[#F43F5E]/40'
                          : 'bg-[#1E293B] text-[#A78BFA] hover:bg-[#8B5CF6] hover:text-white border-[#1E293B]'
                      }`}
                    >
                      <span>INSPECT</span>
                      <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </Link>
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

export default PcapUpload;
