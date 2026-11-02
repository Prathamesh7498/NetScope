# NetScope — Technical Design Report (TDR)
**Version:** 1.0.0-Draft (Phase 0/1)  
**Author:** Antigravity AI & Piyush  
**Date:** October 2026  

---

## 1. System Architecture
NetScope separates packet sniffing, file ingestion, protocol decoding, flow aggregation, REST API serving, and frontend presentation into isolated layers.

```mermaid
graph TD
    User[Network Analyst / Student] -->|Interacts| Client[React + Vite Frontend (Port 3003)]
    Client -->|REST API / SSE| Flask[Flask API Server]
    Flask --> Database[(PostgreSQL Database)]
    Flask --> Engine[Packet Engine & Scapy Parser]
    PCAP[PCAP Upload / File Ingestion] --> Engine
    Sniffer[Authorized Live Capture Daemon] -->|Raw Sockets / Npcap| Engine
    Engine --> Flows[Bidirectional Flow Aggregator]
    Engine --> Anomaly[Anomaly Heuristics Engine]
    Flows --> Database
```

## 2. Packet Engine & Flow Aggregation Formulation

### 2.1 The 5-Tuple Flow Identifier
A network flow $F$ is defined symmetrically:
$$\text{FlowID}(p) = \left(\min(\text{IP}_s, \text{IP}_d), \, \max(\text{IP}_s, \text{IP}_d), \, \min(\text{Port}_s, \text{Port}_d), \, \max(\text{Port}_s, \text{Port}_d), \, \text{Proto}\right)$$
This ensures that incoming and outgoing packets in a conversation (e.g., TCP SYN and SYN-ACK) are mapped to the same unified flow record.

### 2.2 Flow Termination Conditions
A flow session is marked closed when:
1. TCP `FIN` or `RST` flag is observed in either direction.
2. Inactivity timeout exceeds $\tau_{\text{idle}} = 60\text{ seconds}$ (or $\tau_{\text{UDP}} = 30\text{ seconds}$).

### 2.3 SYN-Flood Anomaly Metric
$$\text{Ratio}_{\text{SYN}} = \frac{N_{\text{SYN}}}{N_{\text{SYN-ACK}} + 1}$$
When $\text{Ratio}_{\text{SYN}} > 5.0$ over a 10-second rolling window with $N_{\text{SYN}} > 100$, an anomaly alert is raised.

## 3. Frontend Architecture (Phase 1)
- React 18, Vite 5, Tailwind CSS 3.
- Monospace hex inspection with byte offset indices (`0000`, `0010`, etc.).
- Modal interfaces for PCAP drag-and-drop and live capture configuration.
