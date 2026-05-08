'use client';

import { useState } from 'react';
import { X, BookOpen, Loader as Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth';

interface AuthModalProps {
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export function AuthModal({ onClose, defaultMode = 'signin' }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      const { error: signUpErr } = await signUp(email, password);
      if (signUpErr) {
        setLoading(false);
        setError(signUpErr);
        return;
      }
      const { error: signInErr } = await signIn(email, password);
      setLoading(false);
      if (signInErr) {
        setError('Account created! Please sign in.');
        setMode('signin');
        return;
      }
    } else {
      const { error: err } = await signIn(email, password);
      setLoading(false);
      if (err) {
        setError(err);
        return;
      }
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-8"
        style={{ background: '#0D0D1A', border: '1px solid #1E1E32' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150"
          style={{ color: '#3E3E58', background: '#111120' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#D0D0E8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#3E3E58'; }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1E2A6E, #2D3FA8)', boxShadow: '0 0 16px rgba(59,79,200,0.3)' }}
          >
            <BookOpen className="w-4 h-4" style={{ color: '#A0B0FF' }} />
          </div>
          <span
            className="text-lg font-bold"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              background: 'linear-gradient(135deg, #E0E0EE 0%, #7878A0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Study Buddy
          </span>
        </div>

        <h2 className="text-xl font-bold mb-1" style={{ color: '#E0E0EE', fontFamily: 'Georgia, serif' }}>
          {mode === 'signin' ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-sm mb-6" style={{ color: '#3E3E58' }}>
          {mode === 'signin'
            ? 'Sign in to access your study history.'
            : 'Save your sessions and track your progress.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-150"
            style={{
              background: '#111120',
              border: '1.5px solid #1C1C2E',
              color: '#D0D0E8',
              caretColor: '#5B6FE8',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#33335A';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91,111,232,0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1C1C2E';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-150"
            style={{
              background: '#111120',
              border: '1.5px solid #1C1C2E',
              color: '#D0D0E8',
              caretColor: '#5B6FE8',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#33335A';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91,111,232,0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1C1C2E';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />

          {error && (
            <p className="text-xs px-1" style={{ color: '#D44444' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 mt-1"
            style={{
              background: 'linear-gradient(135deg, #2D3FA8 0%, #4B5ED4 100%)',
              color: '#fff',
              boxShadow: '0 4px 24px rgba(45,63,168,0.45)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: '#3E3E58' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
            className="font-medium transition-colors duration-150"
            style={{ color: '#5B6FE8' }}
          >
            {mode === 'signin' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
