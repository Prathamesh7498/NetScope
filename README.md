# NetScope — Packet Sniffing & Network Traffic Analysis Platform 📡🌐

> **Educational Network Operations (NOC) & Cybersecurity Platform for Importing PCAPs, Inspecting Packet Headers, Aggregating Bidirectional Flows, and Flagging Traffic Anomalies.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Phase](https://img.shields.io/badge/Phase-Phase%201%20(Frontend%20Active)-emerald.svg)]()

---

## 🚀 Overview
NetScope bridges low-level network packet mechanics with a modern, high-contrast Dark Navy operations dashboard. Built for network engineering and cybersecurity students:
- **Packet Ingestion:** Safe import of standard `.pcap` and `.pcapng` capture files.
- **Protocol Decoding:** Layer 2-4 headers (Ethernet, IPv4/IPv6, TCP, UDP, ICMP, DNS, TLS).
- **Flow Aggregation:** Automatic grouping into bidirectional 5-tuple conversations with duration and byte volume tracking.
- **Payload Hex Viewer:** Interactive byte and ASCII dump inspector.
- **Anomaly Detection:** Rule-based heuristics for port scanning, SYN floods, and DNS amplification.

---

## 📁 Repository Structure
```
netscope/
├── client/              # Phase 1: High-contrast dark navy React/TS dashboard
├── server/              # Phase 2: Flask REST API (Planned)
├── capture/             # Phase 6: Scapy live capture daemon & BPF compiler (Planned)
├── packet_engine/       # Phase 4: Scapy parser & flow aggregator (Planned)
├── analysis/            # Phase 5 & 7: Traffic stats & anomaly rules (Planned)
├── database/            # Phase 8: PostgreSQL models & migrations (Planned)
├── tests/               # Phase 10: Pytest test suites (Planned)
└── docs/                # PDR, TDR, User Guide & Mentor Teaching Manual
```

---

## Running NetScope

### Prerequisites
- Node.js $\ge 18$
- npm $\ge 9$
- Python 3.10+

### Commands
```powershell
# From the project root: install backend dependencies and configure environment
python -m pip install -r requirements.txt
Copy-Item .env.example .env
# Edit .env and set a random JWT_SECRET (at least 32 characters) and real SMTP credentials.

# Start the Flask API in one terminal
python run_server.py

# Start the React client in another terminal
cd client
npm run dev
```
The client runs on **http://localhost:3003** and the API on **http://localhost:5003**.

## Email authentication setup

The existing API is Python/Flask, so it sends verification codes and password-reset
links using Python's `smtplib` with SMTP TLS rather than Node-only Nodemailer. Set `SMTP_HOST`,
`SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `FRONTEND_URL` in the root `.env`
file. For Gmail, use `smtp.gmail.com:587` and a Google App Password (not the Google account
password). SMTP values and `JWT_SECRET` must never be placed in frontend configuration.

Registration requires a full name, normalized unique email, a password of at least 10
characters (maximum 72 UTF-8 bytes), and matching confirmation. The account remains
unverified until the user enters the six-digit code received by email. Verification codes
are single-use, stored only as keyed hashes, and expire after 15 minutes. Password-reset links
also expire after 15 minutes. Authentication uses
bcrypt password hashes and a 30-minute JWT stored only in an HttpOnly, SameSite=Lax cookie.
Set `APP_ENV=production` and `COOKIE_SECURE=true` when serving behind HTTPS; configure
`CLIENT_ORIGIN` to the exact frontend origin(s).

Available auth routes: `POST /api/auth/register`, `POST /api/auth/verify-email`,
`POST /api/auth/resend-verification`, `POST /api/auth/login`, `POST /api/auth/logout`,
`GET /api/auth/me`, `POST /api/auth/forgot-password`, and `POST /api/auth/reset-password`.
Email endpoints return success only after SMTP accepts delivery, except privacy-preserving
resend and recovery responses, which intentionally do not disclose whether an account exists.

---

## ⚠️ Phase 1 Demo Data Disclaimer
All packet metrics, hex dumps, bandwidth figures, and capture sessions in Phase 1 are **simulated for demonstration and teaching purposes**. No live packet sniffing or socket creation occurs until Phase 2 and Phase 6 are explicitly approved.
