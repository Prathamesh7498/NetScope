# NetScope — Project Design Report (PDR)
**Version:** 1.0.0-Draft (Phase 0/1)  
**Author:** Antigravity AI & Piyush  
**Date:** October 2026  

---

## 1. Project Background & Rationale
Network visibility is the cornerstone of defensive infrastructure and site reliability engineering. Analyzing packet traces allows engineers to diagnose packet loss, latency jitter, protocol misconfigurations, and unauthorized reconnaissance.

**NetScope** provides an open-source, educational platform that pairs Scapy-based parsing with an operations-grade Network Operations Center (NOC) dashboard.

## 2. Functional Requirements
1. **PCAP Ingestion:** Support uploading standard `.pcap` and `.pcapng` files up to 50MB with format verification.
2. **Packet Explorer:** Display individual packets with timestamp (UTC/epoch), source IP/port, destination IP/port, protocol, length, and TCP flags.
3. **Hex & ASCII Inspector:** Synchronized byte-level hex view with ASCII translation for inspecting packet headers and payload contents.
4. **Bidirectional Flow Aggregation:** Correlate packets into 5-tuple conversations (`SrcIP:Port <-> DstIP:Port [Proto]`), calculating duration, packet counts, and total byte volume.
5. **Traffic Statistics & Protocol Distribution:** Visual charts displaying percentage of traffic across TCP, UDP, ICMP, DNS, TLS, and HTTP.
6. **Live Capture Prototype:** An opt-in interface selector and BPF filter configuration modal, clearly marked as a nonfunctional UI prototype in Phase 1.
7. **Anomaly Detection Log:** Flag baseline violations (e.g., sudden spikes in TCP SYN packets or connection resets).

## 3. Visual System Design
- **Dark Theme:** Sleek dark navy (`#090d16`, `#0f172a`, `#1e293b`), crisp monospace numeric figures (`#38bdf8`, `#818cf8`), emerald for active connections (`#10b981`), amber for warnings (`#f59e0b`), and rose for anomalies (`#f43f5e`).
- **High-Density Data Tables:** Tabular layouts optimized for rapid scanning of IP addresses and ports without visual clutter.
