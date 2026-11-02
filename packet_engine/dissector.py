"""
NetScope - Packet Dissector & Hex Formatter
Handles WireShark-style deep packet inspection (Ethernet -> IPv4/IPv6 -> TCP/UDP/ICMP -> Payload) with byte offset mapping.
Supports both live real Scapy packets and structured network packets.
"""
from typing import Dict, Any, List

def format_hex_dump(raw_bytes: bytes) -> List[Dict[str, Any]]:
    """Formats raw bytes into 16-byte hex + ASCII rows."""
    lines = []
    length = len(raw_bytes)
    for offset in range(0, length, 16):
        chunk = raw_bytes[offset : offset + 16]
        hex_parts = [f"{b:02x}" for b in chunk]
        ascii_parts = [chr(b) if 32 <= b <= 126 else "." for b in chunk]
        
        lines.append({
            "offset": f"{offset:04x}",
            "hex": " ".join(hex_parts),
            "ascii": "".join(ascii_parts),
            "byte_indices": list(range(offset, offset + len(chunk)))
        })
    return lines

def dissect_real_packet(packet_id: int, raw_bytes: bytes, proto: str = "TCP", src: str = "127.0.0.1", dst: str = "127.0.0.1", sport: int = 0, dport: int = 0) -> Dict[str, Any]:
    """Generates structured dissection layers from actual raw packet bytes."""
    total_len = len(raw_bytes)
    
    # Layer 2: Ethernet header (14 bytes)
    eth_end = min(14, total_len)
    layers = [
        {
            "name": "Frame & Ethernet II Header",
            "byte_range": [0, eth_end],
            "color": "#3B82F6",
            "details": {
                "Frame Length": f"{total_len} bytes",
                "Destination MAC": ":".join(f"{b:02x}" for b in raw_bytes[0:6]) if total_len >= 6 else "ff:ff:ff:ff:ff:ff",
                "Source MAC": ":".join(f"{b:02x}" for b in raw_bytes[6:12]) if total_len >= 12 else "00:00:00:00:00:00",
                "EtherType": f"0x{raw_bytes[12:14].hex() if total_len >= 14 else '0800'}"
            }
        }
    ]
    
    # Layer 3: IP Layer
    ip_start = eth_end
    ip_end = min(ip_start + 20, total_len)
    if total_len > ip_start:
        version = (raw_bytes[ip_start] >> 4) if total_len > ip_start else 4
        layers.append({
            "name": f"Internet Protocol Version {version} (Network Layer)",
            "byte_range": [ip_start, ip_end],
            "color": "#10B981",
            "details": {
                "Version": version,
                "Source Address": src,
                "Destination Address": dst,
                "Protocol": f"{proto}",
                "Total Length": total_len - ip_start
            }
        })
    
    # Layer 4: Transport Layer
    tp_start = ip_end
    tp_end = min(tp_start + 20, total_len)
    if total_len > tp_start:
        layers.append({
            "name": f"Transport Layer ({proto})",
            "byte_range": [tp_start, tp_end],
            "color": "#F59E0B",
            "details": {
                "Source Port": sport,
                "Destination Port": dport,
                "Header Length": f"{tp_end - tp_start} bytes"
            }
        })
        
    # Layer 5: Payload
    if total_len > tp_end:
        payload_chunk = raw_bytes[tp_end:]
        layers.append({
            "name": f"Application Data Payload ({min(len(payload_chunk), 512)} bytes)",
            "byte_range": [tp_end, total_len],
            "color": "#A855F7",
            "details": {
                "Payload Length": len(payload_chunk),
                "Decoded ASCII Preview": "".join(chr(b) if 32 <= b <= 126 else "." for b in payload_chunk[:128])
            }
        })

    return {
        "id": packet_id,
        "length": total_len,
        "protocol": proto,
        "src_ip": src,
        "dst_ip": dst,
        "src_port": sport,
        "dst_port": dport,
        "hex_dump": format_hex_dump(raw_bytes),
        "layers": layers
    }

def dissect_simulated_packet(packet_id: int, proto: str = "TCP", src: str = "192.168.1.105", dst: str = "10.0.0.1", sport: int = 54321, dport: int = 443) -> Dict[str, Any]:
    """Generates a structured dissection breakdown for a packet."""
    eth_bytes = b"\x00\x0c\x29\x4f\x8e\x12\x52\x54\x00\x12\x34\x56\x08\x00"
    ip_bytes = b"\x45\x00\x00\x48\x1a\x2b\x40\x00\x40\x06\xa4\x12\xc0\xa8\x01\x69\x0a\x00\x00\x01"
    tcp_bytes = b"\xd4\x31\x01\xbb\x00\x12\x34\x56\x00\x00\x00\x00\x80\x02\xfa\xf0\x12\x34\x00\x00"
    payload = b"GET /api/v1/telemetry HTTP/1.1\r\nHost: secure.corp.local\r\n"
    raw = eth_bytes + ip_bytes + tcp_bytes + payload
    
    return dissect_real_packet(
        packet_id=packet_id,
        raw_bytes=raw,
        proto=proto,
        src=src,
        dst=dst,
        sport=sport,
        dport=dport
    )
