# NetScope — Project Structure & File Layout

```
netscope/
├── client/                     # Phase 1: Vite + React + TypeScript + Tailwind (Port 3003)
│   ├── index.html              # Network monitoring SPA
│   ├── package.json            # Client workspace dependencies
│   ├── postcss.config.js       # PostCSS config
│   ├── tailwind.config.js      # Dark Navy NOC theme tokens
│   ├── tsconfig.json           # Client TypeScript configuration
│   ├── vite.config.ts          # Vite build & proxy settings (Port 3003)
│   └── src/
│       ├── main.tsx            # DOM mounting
│       ├── App.tsx             # Routing & session simulation
│       ├── index.css           # Global typography & hex dump utilities
│       ├── types/              # Domain models (Packet, Flow, AnomalyAlert, Protocol)
│       ├── data/               # Simulated packet capture fixtures & realistic flows
│       ├── components/         # Reusable UI (Navbar, Sidebar, DemoBanner, StatCards)
│       └── pages/              # View controllers
│           ├── Dashboard.tsx         # Real-time traffic overview, throughput & protocols
│           ├── PacketExplorer.tsx    # Filterable packet list, search & hex viewer
│           ├── ProtocolStats.tsx     # Protocol breakdown, top endpoints & bandwidth
│           ├── FlowDetails.tsx       # Bidirectional 5-tuple conversations & durations
│           ├── PcapUpload.tsx        # Drag-and-drop PCAP ingestion interface
│           ├── LiveCaptureModal.tsx  # Live capture prototype & interface selector
│           ├── AnomalyAlerts.tsx     # Flagged suspicious traffic & incident history
│           ├── Settings.tsx          # Capture buffers, BPF filters, user profile
│           ├── Login.tsx             # Authentication view
│           ├── Register.tsx          # Account registration
│           ├── Unauthorized.tsx      # 403 Forbidden state
│           └── NotFound.tsx          # 404 Not Found state
│
├── server/                     # Phase 2: Flask REST API Architecture (Planned)
│   ├── app.py                  # Flask app factory
│   ├── config.py               # Buffer limits & environment settings
│   ├── routes/                 # Blueprinted REST endpoints
│   │   ├── auth.py             # User access routes
│   │   ├── packets.py          # Packet stream & query endpoints
│   │   ├── flows.py            # Flow aggregation endpoints
│   │   └── upload.py           # PCAP file multipart parser
│   └── middleware/             # Rate limiting & file size validation
│
├── capture/                    # Phase 6: Authorized Capture Interfaces (Planned)
│   ├── sniffer.py              # Scapy AsyncSniffer background daemon
│   ├── bpf_validator.py        # BPF syntax compiler & sanitizer
│   └── interface_manager.py    # Enumeration of active NICs (Linux/Windows/macOS)
│
├── packet_engine/              # Phase 4: Parsing & Protocol Classification (Planned)
│   ├── parser.py               # Scapy to JSON packet metadata transformer
│   ├── flow_builder.py         # 5-tuple stateful bidirectional flow session tracker
│   └── layer_decoders.py       # Custom decoders for ARP, DNS, TLS SNI
│
├── analysis/                   # Phase 5 & 7: Statistics & Anomaly Rules (Planned)
│   ├── bandwidth.py            # Bytes per second & packet volume aggregators
│   ├── syn_flood_rule.py       # Half-open TCP connection threshold detector
│   └── scan_detector.py        # Horizontal/vertical port scan heuristics
│
├── database/                   # Phase 8: PostgreSQL Persistence (Planned)
│   ├── models.py               # SQLAlchemy ORM (PacketLog, FlowRecord, User)
│   └── migrations/             # Alembic migration scripts
│
├── tests/                      # Phase 10: Pytest Test Suites (Planned)
│   ├── test_pcap_parser.py     # Malformed PCAP boundary tests
│   ├── test_flow_builder.py    # FIN/RST flow termination verification
│   └── test_anomalies.py       # Port scan detection unit tests
│
├── deployment/                 # Phase 11: Production Containerization (Planned)
│   ├── Dockerfile              # Container with libpcap-dev & tcpdump
│   └── docker-compose.yml      # Orchestration with network privileges
│
├── docs/                       # Technical Documentation & Teaching Guides
│   ├── PDR.md                  # Project Design/Development Report
│   ├── TDR.md                  # Technical Design Report
│   ├── USER_GUIDE.md           # Network analyst handbook
│   └── MENTOR_TEACHING_GUIDE.md# Teaching guide for OSI layers & packet analysis
│
├── PROJECT_PLAN.md             # Project requirements & phased roadmap
├── ROADMAP.md                  # Milestone status tracking
├── CHANGELOG.md                # Version release history
├── SECURITY.md                 # Packet privacy & sniffing authorization policy
└── README.md                   # Repository overview & quick start
```
