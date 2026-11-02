export type Protocol = 'TCP' | 'UDP' | 'ICMP' | 'DNS' | 'TLS' | 'ARP' | 'HTTP';

export interface PacketHeader {
  srcMac: string;
  dstMac: string;
  srcIp: string;
  dstIp: string;
  srcPort?: number;
  dstPort?: number;
  protocol: Protocol;
  length: number;
  ttl: number;
  tcpFlags?: string[];
  dnsQuery?: string;
  tlsSni?: string;
}

export interface Packet {
  id: number;
  timestamp: string; // ISO or relative seconds
  srcIp: string;
  dstIp: string;
  srcPort?: number;
  dstPort?: number;
  protocol: Protocol;
  length: number;
  info: string;
  hexDump: string[];
  asciiDump: string[];
  headers: PacketHeader;
}

export interface NetworkFlow {
  id: string;
  srcIp: string;
  dstIp: string;
  srcPort: number;
  dstPort: number;
  protocol: Protocol;
  startTime: string;
  durationSec: number;
  packetCount: number;
  bytesTotal: number;
  state: 'ESTABLISHED' | 'CLOSED' | 'SYN_SENT' | 'RESET';
  application: string;
}

export interface AnomalyAlert {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  description: string;
  srcIp: string;
  targetIp: string;
  protocol: Protocol;
  packetCount: number;
  status: 'INVESTIGATING' | 'CONFIRMED_ANOMALY' | 'DISMISSED';
}
