'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowRight } from 'lucide-react';

const PERSONAS = [
  {
    id: 'alex',
    emoji: '🧠',
    name: 'Alex',
    tagline: 'The Analytical One',
    description: 'Breaks things down logically, asks probing questions, tests your reasoning step by step.',
    color: '#3B82F6',
    glowColor: 'rgba(59,130,246,0.4)',
    borderActive: 'rgba(59,130,246,0.75)',
  },
  {
    id: 'maya',
    emoji: '✨',
    name: 'Maya',
    tagline: 'The Creative Connector',
    description: 'Finds unexpected analogies, links ideas across subjects, gets genuinely excited.',
    color: '#F59E0B',
    glowColor: 'rgba(245,158,11,0.4)',
    borderActive: 'rgba(245,158,11,0.75)',
  },
  {
    id: 'jordan',
    emoji: '🔍',
    name: 'Jordan',
    tagline: "The Devil's Advocate",
    description: "Challenges every assumption, demands precision, won't let vague answers slide.",
    color: '#10B981',
    glowColor: 'rgba(16,185,129,0.4)',
    borderActive: 'rgba(16,185,129,0.75)',
  },
] as const;

export default function SetupPage() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const router = useRouter();

  const canStart = selectedPersona !== null && topic.trim().length > 0;

  const handleStart = () => {
    if (!canStart) return;
    localStorage.setItem(
      'studySession',
      JSON.stringify({
        personaId: selectedPersona,
        topic: topic.trim(),
        studyNotes: notes.trim(),
      })
    );
    router.push('/chat');
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16" style={{ background: '#0A0A0F' }}>
      {/* Logo + Title */}
      <div className="flex flex-col items-center mb-14">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1E2A6E, #2D3FA8)', boxShadow: '0 0 20px rgba(59,79,200,0.3)' }}
          >
            <BookOpen className="w-5 h-5" style={{ color: '#A0B0FF' }} />
          </div>
          <h1
            className="text-5xl font-bold"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #E0E0EE 0%, #7878A0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Study Buddy
          </h1>
        </div>
        <p className="text-sm tracking-wide" style={{ color: '#42425A' }}>
          AI-powered peer studying — not a tutor, a partner
        </p>
      </div>

      <div className="w-full max-w-3xl">
        {/* Section label */}
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: '#3A3A54' }}
        >
          Choose your study partner
        </p>

        {/* Persona cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {PERSONAS.map((p) => {
            const active = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p.id)}
                className="relative text-left rounded-2xl p-5 transition-all duration-200 focus:outline-none"
                style={{
                  background: active ? '#111120' : '#0D0D1A',
                  border: `1.5px solid ${active ? p.borderActive : '#1C1C2E'}`,
                  boxShadow: active
                    ? `0 0 0 1px ${p.borderActive}, 0 0 28px ${p.glowColor}, 0 8px 32px rgba(0,0,0,0.4)`
                    : '0 1px 4px rgba(0,0,0,0.3)',
                  transform: active ? 'translateY(-2px)' : 'none',
                }}
              >
                {active && (
                  <div
                    className="absolute top-3 right-3 w-2 h-2 rounded-full"
                    style={{ background: p.color, boxShadow: `0 0 6px ${p.glowColor}` }}
                  />
                )}
                <span className="block text-3xl mb-3">{p.emoji}</span>
                <span
                  className="block font-semibold text-sm mb-0.5"
                  style={{ color: active ? p.color : '#C8C8DC' }}
                >
                  {p.name}
                </span>
                <span
                  className="block text-xs font-medium mb-2"
                  style={{ color: active ? p.color + '99' : '#3E3E58' }}
                >
                  {p.tagline}
                </span>
                <span className="block text-xs leading-relaxed" style={{ color: '#4A4A64' }}>
                  {p.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Topic input */}
        <div className="flex flex-col gap-2 mb-4">
          <label
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#3A3A54' }}
          >
            What are you studying today?
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleStart(); }}
            placeholder="e.g. Photosynthesis, The French Revolution, Calculus derivatives..."
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-150"
            style={{
              background: '#0D0D1A',
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
        </div>

        {/* Notes textarea */}
        <div className="flex flex-col gap-2 mb-6">
          <label
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#3A3A54' }}
          >
            Paste your notes or study material{' '}
            <span className="normal-case font-normal" style={{ color: '#2A2A40' }}>
              (optional)
            </span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste lecture notes, textbook passages, or anything you want to work through..."
            rows={5}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none transition-all duration-150"
            style={{
              background: '#0D0D1A',
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
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="flex items-center justify-center gap-2 w-full rounded-xl py-3.5 text-sm font-semibold transition-all duration-150 focus:outline-none"
          style={{
            background: canStart
              ? 'linear-gradient(135deg, #2D3FA8 0%, #4B5ED4 100%)'
              : '#0F0F1C',
            color: canStart ? '#FFFFFF' : '#2E2E46',
            border: canStart ? 'none' : '1.5px solid #1C1C2E',
            cursor: canStart ? 'pointer' : 'not-allowed',
            boxShadow: canStart ? '0 4px 24px rgba(45,63,168,0.45)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (canStart) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'none';
          }}
        >
          Start Session
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
