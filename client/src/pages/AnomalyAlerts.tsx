import React, { useState, useEffect } from 'react';
import { fetchAnomalies } from '../api';

export const AnomalyAlerts: React.FC = () => {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnomalies().then((data) => {
      setAnomalies(data);
      setLoading(false);
    });
    const interval = setInterval(() => {
      fetchAnomalies().then(setAnomalies);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = anomalies.filter(
    (a) => severityFilter === 'All' || a.severity === severityFilter
  );

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Title */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0F172A]/95 backdrop-blur-xl p-6 shadow-xl border border-[#1E293B]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[24px] text-[#F43F5E]">security</span>
              <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
                Security Events & Behavioral Anomalies
              </h1>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 font-sans">
              Rule-based heuristic triggers, entropy-based covert channels, and volume spike detection.
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-lg bg-[#F43F5E]/20 text-[#F43F5E] font-mono text-xs font-bold border border-[#F43F5E]/40 shadow-sm">
            {filtered.length} ACTIVE INCIDENTS
          </span>
        </div>
      </div>

      {/* Severity Filter */}
      <div className="flex items-center gap-2">
        {['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-semibold transition-all ${
              severityFilter === sev
                ? 'bg-[#8B5CF6] text-white border border-[#A78BFA]/40 shadow-sm'
                : 'bg-[#0F172A] text-[#94A3B8] hover:text-white border border-[#1E293B] hover:bg-[#1E293B]'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filtered.map((a) => (
          <div
            key={a.id}
            className={`rounded-2xl p-6 bg-[#0F172A] shadow-xl flex flex-col md:flex-row justify-between gap-4 border transition-all ${
              a.severity === 'CRITICAL'
                ? 'border-[#F43F5E]/50 hover:border-[#F43F5E]'
                : a.severity === 'HIGH'
                ? 'border-[#F59E0B]/50 hover:border-[#F59E0B]'
                : 'border-[#8B5CF6]/40 hover:border-[#8B5CF6]'
            }`}
          >
            <div className="space-y-2.5 flex-1 font-mono">
              <div className="flex items-center gap-3">
                <span className="text-[#A78BFA] font-bold text-xs">{a.id}</span>
                <h3 className="font-sans font-bold text-base text-white">{a.type}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                    a.severity === 'CRITICAL'
                      ? 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/40'
                      : a.severity === 'HIGH'
                      ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                      : 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/40'
                  }`}
                >
                  {a.severity}
                </span>
              </div>

              <p className="font-sans text-xs text-[#94A3B8] leading-relaxed">
                {a.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#94A3B8] pt-1">
                <span>Source: <span className="text-white font-medium">{a.source}</span></span>
                <span>Target: <span className="text-white font-medium">{a.target}</span></span>
                {a.packets_per_sec && (
                  <span>Rate: <span className="text-[#F59E0B] font-bold">{a.packets_per_sec.toLocaleString()} pps</span></span>
                )}
                {a.mitre_tactic && (
                  <span className="text-[#A78BFA]">MITRE: {a.mitre_tactic}</span>
                )}
              </div>

              {a.recommended_action && (
                <div className="mt-2 p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] text-xs text-[#A78BFA] font-sans flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#8B5CF6]">lightbulb</span>
                  <span><strong>Mitigation:</strong> {a.recommended_action}</span>
                </div>
              )}
            </div>

            <div className="flex md:flex-col justify-between items-end shrink-0 text-right">
              <span className="text-xs text-[#94A3B8] font-mono">{a.timestamp || 'Live'}</span>
              <button className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#8B5CF6] text-white font-mono text-xs font-semibold border border-[#1E293B] transition-all">
                FORENSIC TRACE →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnomalyAlerts;
