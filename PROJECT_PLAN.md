# NetScope — Master Project Plan (Phase 0 & Beyond)
**Sub-title:** High-Performance Packet Sniffing, PCAP Ingestion & Network Flow Telemetry Platform  
**Status:** Phase 0 (Planning Completed) & Phase 1 (Frontend In Progress)  
**Author / Lead Architect:** Antigravity AI & Piyush  
**Classification:** Educational Network Operations & Cybersecurity Platform  

---

## 1. Executive Summary & Operational Scope
Observability into network packet exchanges is fundamental for security analysts, network engineers, and students studying the OSI reference model. However, real-world packet capture requires strict privilege boundaries, protocol parsing safety, and high-throughput memory buffers.

**NetScope** is engineered to:
1. Safely import standard offline PCAP / PCAPNG packet captures with strict file-size limits.
2. Ingest authorized live interface traffic (via Scapy/libpcap/Npcap on supported platforms) with opt-in safeguards.
3. Parse Layer 2 to Layer 7 headers (Ethernet, IPv4/IPv6, ARP, TCP, UDP, ICMP, DNS, HTTP/TLS).
4. Aggregate raw discrete packets into bidirectional network flows (5-tuple: source IP, destination IP, source port, destination port, protocol).
5. Compute traffic bandwidth volume, protocol distributions, and packet inter-arrival statistics.
6. Flag statistical anomalies (SYN floods, port sweeps, DNS amplification) with clear caveats distinguishing observations from confirmed breaches.

---

## 2. Platform Matrix & OS Capture Permissions

| Platform | Offline PCAP Ingestion | Live Sniffing Driver | Required Permissions |
|---|---|---|---|
| **Linux (Ubuntu/Debian)** | Supported (Full) | `AF_PACKET` / Raw sockets | `CAP_NET_RAW`, `CAP_NET_ADMIN` or `sudo` |
| **Windows 10/11** | Supported (Full) | Npcap OEM driver in WinPcap compatibility mode | Administrator Privilege |
| **macOS (Darwin)** | Supported (Full) | BPF (`/dev/bpf*`) | Root / `chmod` access to BPF devices |

---

## 3. Implementation Phases Matrix

| Phase | Description | Deliverables |
|---|---|---|
| **Phase 0** | Planning, OS Matrix & Threat Boundaries | `PROJECT_PLAN.md`, `PROJECT_STRUCTURE.md`, `ROADMAP.md`, `SECURITY.md`, `PDR.md`, `TDR.md` |
| **Phase 1** | Dark Navy NOC Dashboard (Demo Mode) | 10+ Complete React/Tailwind views, Packet Explorer, Protocol Charts, PCAP Import, Live Capture UI Prototype |
| **Phase 2** | Flask Backend Core & Health Checks | Modular Flask API, SSE/WebSocket streaming foundations, config |
| **Phase 3** | Safe PCAP Ingestion Pipeline | File validation (libpcap magic bytes: `0xa1b2c3d4`), 50MB file size limits, rate limiting |
| **Phase 4** | Scapy Packet Parsing Engine | Ethernet II, IPv4/IPv6, TCP flags (SYN, ACK, FIN, RST), UDP, DNS record extraction |
| **Phase 5** | Flow Aggregator & Traffic Analytics | 5-tuple flow bucketing, conversation duration, bytes exchanged, top talkers |
| **Phase 6** | Opt-In Authorized Live Capture | Background daemon thread, ring buffer, BPF filter validation, graceful SIGINT shutdown |
| **Phase 7** | Rule-Based Anomaly Detection | Baseline deviation heuristics (SYN-to-SYN-ACK imbalance, port scan thresholds) |
| **Phase 8** | Database Persistence & Auth | PostgreSQL schemas (CaptureSession, PacketMeta, FlowSummary), JWT auth |
| **Phase 9** | End-to-End System Integration | Connect UI to Flask API and packet engine |
| **Phase 10** | Fuzzing & Malformed Packet Safety | Truncated packets, corrupted headers, jumbo frames, zero-length payloads |
| **Phase 11** | Deployment & Containerization | Dockerfile with `--cap-add=NET_RAW`, Nginx reverse proxy |
| **Phase 12** | Handover, Mentorship & Student Lab Manuals | Exportable PDF manuals (`PDR.pdf`, `TDR.pdf`), hands-on lab experiments |
