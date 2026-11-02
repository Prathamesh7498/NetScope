import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, MailCheck, ShieldCheck } from 'lucide-react';
import {
  requestPasswordReset,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
} from '../api';
import { AuthNotice, AuthShell, authButtonClass, authInputClass } from './AuthShell';

export const VerifyEmailPage: React.FC = () => {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const confirm = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await verifyEmail(email.trim().toLowerCase(), code);
    setLoading(false);
    if (result.success) navigate('/verification-success', { replace: true, state: { verified: true } });
    else setError(result.error || 'Unable to verify this email address.');
  };

  return (
    <AuthShell title="Verify your email" subtitle="SIX-DIGIT CODE • EXPIRES IN 15 MINUTES">
      {error && <AuthNotice error>{error}</AuthNotice>}
      <div>
        <MailCheck className="mx-auto mb-4 h-10 w-10 text-[#67E8F9]" />
        <p className="mb-5 text-sm leading-6 text-[#CBD5E1]">
          Enter the six-digit code sent to your email. The code expires in 15 minutes and can only be used once.
        </p>
        <form onSubmit={confirm} className="space-y-4">
          <label className="block text-xs text-[#CBD5E1]">
            Email address
            <input
              className={`${authInputClass} mt-1.5`}
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="block text-xs text-[#CBD5E1]">
            Verification code
            <input
              className={`${authInputClass} mt-1.5 text-center text-xl tracking-[0.5em]`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
            />
          </label>
          <button className={authButtonClass} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Verifying…' : 'Verify email'}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-[#94A3B8]">
          Didn’t get a code?{' '}
          <Link
            to={`/resend-verification${email ? `?email=${encodeURIComponent(email)}` : ''}`}
            className="font-semibold text-[#67E8F9] hover:underline"
          >
            Resend verification code
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export const VerificationSuccessPage: React.FC = () => {
  const location = useLocation();
  const verified = location.state?.verified === true;
  return (
    <AuthShell
      title={verified ? 'Email verified' : 'Verification not confirmed'}
      subtitle={verified ? 'ACCOUNT ACTIVATED' : 'EMAIL OWNERSHIP CONFIRMATION'}
    >
      <div className="text-center">
        <ShieldCheck className={`mx-auto mb-4 h-12 w-12 ${verified ? 'text-emerald-400' : 'text-[#64748B]'}`} />
        <AuthNotice error={!verified}>
          {verified
            ? 'Your email address is verified. You can now sign in to NetScope.'
            : 'Enter the one-time verification code sent to your email to verify your account.'}
        </AuthNotice>
        {verified ? (
          <Link to="/login" className={authButtonClass}>Continue to sign in</Link>
        ) : (
          <Link to="/verify-email" className="font-semibold text-[#67E8F9] hover:underline">
            Open verification instructions
          </Link>
        )}
      </div>
    </AuthShell>
  );
};

export const ResendVerificationPage: React.FC = () => {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    const result = await resendVerificationEmail(email);
    setLoading(false);
    if (result.success) setMessage(result.message || 'Request processed.');
    else setError(result.error || 'Unable to process the request.');
  };

  return (
    <AuthShell title="Resend verification" subtitle="EMAIL OWNERSHIP CONFIRMATION">
      {error && <AuthNotice error>{error}</AuthNotice>}
      {message && <AuthNotice>{message}</AuthNotice>}
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm leading-6 text-[#CBD5E1]">
          Enter your address. If it belongs to an unverified account, a new six-digit code will be sent.
        </p>
        <label className="block text-xs text-[#CBD5E1]">
          Email address
          <input
            className={`${authInputClass} mt-1.5`}
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <button className={authButtonClass} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Sending…' : 'Send verification code'}
        </button>
      </form>
      <p className="mt-5 text-center text-xs text-[#94A3B8]">
        <Link to="/login" className="text-[#67E8F9] hover:underline">Back to sign in</Link>
      </p>
    </AuthShell>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (result.success) setMessage(result.message || 'If an eligible account exists, instructions will arrive shortly.');
    else setError(result.error || 'Unable to process the request.');
  };

  return (
    <AuthShell title="Forgot password" subtitle="SECURE ACCOUNT RECOVERY">
      {error && <AuthNotice error>{error}</AuthNotice>}
      {message && <AuthNotice>{message}</AuthNotice>}
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm leading-6 text-[#CBD5E1]">
          Enter your account email. For privacy, the response does not reveal whether an account exists.
        </p>
        <label className="block text-xs text-[#CBD5E1]">
          Email address
          <input
            className={`${authInputClass} mt-1.5`}
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <button className={authButtonClass} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Processing…' : 'Request reset link'}
        </button>
      </form>
      <p className="mt-5 text-center text-xs text-[#94A3B8]">
        <Link to="/login" className="text-[#67E8F9] hover:underline">Back to sign in</Link>
      </p>
    </AuthShell>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!token) {
      setError('This password reset link is invalid or expired.');
      return;
    }
    if (new TextEncoder().encode(password).length > 72) {
      setError('Password must be no more than 72 UTF-8 bytes.');
      return;
    }
    setLoading(true);
    const result = await resetPassword(token, password, confirmPassword);
    setLoading(false);
    if (result.success) navigate('/login', { replace: true, state: { notice: result.message } });
    else setError(result.error || 'Unable to reset the password.');
  };

  return (
    <AuthShell title="Choose a new password" subtitle="ONE-TIME RESET LINK">
      {error && <AuthNotice error>{error}</AuthNotice>}
      {!token && (
        <AuthNotice error>
          This reset link is missing or expired. <Link className="underline" to="/forgot-password">Request another</Link>.
        </AuthNotice>
      )}
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-xs text-[#CBD5E1]">
          New password
          <input
            className={`${authInputClass} mt-1.5`}
            type="password"
            autoComplete="new-password"
            minLength={10}
            maxLength={72}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className="block text-xs text-[#CBD5E1]">
          Confirm new password
          <input
            className={`${authInputClass} mt-1.5`}
            type="password"
            autoComplete="new-password"
            minLength={10}
            maxLength={72}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>
        <button className={authButtonClass} disabled={loading || !token}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Updating…' : 'Set new password'}
        </button>
      </form>
    </AuthShell>
  );
};
