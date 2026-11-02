# NetScope — Mentor Live-Coding & Teaching Guide

## 1. Pedagogical Mission
Guide students through the fundamentals of computer networking: the OSI 7-layer model, encapsulation, TCP 3-way handshakes, UDP statelessness, and how packets form bidirectional flows.

---

## 2. Lecture Plan & Live Walkthrough

### Module 1: The Encapsulation Journey (Layer 2 to Layer 7)
- **Concept:** How an HTTP request is wrapped in a TCP segment, an IPv4 packet, and an Ethernet frame.
- **Code Walkthrough:** Inspect `PacketExplorer.tsx` and demonstrate how the header fields correspond to RFC specifications:
  - Ethernet: MAC addresses and EtherType (`0x0800` for IPv4).
  - IPv4: TTL, Protocol (`6` for TCP, `17` for UDP), Source & Destination IP.
  - TCP: Source/Destination Ports, Sequence/Ack numbers, TCP Flags (`SYN`, `ACK`, `FIN`, `RST`).

### Module 2: Packets vs. Flows (Why Aggregation Matters)
- **Concept:** A single video stream can generate 50,000 packets per second. An analyst cannot read 50,000 individual rows.
- **Formulation:** Explain the 5-tuple flow aggregation formula in `TDR.md`. Show how grouping by `SrcIP, DstIP, SrcPort, DstPort, Protocol` creates an actionable summary.

### Module 3: Ethical Boundaries of Packet Sniffing
- **Discussion:** Why raw socket creation requires `CAP_NET_RAW` on Linux and Administrator privileges on Windows.
- **Privacy:** Explain why modern web payloads are encrypted under TLS 1.3, and why collecting application payloads without consent violates privacy standards.

---

## 3. Student Checkpoint Exercises
1. **Exercise 1 (Packet Filtering):** Use the search bar in the Packet Explorer to isolate all DNS packets (`port 53`) and determine the queried domain names.
2. **Exercise 2 (Hex Dump Reading):** In the Packet Explorer hex inspector, locate the Ethernet preamble, IP version nibble (`4`), and TCP destination port in the raw byte stream.
3. **Exercise 3 (Anomaly Heuristics):** Formulate a rule to detect a horizontal port scan (a single source IP querying 50 distinct destination ports within 2 seconds).
