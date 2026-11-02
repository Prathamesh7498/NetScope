import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LockKeyhole, Mail } from 'lucide-react';
import { loginOperator } from '../api';
import { AuthNotice, AuthShell, authButtonClass, authInputClass } from './AuthShell';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginOperator(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error || 'Unable to sign in.');
    }
  };

  return (
    <AuthShell title="Sign in to your account" subtitle="SECURE OPERATOR ACCESS">
      {typeof location.state?.notice === 'string' && (
        <AuthNotice>{location.state.notice}</AuthNotice>
      )}
      {error && (
        <AuthNotice error>
          <p>{error}</p>
          {error === 'Please verify your email before logging in.' && (
            <Link
              to={`/resend-verification?email=${encodeURIComponent(email)}`}
              className="mt-2 inline-block font-semibold underline"
            >
              Resend verification email
            </Link>
          )}
        </AuthNotice>
      )}
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-xs text-[#CBD5E1]">
          Email address
          <span className="relative mt-1.5 block">
            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-[#64748B]" />
            <input
              className={`${authInputClass} pl-10`}
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </span>
        </label>
        <label className="block text-xs text-[#CBD5E1]">
          Password
          <span className="relative mt-1.5 block">
            <LockKeyhole className="absolute left-3 top-3.5 h-4 w-4 text-[#64748B]" />
            <input
              className={`${authInputClass} pl-10`}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
            />
          </span>
        </label>
        <div className="text-right text-xs">
          <Link to="/forgot-password" className="text-[#67E8F9] hover:underline">
            Forgot password?
          </Link>
        </div>
        <button className={authButtonClass} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 border-t border-[#1E293B] pt-5 text-center text-xs text-[#94A3B8]">
        New to NetScope?{' '}
        <Link to="/register" className="font-semibold text-[#67E8F9] hover:underline">
          Create an account
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-[#64748B]">
        Need to verify an account?{' '}
        <Link to="/resend-verification" className="text-[#67E8F9] hover:underline">
          Resend verification
        </Link>
      </p>
    </AuthShell>
  );
};

export default Login;
