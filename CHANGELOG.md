# NetScope — Changelog

All notable changes to the NetScope project will be documented in this file.

## [0.2.0] - 2026-10-26 (Phase 1 Frontend Delivery)
### Added
- Complete React 18 + Vite + TypeScript frontend running on port 3003.
- Dark Navy NOC / SOC cybersecurity aesthetic with readable high-contrast typography.
- Persistent Demo Mode alert banner indicating simulated telemetry and nonfunctional live-capture placeholders.
- Network Overview dashboard: packet rate gauges (packets/sec), throughput meters (Mbps), active TCP flows, and anomaly counters.
- Interactive Packet Explorer: filter by protocol (TCP, UDP, ICMP, DNS, TLS, ARP), search by IP or port, and an expandable packet detail drawer featuring Layer 2-4 headers and synchronized hex/ASCII dump.
- Protocol Statistics: breakdown of network traffic volume by protocol and top communicating endpoints.
- Flow Details: bidirectional conversation tracker grouping packets into 5-tuple sessions with duration, transmitted packets, and byte totals.
- PCAP Upload Interface: drag-and-drop file upload simulator accepting `.pcap` and `.pcapng` files with size limits and simulated parsing progress.
- Live Capture Prototype Modal: interface selector (eth0, wlan0, lo), BPF filter input, buffer size settings, clearly marked as a UI prototype.
- Anomaly Alerts: investigation log of flagged suspicious traffic (SYN flood scan, DNS amplification, unusual egress ports).
- System Settings & Access Control (403 Unauthorized and 404 Not Found pages).

## [0.1.0] - 2026-10-26 (Phase 0 Planning)
### Added
- Created `PROJECT_PLAN.md`, `PROJECT_STRUCTURE.md`, `ROADMAP.md`, `SECURITY.md`, and technical design reports (`PDR.md`, `TDR.md`).
- Documented OS packet capture matrix (Linux AF_PACKET, Windows Npcap, macOS BPF).
- Defined privacy safeguards and data collection limits.
