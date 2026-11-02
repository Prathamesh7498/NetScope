# NetScope — User & Student Guide

## 1. Introduction
Welcome to **NetScope**, the network operations and packet analysis platform. NetScope allows you to inspect packet headers, examine flow conversations, and analyze traffic anomalies.

---

## 2. Walkthrough of Features

### 2.1 Demo Mode Banner
A banner at the top of the screen clarifies that the application is running in **Simulated Demonstration Mode (Phase 1)**.

### 2.2 Operations Dashboard (`/`)
- **Telemetry Cards:** Instantaneous packet processing rate, active bidirectional flows, current throughput (Mbps), and anomaly count.
- **Protocol Distribution:** Live-rendered bar charts summarizing traffic percentages across TCP, UDP, ICMP, DNS, and TLS.

### 2.3 Packet Explorer (`/packets`)
- Filter packets by protocol button (All, TCP, UDP, DNS, ICMP, ARP).
- Search packets by Source IP, Destination IP, or port numbers.
- **Inspect Drawer:** Click on any packet to open the Layer 2/3/4 header breakdown and the synchronized Hexadecimal + ASCII payload dump.

### 2.4 Flow Details (`/flows`)
- View bidirectional conversation sessions aggregated by the 5-tuple.
- Inspect duration, packet counts, and total byte volume.

### 2.5 PCAP File Upload (`/upload`)
- Drag and drop `.pcap` or `.pcapng` files to simulate offline analysis.
- Visual progress bar demonstrates ingestion and packet decoding.

### 2.6 Live Capture Prototype (`/live-capture` modal)
- Select network interfaces (e.g., `eth0`, `wlan0`, `lo`).
- Configure Berkeley Packet Filters (BPF) such as `tcp port 80 or udp port 53`.
- Explicitly marked as a prototype interface.

### 2.7 Anomaly Alerts (`/anomalies`)
- Review alerts flagged for unusual activity, such as SYN flood scans or unexpected outbound connection attempts.
