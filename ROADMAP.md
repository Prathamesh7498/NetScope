# NetScope — Product & Engineering Roadmap

## Milestone Status Overview

- [x] **Milestone 0: Architecture, Capture Matrix & Safely Defined Scope (Completed)**
  - Establish OS capture matrix, privilege model, and flow definitions.
  - Complete documentation suite (`PROJECT_PLAN.md`, `PROJECT_STRUCTURE.md`, `ROADMAP.md`, `SECURITY.md`, `PDR.md`, `TDR.md`).
- [/] **Milestone 1: Dark Navy NOC Telemetry Dashboard (Current Phase)**
  - [x] Configure Vite + React + TypeScript + Tailwind client on port 3003.
  - [x] Implement persistent demo-mode disclaimer banner.
  - [x] Authentication views (Login, Register).
  - [x] Network Overview with live-updating mock packet rates, bandwidth, and protocol breakdowns.
  - [x] Packet Explorer with protocol filters (TCP, UDP, ICMP, DNS, ARP, TLS), IP/port search, and inspection drawer with raw hex/ASCII payload dumps.
  - [x] Protocol distribution charts (Transport & Application layer).
  - [x] Flow Details table summarizing 5-tuple conversations, duration, and bidirectional bytes.
  - [x] PCAP Import screen with drag-and-drop validation and simulated ingest progress.
  - [x] Live-Capture UI prototype with interface selector and BPF syntax preview (clearly labeled as a prototype).
  - [x] Anomaly alerts and investigation history.
  - [x] System settings, access control (403), and 404 error state.
  - [x] Production build verification (`npm run build`).
- [ ] **Milestone 2: Backend Flask Core** (Pending User Approval)
- [ ] **Milestone 3: Safe PCAP Ingestion Pipeline** (Pending User Approval)
- [ ] **Milestone 4: Scapy Packet Engine** (Pending User Approval)
- [ ] **Milestone 5: Flow Aggregation & Traffic Statistics** (Pending User Approval)
- [ ] **Milestone 6: Opt-In Authorized Live Sniffing** (Pending User Approval)
- [ ] **Milestone 7: Rule-Based Anomaly Detection** (Pending User Approval)
- [ ] **Milestone 8: Database Persistence & Auth** (Pending User Approval)
- [ ] **Milestone 9: System Integration** (Pending User Approval)
- [ ] **Milestone 10: Packet Fuzzing & Security Tests** (Pending User Approval)
- [ ] **Milestone 11: Production Deployment** (Pending User Approval)
- [ ] **Milestone 12: Handover & Student Lab Guides** (Pending User Approval)
