'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { BoltDatabase } from '@/lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  defaultMode: 'signin' | 'signup';
}

export function AuthModal({ onClose, defaultMode }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await BoltDatabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await BoltDatabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 mx-4"
        style={{ background: '#0D0D1A', border: '1px solid #1C1C2E' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold" style={{ color: '#C8C8DC' }}>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#4A4A64' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-150"
            style={{
              background: '#080810',
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
            className="rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-150"
            style={{
              background: '#080810',
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
            <p className="text-xs px-1" style={{ color: '#EF4444' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl py-3 text-sm font-semibold transition-all duration-150 mt-1"
            style={{
              background: loading ? '#0F0F1C' : 'linear-gradient(135deg, #2D3FA8 0%, #4B5ED4 100%)',
              color: loading ? '#2E2E46' : '#FFFFFF',
              border: loading ? '1.5px solid #1C1C2E' : 'none',
              boxShadow: loading ? 'none' : '0 4px 24px rgba(45,63,168,0.35)',
            }}
          >
            {loading ? 'Please wait…' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="text-xs text-center mt-4" style={{ color: '#3E3E58' }}>
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="font-medium"
            style={{ color: '#5B6FE8' }}
          >
            {mode === 'signin' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
