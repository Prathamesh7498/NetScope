import React, { useState, useEffect, useRef } from 'react';
import {
  fetchLivePackets,
  fetchDissection,
  fetchInterfaces,
  getCaptureStreamUrl,
  StreamPacket,
  PacketDissection,
  NetworkInterface
} from '../api';

const DEFAULT_HEX_DUMP = [
  { offset: '0000', hex: '00 0c 29 4f 8e 12 e4 0d 36 24 d0 a6 08 00 45 00', ascii: '..).O...6$....E.', byte_indices: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] },
  { offset: '0010', hex: '00 48 1a 2b 40 00 40 06 a4 12 c0 a8 2b c1 8e fa', ascii: '.H.+@.@.....+...', byte_indices: [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31] },
  { offset: '0020', hex: 'be 2e d4 31 01 bb 00 12 34 56 00 00 00 00 80 02', ascii: '...1....4V......', byte_indices: [32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47] },
  { offset: '0030', hex: 'fa f0 12 34 00 00 17 03 03 00 40 aa bb cc dd ee', ascii: '...4......@.....', byte_indices: [48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63] }
];

export const PacketExplorer: React.FC = () => {
  const [packets, setPackets] = useState<StreamPacket[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<StreamPacket | null>(null);
  const [dissection, setDissection] = useState<PacketDissection | null>(null);
  const [loadingDissection, setLoadingDissection] = useState<boolean>(false);
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [activeIface, setActiveIface] = useState<string>('Wi-Fi');
  const [protocolFilter, setProtocolFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [streamFilter, setStreamFilter] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(false);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [privilegeNotice, setPrivilegeNotice] = useState<string>('');
  const [copiedHex, setCopiedHex] = useState<boolean>(false);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // 1. Load available physical/virtual host network interfaces
  useEffect(() => {
    fetchInterfaces().then((data) => {
      if (data.interfaces && data.interfaces.length > 0) {
        setInterfaces(data.interfaces);
        setActiveIface(data.activeInterface || data.interfaces[0].id);
      }
      setPrivilegeNotice(data.privilegeNotice || '');
    });
  }, []);

  // 2. Connect to live real SSE stream
  useEffect(() => {
    if (!isStreaming) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const streamUrl = getCaptureStreamUrl(activeIface);
    const es = new EventSource(streamUrl, { withCredentials: true });
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const pkt: StreamPacket = JSON.parse(event.data);
        setPackets((prev) => {
          // Prepend latest packet, keeping max 300 in buffer
          const updated = [pkt, ...prev.slice(0, 299)];
          return updated;
        });
      } catch (err) {
        console.error('Error parsing SSE packet:', err);
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [activeIface, isStreaming]);

  // 3. Initial load from REST API
  useEffect(() => {
    fetchLivePackets().then((data) => {
      if (data && data.length > 0) {
        setPackets(data);
        if (!selectedPacket) {
          setSelectedPacket(data[0]);
        }
      }
    });
  }, []);

  // 4. Set first packet as default selection once packets arrive if none selected
  useEffect(() => {
    if (!selectedPacket && packets.length > 0) {
      setSelectedPacket(packets[0]);
    }
  }, [packets, selectedPacket]);

  // 5. Fetch deep dissection when selected packet changes
  useEffect(() => {
    if (selectedPacket) {
      const pid = selectedPacket.id ?? selectedPacket.seq;
      setLoadingDissection(true);
      fetchDissection(pid)
        .then((d) => {
          if (d) {
            setDissection(d);
            setSelectedLayerIndex(0);
          }
        })
        .finally(() => {
          setLoadingDissection(false);
        });
    }
  }, [selectedPacket]);

  // 6. Smooth table-only auto scroll (without jumping the page window)
  useEffect(() => {
    if (autoScroll && tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [packets, autoScroll]);

  // Reset buffers
  const handleClearBuffer = () => {
    setPackets([]);
    setSelectedPacket(null);
    setDissection(null);
    setStreamFilter(null);
  };

  // Follow TCP stream helper
  const handleFollowStream = (pkt: StreamPacket) => {
    const sIp = pkt.srcIp || (pkt.src ? pkt.src.split(':')[0] : '');
    const dIp = pkt.dstIp || (pkt.dst ? pkt.dst.split(':')[0] : '');
    const sPort = pkt.srcPort || '';
    const dPort = pkt.dstPort || '';
    if (sIp && dIp) {
      setStreamFilter(`${sIp}:${sPort} ⇄ ${dIp}:${dPort}`);
    }
  };

  // Copy hex to clipboard
  const handleCopyHex = () => {
    if (!dissection?.hex_dump) return;
    const hexText = dissection.hex_dump.map((l) => `${l.offset}  ${l.hex}  |${l.ascii}|`).join('\n');
    navigator.clipboard.writeText(hexText);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 2000);
  };

  // Protocol matching helper
  const matchProtocol = (proto: string, filter: string) => {
    if (filter === 'ALL') return true;
    const p = (proto || '').toUpperCase();
    const f = filter.toUpperCase();
    if (f === 'TLSV1.3' || f === 'TLS') return p.includes('TLS') || p.includes('HTTPS');
    if (f === 'HTTP') return p.includes('HTTP');
    return p.includes(f);
  };

  // Filtered packets calculation
  const filteredPackets = packets.filter((p) => {
    if (!matchProtocol(p.proto, protocolFilter)) {
      return false;
    }

    if (streamFilter) {
      const parts = streamFilter.split(' ⇄ ');
      if (parts.length === 2) {
        const [epA, epB] = parts;
        const pA = p.src;
        const pB = p.dst;
        const matchForward = pA.includes(epA.split(':')[0]) && pB.includes(epB.split(':')[0]);
        const matchReverse = pA.includes(epB.split(':')[0]) && pB.includes(epA.split(':')[0]);
        if (!matchForward && !matchReverse) return false;
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSrc = (p.src || '').toLowerCase().includes(q);
      const matchDst = (p.dst || '').toLowerCase().includes(q);
      const matchInfo = (p.info || '').toLowerCase().includes(q);
      const matchProto = (p.proto || '').toLowerCase().includes(q);
      const matchFlags = (p.flags || '').toLowerCase().includes(q);
      return matchSrc || matchDst || matchInfo || matchProto || matchFlags;
    }

    return true;
  });

  // Protocol counts
  const protoCounts: Record<string, number> = {
    ALL: packets.length,
    TCP: packets.filter((p) => matchProtocol(p.proto, 'TCP')).length,
    UDP: packets.filter((p) => matchProtocol(p.proto, 'UDP')).length,
    DNS: packets.filter((p) => matchProtocol(p.proto, 'DNS')).length,
    'TLSV1.3': packets.filter((p) => matchProtocol(p.proto, 'TLSV1.3')).length,
    HTTP: packets.filter((p) => matchProtocol(p.proto, 'HTTP')).length,
    ICMP: packets.filter((p) => matchProtocol(p.proto, 'ICMP')).length
  };

  // Selected layer byte range for hex matrix highlighting
  const currentLayer = dissection?.layers?.[selectedLayerIndex];
  const activeByteRange = currentLayer?.byte_range || [-1, -1];

  return (
    <div className="flex flex-col w-full pb-16 space-y-4 font-mono select-none">
      {/* Top Operations Toolbar */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Left: Interface & Stream status */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#080D1A] px-3 py-1.5 rounded-xl border border-[#1E293B]">
            <span className="material-symbols-outlined text-[#06B6D4] text-[18px]">settings_ethernet</span>
            <select
              value={activeIface}
              onChange={(e) => setActiveIface(e.target.value)}
              className="bg-transparent text-xs text-white font-mono focus:outline-none cursor-pointer"
            >
              {interfaces.map((iface) => (
                <option key={iface.id} value={iface.id} className="bg-[#0F172A] text-white">
                  {iface.name} ({iface.ip})
                </option>
              ))}
            </select>
          </div>

          {/* Stream status indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs">
            <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-[#00F2FE] animate-pulse' : 'bg-[#F59E0B]'}`}></span>
            <span className={isStreaming ? 'text-[#00F2FE] font-bold text-[11px]' : 'text-[#F59E0B] font-bold text-[11px]'}>
              {isStreaming ? 'LIVE CAPTURE' : 'STREAM PAUSED'}
            </span>
          </div>

          {/* Auto-Scroll Toggle Button */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              autoScroll
                ? 'bg-[#06B6D4]/15 text-[#00F2FE] border-[#06B6D4]/40 shadow-sm'
                : 'bg-[#080D1A] text-[#94A3B8] border-[#1E293B] hover:text-white'
            }`}
            title="Automatically scrolls the table to show newest packets at the top"
          >
            <span className="material-symbols-outlined text-[15px]">vertical_align_top</span>
            <span>{autoScroll ? 'Auto-Scroll: ON' : 'Auto-Scroll: PAUSED'}</span>
          </button>

          <span className="text-xs text-[#94A3B8]">
            Buffer: <strong className="text-white font-semibold">{packets.length}</strong> frames
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {streamFilter && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#A78BFA] text-xs rounded-xl">
              <span>Stream: {streamFilter}</span>
              <button
                onClick={() => setStreamFilter(null)}
                className="hover:text-white font-bold ml-1"
                title="Clear Stream Filter"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isStreaming
                ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40 hover:bg-[#F59E0B]/25'
                : 'bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-[#080D1A] font-bold shadow-md shadow-[#06B6D4]/20'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{isStreaming ? 'pause' : 'play_arrow'}</span>
            <span>{isStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          <button
            onClick={handleClearBuffer}
            className="px-3.5 py-1.5 rounded-xl text-xs text-[#94A3B8] hover:text-white bg-[#1E293B] border border-[#1E293B] hover:bg-[#283548] transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
            <span>Clear Buffer</span>
          </button>
        </div>
      </div>

      {privilegeNotice && (
        <div className="px-4 py-2 bg-[#0F172A] border border-[#1E293B] rounded-xl text-[11px] text-[#00F2FE] flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[#06B6D4] text-[16px]">info</span>
          <span>{privilegeNotice}</span>
        </div>
      )}

      {/* Protocol Filter Tabs & Fast Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0F172A] border border-[#1E293B] p-3 rounded-2xl shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {['ALL', 'TCP', 'UDP', 'DNS', 'TLSV1.3', 'HTTP', 'ICMP'].map((proto) => {
            const isActive = protocolFilter === proto;
            const count = protoCounts[proto] || 0;
            return (
              <button
                key={proto}
                onClick={() => setProtocolFilter(proto)}
                className={`px-3 py-1.5 text-xs rounded-xl transition-all font-semibold flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-[#080D1A] font-bold shadow-md shadow-[#06B6D4]/25'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                <span>{proto}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-[#080D1A]/30 text-[#080D1A]' : 'bg-[#1E293B] text-[#94A3B8]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[280px]">
          <span className="material-symbols-outlined absolute left-3 top-2 text-[#94A3B8] text-[16px]">search</span>
          <input
            type="text"
            placeholder="Filter by IP, port, protocol, info..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080D1A] border border-[#1E293B] rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder:text-[#94A3B8]/60 focus:outline-none focus:border-[#06B6D4] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1.5 text-xs text-[#94A3B8] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* TWO-PANEL WORKSPACE: TOP PACKET STREAM TABLE / BOTTOM DISSECTION & HEX MATRIX */}
      <div className="grid grid-rows-[340px_auto] gap-4">
        {/* TOP: VIRTUALIZED / BOUNDED PACKET LIST */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col shadow-xl">
          {/* Header Row */}
          <div className="grid grid-cols-12 bg-[#1E293B] border-b border-[#1E293B] px-4 py-2.5 text-[11px] font-bold text-[#94A3B8] select-none">
            <div className="col-span-1">No.</div>
            <div className="col-span-1">Time</div>
            <div className="col-span-2">Source Address : Port</div>
            <div className="col-span-2">Destination Address : Port</div>
            <div className="col-span-1">Proto</div>
            <div className="col-span-1 text-right">Length</div>
            <div className="col-span-3 pl-3">Dissection & Payload Summary</div>
            <div className="col-span-1 text-right">Flags</div>
          </div>

          {/* Packet Rows */}
          <div
            ref={tableContainerRef}
            className="flex-1 overflow-y-auto divide-y divide-[#1E293B]/60 text-xs bg-[#080D1A] select-none"
          >
            {filteredPackets.length === 0 ? (
              <div className="p-12 text-center text-[#94A3B8] flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[32px] text-[#06B6D4] animate-spin">sync</span>
                <span>Awaiting live telemetry packets on {activeIface}...</span>
              </div>
            ) : (
              filteredPackets.map((pkt) => {
                const pktKey = pkt.id ?? pkt.seq;
                const isSelected = (selectedPacket?.id && selectedPacket.id === pkt.id) || (selectedPacket?.seq && selectedPacket.seq === pkt.seq);

                return (
                  <div
                    key={pktKey}
                    onClick={() => {
                      setSelectedPacket(pkt);
                      setAutoScroll(false); // Pause auto-scroll on click so row stays visible
                    }}
                    className={`grid grid-cols-12 px-4 py-2 cursor-pointer transition-colors items-center font-mono text-[11px] ${
                      isSelected
                        ? 'bg-[#06B6D4]/15 border-l-4 border-[#06B6D4] text-white font-semibold shadow-inner'
                        : pkt.anomaly
                        ? 'bg-[#F43F5E]/15 text-[#F43F5E] hover:bg-[#F43F5E]/25'
                        : 'text-slate-200 hover:bg-[#1E293B]/60'
                    }`}
                  >
                    <div className="col-span-1 text-[#00F2FE] font-bold">{pkt.seq || pkt.id}</div>
                    <div className="col-span-1 text-[#94A3B8] text-[10px] truncate">{pkt.timestamp || '00:00:00'}</div>
                    <div className="col-span-2 truncate text-white" title={pkt.src}>
                      {pkt.src}
                    </div>
                    <div className="col-span-2 truncate text-white" title={pkt.dst}>
                      {pkt.dst}
                    </div>
                    <div className="col-span-1">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                          pkt.proto.includes('TLS') || pkt.proto.includes('HTTPS')
                            ? 'text-[#00F2FE] bg-[#06B6D4]/15 border-[#06B6D4]/40'
                            : pkt.proto.includes('DNS')
                            ? 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30'
                            : pkt.proto.includes('TCP')
                            ? 'text-[#A78BFA] bg-[#8B5CF6]/15 border-[#8B5CF6]/30'
                            : pkt.proto.includes('HTTP')
                            ? 'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30'
                            : 'text-[#F43F5E] bg-[#F43F5E]/15 border-[#F43F5E]/30'
                        }`}
                      >
                        {pkt.proto}
                      </span>
                    </div>
                    <div className="col-span-1 text-right text-[#94A3B8] pr-2">{pkt.len} B</div>
                    <div className="col-span-3 pl-3 truncate text-[#94A3B8] font-mono text-[10px]" title={pkt.info}>
                      {pkt.info || `${pkt.src} → ${pkt.dst}`}
                    </div>
                    <div className="col-span-1 text-right">
                      {pkt.anomaly ? (
                        <span className="text-[10px] bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/40 px-1.5 py-0.5 rounded font-bold">
                          ALERT
                        </span>
                      ) : (
                        <span className="text-[#94A3B8] text-[10px] bg-[#1E293B] px-1.5 py-0.5 rounded border border-[#1E293B]">
                          {pkt.flags || 'ACK'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* BOTTOM: DEEP PACKET DISSECTION & INTERACTIVE HEX MATRIX */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 shadow-2xl">
          {/* LEFT: PROTOCOL LAYER TREE */}
          <div className="lg:col-span-5 flex flex-col bg-[#080D1A] border border-[#1E293B] rounded-xl p-4 overflow-y-auto max-h-[390px]">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#1E293B]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#06B6D4]">account_tree</span>
                <span>Dissected Protocol Hierarchy</span>
              </span>
              {selectedPacket && (
                <span className="text-[11px] text-[#00F2FE] font-bold">
                  Frame #{selectedPacket.seq || selectedPacket.id} ({selectedPacket.len} B)
                </span>
              )}
            </div>

            {loadingDissection ? (
              <div className="p-8 text-center text-xs text-[#06B6D4] flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                <span>Dissecting packet payload...</span>
              </div>
            ) : dissection?.layers ? (
              <div className="space-y-2.5">
                {dissection.layers.map((layer, idx) => {
                  const isLayerActive = selectedLayerIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedLayerIndex(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                        isLayerActive
                          ? 'border-[#06B6D4] bg-[#06B6D4]/15 shadow-sm shadow-[#06B6D4]/10'
                          : 'border-[#1E293B] bg-[#0F172A] hover:border-[#06B6D4]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-bold flex items-center gap-1.5 ${isLayerActive ? 'text-[#00F2FE]' : 'text-white'}`}>
                          <span className="material-symbols-outlined text-[15px]">
                            {isLayerActive ? 'check_circle' : 'chevron_right'}
                          </span>
                          <span>{layer.name}</span>
                        </span>
                        <span className="text-[10px] text-[#A78BFA] font-mono bg-[#1E293B] px-1.5 py-0.5 rounded">
                          Bytes [{layer.byte_range[0]}:{layer.byte_range[1]}]
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-[#94A3B8] font-mono pl-5">
                        {Object.entries(layer.details).map(([k, v]) => (
                          <div key={k} className="flex justify-between items-center gap-2">
                            <span className="text-[#94A3B8]">{k}:</span>
                            <span className="text-white font-medium truncate max-w-[200px]" title={String(v)}>
                              {String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#94A3B8]">
                Select a frame from the telemetry table to inspect dissection layers.
              </div>
            )}
          </div>

          {/* RIGHT: HEX DUMP & ASCII MATRIX WITH INTERACTIVE LAYER HIGHLIGHTING */}
          <div className="lg:col-span-7 flex flex-col bg-[#080D1A] border border-[#1E293B] rounded-xl p-4 overflow-y-auto max-h-[390px]">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#06B6D4]">data_object</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Raw Hex & ASCII Decoder
                </span>
                {currentLayer && (
                  <span className="text-[10px] text-[#00F2FE] bg-[#06B6D4]/15 border border-[#06B6D4]/30 px-2 py-0.5 rounded-full font-bold">
                    {currentLayer.name.split('(')[0]} [{activeByteRange[0]}:{activeByteRange[1]}]
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedPacket && (
                  <button
                    onClick={() => handleFollowStream(selectedPacket)}
                    className="px-2.5 py-1 rounded-lg bg-[#1E293B] text-[#A78BFA] hover:text-white hover:bg-[#8B5CF6]/30 font-mono text-[10px] uppercase font-bold transition flex items-center gap-1 border border-[#1E293B]"
                    title="Filter table to this TCP socket conversation"
                  >
                    <span className="material-symbols-outlined text-[13px]">call_split</span>
                    <span>Follow Stream</span>
                  </button>
                )}

                <button
                  onClick={handleCopyHex}
                  className="px-2.5 py-1 rounded-lg bg-[#1E293B] text-[#06B6D4] hover:text-[#00F2FE] hover:bg-[#06B6D4]/20 font-mono text-[10px] uppercase font-bold transition flex items-center gap-1 border border-[#1E293B]"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {copiedHex ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedHex ? 'Copied!' : 'Copy Hex'}</span>
                </button>
              </div>
            </div>

            {/* Hex matrix rows with byte index mapping */}
            <div className="font-mono text-xs text-slate-200 space-y-1 bg-[#060913] p-3.5 rounded-xl border border-[#1E293B] overflow-x-auto leading-relaxed select-text">
              {(dissection?.hex_dump || DEFAULT_HEX_DUMP).map((row, rowIdx) => {
                const hexBytes = row.hex.split(' ');
                const asciiChars = row.ascii.split('');

                return (
                  <div key={rowIdx} className="flex gap-4 items-center hover:bg-[#1E293B]/40 px-1 py-0.5 rounded transition-colors">
                    {/* Offset column */}
                    <span className="text-[#94A3B8] select-none font-bold w-12 shrink-0">{row.offset}:</span>

                    {/* 16 Hex Bytes with active byte range highlight */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {hexBytes.map((b, byteOffset) => {
                        const globalIndex = rowIdx * 16 + byteOffset;
                        const isHighlighted = globalIndex >= activeByteRange[0] && globalIndex < activeByteRange[1];

                        return (
                          <span
                            key={byteOffset}
                            className={`px-0.5 rounded text-[11px] transition-colors ${
                              isHighlighted
                                ? 'bg-[#06B6D4]/30 text-[#00F2FE] font-bold shadow-sm'
                                : 'text-slate-300'
                            }`}
                          >
                            {b}
                          </span>
                        );
                      })}
                    </div>

                    {/* ASCII Representation with matching highlight */}
                    <div className="border-l border-[#1E293B] pl-3 flex items-center tracking-widest shrink-0 text-[#06B6D4]">
                      {asciiChars.map((ch, chIdx) => {
                        const globalIndex = rowIdx * 16 + chIdx;
                        const isHighlighted = globalIndex >= activeByteRange[0] && globalIndex < activeByteRange[1];

                        return (
                          <span
                            key={chIdx}
                            className={`${isHighlighted ? 'text-[#00F2FE] font-bold underline' : 'text-[#06B6D4]/80'}`}
                          >
                            {ch}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[#94A3B8] text-[10px] mt-2 pt-2 border-t border-[#1E293B]/60">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]"></span>
                <span>Active Layer: <strong className="text-white">{currentLayer?.name || 'All Bytes'}</strong></span>
              </span>
              <span>16-Byte Wireshark Canonical Format</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PacketExplorer;
