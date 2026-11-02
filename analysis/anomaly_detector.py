"""
NetScope - Network Anomaly & Intrusion Heuristic Analyzer
"""
from typing import List, Dict, Any

SAMPLE_ANOMALIES = [
    {
        "id": "ANOM-801",
        "type": "SYN Flood / Half-Open Exhaustion",
        "severity": "CRITICAL",
        "mitre_tactic": "T1498 (Network Denial of Service)",
        "source": "198.51.100.44",
        "target": "10.0.0.1:443",
        "packets_per_sec": 42500,
        "description": "Unanswered TCP SYN packets exceeding normal window baseline by 850%.",
        "timestamp": "Just now",
        "recommended_action": "Enable SYN cookies and deploy edge IP drop filter."
    },
    {
        "id": "ANOM-802",
        "type": "Subdomain DNS Tunneling (Data Exfiltration)",
        "severity": "HIGH",
        "mitre_tactic": "T1071.004 (DNS Command & Control)",
        "source": "192.168.1.188",
        "target": "8.8.8.8:53",
        "packets_per_sec": 1420,
        "description": "Base64-encoded labels in TXT queries exceeding 65 characters entropy threshold.",
        "timestamp": "2 min ago",
        "recommended_action": "Quarantine host 192.168.1.188 and inspect active processes."
    },
    {
        "id": "ANOM-803",
        "type": "Distributed Port Sweep (Reconnaissance)",
        "severity": "MEDIUM",
        "mitre_tactic": "T1046 (Network Service Discovery)",
        "source": "203.0.113.19",
        "target": "10.0.0.0/24 (Ports 21, 22, 23, 3389)",
        "packets_per_sec": 320,
        "description": "Sequential TCP connect attempts across internal management interfaces.",
        "timestamp": "8 min ago",
        "recommended_action": "Auto-block origin subnet at firewall ingress."
    }
]

def get_live_anomalies() -> List[Dict[str, Any]]:
    return SAMPLE_ANOMALIES

