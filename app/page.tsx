'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowRight, Brain, Users, TrendingUp, Star, ChevronRight, FlaskConical } from 'lucide-react';
import Link from 'next/link';

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

const STATS = [
  { value: '0.5+', label: 'Effect Size', sub: 'Peer tutoring significantly boosts academic achievement & self-efficacy' },
  { value: '+5mo', label: 'Avg. Progress', sub: 'Collaborative learning adds months of additional academic advancement' },
  { value: '69%', label: 'Success Rate', sub: 'Students in peer-tutoring are more likely to outperform peers in GPA' },
];

const WHY_ITEMS = [
  {
    icon: Brain,
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.15)',
    title: 'The Protégé Effect',
    body: 'Teaching is the best way to learn. Research shows that explaining concepts to a peer solidifies your own understanding and reveals hidden gaps in your knowledge.',
  },
  {
    icon: Users,
    color: '#10B981',
    glow: 'rgba(16,185,129,0.15)',
    title: 'The Power of Groups',
    body: "Groups of 3–5 consistently outperform even the best individuals on complex problems. Collaborative learning isn't just social — it's a competitive advantage.",
  },
  {
    icon: TrendingUp,
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.15)',
    title: 'Proven Results',
    body: 'Studies in STEM and Engineering show that students in peer-led groups can earn nearly a full letter grade higher than those studying alone.',
  },
];

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
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0F', color: '#D0D0E8' }}>

      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ background: '#0B0B14', borderColor: '#181828' }}
      >
        <div className="flex items-center gap-2.5">
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
        <Link
          href="/science"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150"
          style={{ color: '#5B6FE8', border: '1px solid #1E2240', background: '#0D0D1A' }}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          The Science
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-4 pt-20 pb-16">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: '#0D1020', border: '1px solid #1E2440', color: '#5B6FE8' }}
        >
          <Star className="w-3 h-3" />
          Science-backed peer learning
        </div>

        <h1
          className="text-4xl sm:text-6xl font-bold leading-tight mb-5 max-w-2xl"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            background: 'linear-gradient(160deg, #E8E8F8 0%, #9090C0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-1px',
          }}
        >
          Supercharge Your Learning
        </h1>
        <p className="text-base sm:text-lg max-w-xl leading-relaxed mb-10" style={{ color: '#5A5A7A' }}>
          AI-powered peer studying — not a tutor, a partner. Built on decades of research
          showing that teaching others is the fastest path to mastery.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center px-6 py-4 rounded-2xl"
              style={{ background: '#0D0D1A', border: '1px solid #1C1C2E', minWidth: '120px' }}
            >
              <span
                className="text-2xl font-bold mb-0.5"
                style={{
                  background: 'linear-gradient(135deg, #6B8CFF, #A0B4FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {s.value}
              </span>
              <span className="text-xs font-semibold mb-1" style={{ color: '#C0C0D8' }}>{s.label}</span>
              <span className="text-xs text-center leading-snug max-w-[140px]" style={{ color: '#3A3A54' }}>{s.sub}</span>
            </div>
          ))}
        </div>

        <a
          href="#start"
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
          style={{
            background: 'linear-gradient(135deg, #2D3FA8 0%, #4B5ED4 100%)',
            color: '#FFFFFF',
            boxShadow: '0 4px 24px rgba(45,63,168,0.45)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; }}
        >
          Start Studying Free
          <ArrowRight className="w-4 h-4" />
        </a>
      </section>

      {/* Why It Works */}
      <section className="px-4 pb-20 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#3A3A54' }}>
            Why It Works
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              background: 'linear-gradient(135deg, #E0E0EE 0%, #7878A0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            The Science of Success
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {WHY_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl p-6"
                style={{ background: '#0D0D1A', border: '1px solid #1C1C2E' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: item.glow, border: `1px solid ${item.color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: '#C8C8DC' }}>{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#4A4A64' }}>{item.body}</p>
              </div>
            );
          })}
        </div>

        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4"
          style={{
            background: 'linear-gradient(135deg, #0D1020, #0A0D1A)',
            border: '1px solid #1E2440',
            borderLeft: '3px solid #3B82F6',
          }}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
            <TrendingUp className="w-4 h-4" style={{ color: '#3B82F6' }} />
          </div>
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#C8C8DC' }}>
              A Full Letter Grade Higher
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#4A4A64' }}>
              Engineering students in peer-led study groups earned significantly higher grades than peers studying alone —
              demonstrating that collaborative learning isn't just helpful, it's a measurable competitive advantage.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/science"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors duration-150"
            style={{ color: '#5B6FE8' }}
          >
            Read the full research
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Setup */}
      <section id="start" className="px-4 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#3A3A54' }}>
              Get Started
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                background: 'linear-gradient(135deg, #E0E0EE 0%, #7878A0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Choose Your Study Partner
            </h2>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3A3A54' }}>
            Who do you want to study with?
          </p>
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
                  <span className="block font-semibold text-sm mb-0.5" style={{ color: active ? p.color : '#C8C8DC' }}>
                    {p.name}
                  </span>
                  <span className="block text-xs font-medium mb-2" style={{ color: active ? p.color + '99' : '#3E3E58' }}>
                    {p.tagline}
                  </span>
                  <span className="block text-xs leading-relaxed" style={{ color: '#4A4A64' }}>
                    {p.description}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3A3A54' }}>
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

          <div className="flex flex-col gap-2 mb-6">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3A3A54' }}>
              Paste your notes or study material{' '}
              <span className="normal-case font-normal" style={{ color: '#2A2A40' }}>(optional)</span>
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

          <button
            onClick={handleStart}
            disabled={!canStart}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-3.5 text-sm font-semibold transition-all duration-150 focus:outline-none"
            style={{
              background: canStart ? 'linear-gradient(135deg, #2D3FA8 0%, #4B5ED4 100%)' : '#0F0F1C',
              color: canStart ? '#FFFFFF' : '#2E2E46',
              border: canStart ? 'none' : '1.5px solid #1C1C2E',
              cursor: canStart ? 'pointer' : 'not-allowed',
              boxShadow: canStart ? '0 4px 24px rgba(45,63,168,0.45)' : 'none',
            }}
            onMouseEnter={(e) => { if (canStart) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
          >
            Start Session
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t px-6 py-8 text-center"
        style={{ background: '#0B0B14', borderColor: '#181828' }}
      >
        <div className="max-w-2xl mx-auto">
          <p className="text-xs mb-3" style={{ color: '#3A3A54' }}>
            Built on the foundations of Peer-Assisted Learning (PAL) and Cooperative Learning research.
          </p>
          <Link
            href="/science"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors duration-150"
            style={{ color: '#5B6FE8' }}
          >
            View the Research Library
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <p className="text-xs mt-4" style={{ color: '#2A2A3A' }}>
            © {new Date().getFullYear()} Study Buddy · AI-powered peer learning
          </p>
        </div>
      </footer>
    </div>
  );
}
