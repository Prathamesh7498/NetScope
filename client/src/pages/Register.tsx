import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { registerOperator } from '../api';
import { AuthNotice, AuthShell, authButtonClass, authInputClass } from './AuthShell';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (new TextEncoder().encode(password).length > 72) {
      setError('Password must be no more than 72 UTF-8 bytes.');
      return;
    }
    setLoading(true);
    const result = await registerOperator(name, email, password, confirmPassword);
    setLoading(false);
    if (result.success) {
      navigate(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } else {
      setError(result.error || 'Unable to create your account.');
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="REGISTER WITH YOUR EMAIL ADDRESS">
      {error && <AuthNotice error>{error}</AuthNotice>}
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-xs text-[#CBD5E1]">
          Full name
          <span className="relative mt-1.5 block">
            <UserRound className="absolute left-3 top-3.5 h-4 w-4 text-[#64748B]" />
            <input
              className={`${authInputClass} pl-10`}
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
            />
          </span>
        </label>
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
          Password <span className="text-[#64748B]">(at least 10 characters)</span>
          <span className="relative mt-1.5 block">
            <LockKeyhole className="absolute left-3 top-3.5 h-4 w-4 text-[#64748B]" />
            <input
              className={`${authInputClass} pl-10`}
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a strong password"
            />
          </span>
        </label>
        <label className="block text-xs text-[#CBD5E1]">
          Confirm password
          <input
            className={`${authInputClass} mt-1.5`}
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            maxLength={72}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Enter your password again"
          />
        </label>
        <button className={authButtonClass} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 border-t border-[#1E293B] pt-5 text-center text-xs text-[#94A3B8]">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[#67E8F9] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default Register;
