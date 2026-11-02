# NetScope — Security & Authorized Packet Capture Policy

## 1. Ethical & Legal Safeguards for Packet Sniffing
Capturing network traffic without explicit authorization from the network owner or administrator is illegal under computer misuse legislation (e.g., Computer Fraud and Abuse Act, GDPR).

NetScope enforces the following technical and operational guardrails:
1. **Authorization Verification:** Live packet capture features require opt-in confirmation that the user is authorized to inspect network traffic on the designated interface.
2. **Encrypted Payload Privacy:** Modern web traffic utilizes TLS 1.3 encryption. NetScope analyzes only unencrypted transport layer metadata (IP headers, TCP/UDP ports, TLS ClientHello SNI headers) and does not attempt to decrypt application contents.
3. **Payload Truncation (Snaplen):** By default, capture routines enforce a snaplen of 96 bytes to capture headers only while discarding sensitive application payloads (PII, credentials).
4. **Buffer & File Limits:** PCAP uploads are capped at 50MB, and memory ring buffers are limited to 100,000 packets to prevent Denial of Service (DoS) attacks on host memory.

## 2. Anomaly vs. Attack Attribution Guardrail
NetScope adheres to strict defensive nomenclature: an anomaly (e.g., a burst of TCP SYN packets) is labeled as an **"Unusual Traffic Anomaly"**, never as a "Confirmed Cyberattack", unless substantiated by verified threat intelligence.
