import React from 'react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, children }) => (
  <div
    className="min-h-screen relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100 font-sans bg-cover bg-center"
    style={{
      backgroundImage: "linear-gradient(rgba(8, 13, 26, 0.90), rgba(8, 13, 26, 0.96)), url('/ncs-bg.jpg')",
    }}
  >
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[540px] h-[540px] max-w-full bg-gradient-to-tr from-[#06B6D4]/15 via-[#8B5CF6]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
    <header className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
      <img
        src="/ncs-icon-circle.png"
        alt="NetScope NCS"
        className="mx-auto mb-4 w-20 h-20 rounded-full object-cover border-2 border-[#06B6D4] shadow-[0_0_25px_rgba(6,182,212,0.5)]"
      />
      <h1 className="text-3xl font-black tracking-widest text-white font-mono">
        NETSCOPE <span className="text-[#00F2FE]">NCS</span>
      </h1>
      <p className="mt-2 text-xs text-[#94A3B8] font-mono">{subtitle}</p>
    </header>
    <main className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <section className="bg-[#0F172A]/95 backdrop-blur-xl border border-[#1E293B] py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
        <h2 className="mb-6 text-lg text-white font-bold font-mono">{title}</h2>
        {children}
      </section>
    </main>
  </div>
);

export const authInputClass =
  'w-full bg-[#080D1A] border border-[#1E293B] text-white rounded-xl px-3 py-3 focus:ring-2 focus:ring-[#06B6D4]/40 focus:border-[#06B6D4] focus:outline-none placeholder:text-[#64748B] transition';

export const authButtonClass =
  'w-full bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] hover:from-[#00F2FE] hover:to-[#A78BFA] text-[#080D1A] font-bold py-3.5 rounded-xl shadow-lg shadow-[#06B6D4]/25 transition flex items-center justify-center gap-2 disabled:opacity-50';

export const AuthNotice: React.FC<{ children: React.ReactNode; error?: boolean }> = ({ children, error }) => (
  <div className={`mb-4 rounded-xl border px-3.5 py-3 text-sm ${
    error
      ? 'bg-[#F43F5E]/10 border-[#F43F5E]/30 text-[#FDA4AF]'
      : 'bg-[#06B6D4]/10 border-[#06B6D4]/30 text-[#A5F3FC]'
  }`}>
    {children}
  </div>
);
