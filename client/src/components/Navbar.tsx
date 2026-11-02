import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkBackendHealth, getCurrentUser, logoutOperator, UserProfile } from '../api';

interface NavbarProps {
  onBpfApply?: (expr: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onBpfApply }) => {
  const navigate = useNavigate();
  const [bpfExpr, setBpfExpr] = useState('tcp and port 443');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    setUser(getCurrentUser());
    checkBackendHealth().then((online) => setBackendOnline(online));
    const interval = setInterval(() => {
      checkBackendHealth().then((online) => setBackendOnline(online));
      setUser(getCurrentUser());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onBpfApply?.(bpfExpr);
  };

  const handleLogout = async () => {
    setLogoutError('');
    const success = await logoutOperator();
    if (success) navigate('/login', { replace: true });
    else setLogoutError('Sign out could not reach the server. Please try again.');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'NS';

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-[#0F172A]/90 backdrop-blur-xl border-b border-[#1E293B] z-40 flex items-center justify-between px-6 shadow-md select-none">
      {/* BPF Filter Query Bar */}
      <form onSubmit={handleApply} className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full flex items-center">
          <div className="absolute left-3 flex items-center pointer-events-none text-[#94A3B8]">
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
          </div>
          <input
            type="text"
            value={bpfExpr}
            onChange={(e) => setBpfExpr(e.target.value)}
            placeholder="Apply BPF filter (e.g. tcp and port 443 or host 192.168.43.193)"
            className="w-full h-9 pl-9 pr-20 rounded-lg bg-[#080D1A] border border-[#1E293B] focus:border-[#06B6D4] focus:outline-none focus:ring-1 focus:ring-[#06B6D4]/40 text-slate-100 placeholder-[#94A3B8]/70 font-mono text-xs transition-all"
          />
          <div className="absolute right-1.5 flex items-center">
            <button
              type="submit"
              className="px-2.5 py-1 rounded-md bg-[#1E293B] text-[#06B6D4] font-mono text-[10px] uppercase font-bold hover:bg-[#06B6D4] hover:text-[#080D1A] transition-all shadow-sm"
            >
              FILTER
            </button>
          </div>
        </div>
      </form>

      {/* Status Badges & Profile */}
      <div className="flex items-center gap-3 pl-4">
        {/* Engine Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080D1A] border border-[#1E293B]">
          <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse"></span>
          <span className="font-mono text-[10px] text-[#00F2FE] font-bold uppercase tracking-wider">
            KERNEL SNIFFER
          </span>
        </div>

        {/* Backend Connection */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold uppercase tracking-wider ${
            backendOnline
              ? 'bg-[#06B6D4]/15 text-[#00F2FE] border-[#06B6D4]/40'
              : 'bg-[#F59E0B]/20 border-[#F59E0B]/40 text-[#F59E0B]'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {backendOnline ? 'check_circle' : 'sync'}
          </span>
          <span>{backendOnline ? 'LIVE API 5003' : 'CONNECTING...'}</span>
        </div>

        {/* Signed-in account */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#1E293B]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] border border-[#00F2FE]/50 flex items-center justify-center text-white font-mono text-xs font-bold shadow-md shadow-[#06B6D4]/25">
            {userInitials}
          </div>
          <div className="flex flex-col text-left max-w-[175px] truncate">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-mono text-xs text-white font-bold truncate">
                {user ? user.name : 'NOC Operator'}
              </span>
              {user?.isVerified === true && (
                <span
                  className="inline-flex items-center gap-0.5 text-[#10B981] bg-[#10B981]/15 px-1 py-0.2 rounded border border-[#10B981]/30 text-[8px] font-mono font-bold shrink-0"
                  title="Cryptographically Verified Operator Email"
                >
                  <span className="material-symbols-outlined text-[10px]">verified</span>
                  <span>VERIFIED</span>
                </span>
              )}
            </div>
            <span className="font-mono text-[9px] text-[#06B6D4] truncate" title={user?.email || 'Not signed in'}>
              {user?.email || 'Not signed in'}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Sign out of operator console"
            className="ml-1 p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F43F5E] hover:bg-[#1E293B] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
        {logoutError && (
          <span role="alert" className="absolute right-6 top-14 rounded bg-[#F43F5E]/15 px-3 py-2 text-[10px] text-[#FDA4AF]">
            {logoutError}
          </span>
        )}
      </div>
    </header>
  );
};

export default Navbar;
