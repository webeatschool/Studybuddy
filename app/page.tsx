'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowRight, Brain, Users, TrendingUp, Star, ChevronRight, FlaskConical, History, LogOut, LogIn, Flame, Clock, MessageSquare, FileText, Mic, AlignLeft, Upload, X, CircleCheck as CheckCircle, Loader as Loader2, CircleAlert as AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth';
import { BoltDatabase } from '@/lib/supabase';
import { AuthModal } from '@/components/AuthModal';

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
  {
    id: 'morgan',
    emoji: '🩺',
    name: 'Dr. Morgan',
    tagline: 'The Clinical Reasoner',
    description: 'Thinks like an attending. Runs case-based scenarios and forces clinical application over memorization.',
    color: '#E11D48',
    glowColor: 'rgba(225,29,72,0.4)',
    borderActive: 'rgba(225,29,72,0.75)',
  },
] as const;

const EXAM_TAGS = [
  'NCLEX-RN',
  'NCLEX-PN',
  'NPTE-PTA',
  'NBCOT-OTA',
  'CNA Exam',
  'CPC Coding',
  'Other',
] as const;

const BOARDS = [
  { name: 'NCLEX', sub: 'Nursing Licensure' },
  { name: 'NPTE', sub: 'Physical Therapy' },
  { name: 'NBCOT', sub: 'Occupational Therapy' },
  { name: 'CPC', sub: 'Medical Coding' },
  { name: 'CNA', sub: 'Nursing Assistant' },
  { name: 'HESI', sub: 'Nursing Entrance' },
  { name: 'ATI', sub: 'Nursing Assessments' },
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
    body: 'Groups of 3–5 consistently outperform even the best individuals on complex problems. Collaborative learning isn\'t just social — it\'s a competitive advantage.',
  },
  {
    icon: TrendingUp,
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.15)',
    title: 'Proven Results',
    body: 'Studies in STEM and Engineering show that students in peer-led groups can earn nearly a full letter grade higher than those studying alone.',
  },
];

interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  totalMessages: number;
  streak: number;
}

function computeStreak(sessions: { started_at: string }[]): number {
  if (sessions.length === 0) return 0;
  const days = Array.from(
    new Set(sessions.map((s) => new Date(s.started_at).toLocaleDateString('en-CA')))
  ).sort((a, b) => b.localeCompare(a));

  const today = new Date().toLocaleDateString('en-CA');
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');

  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

type InputTab = 'paste' | 'document' | 'audio';

export default function SetupPage() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [inputTab, setInputTab] = useState<InputTab>('paste');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const docInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const canStart = selectedPersona !== null && topic.trim().length > 0;

  const clearUpload = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
    setUploadError('');
    setNotes('');
    if (docInputRef.current) docInputRef.current.value = '';
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const handleTabChange = (tab: InputTab) => {
    setInputTab(tab);
    clearUpload();
  };

  const handleDocumentUpload = async (file: File) => {
    setUploadedFile(file);
    setUploadStatus('processing');
    setUploadError('');
    try {
      const text = await extractDocumentText(file);
      setNotes(text);
      setUploadStatus('done');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to read document');
      setUploadStatus('error');
    }
  };

  const handleAudioUpload = async (file: File) => {
    setUploadedFile(file);
    setUploadStatus('processing');
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('audio', file);
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Transcription failed');
      }
      const { transcript } = await res.json();
      setNotes(transcript);
      setUploadStatus('done');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Transcription failed');
      setUploadStatus('error');
    }
  };

  useEffect(() => {
    if (!user) { setUserStats(null); return; }
    (async () => {
      const { data } = await BoltDatabase
        .from('study_sessions')
        .select('started_at, duration_seconds, message_count')
        .not('ended_at', 'is', null)
        .order('started_at', { ascending: false });
      if (!data) return;
      const totalSessions = data.length;
      const totalMinutes = Math.round(data.reduce((s, r) => s + (r.duration_seconds ?? 0), 0) / 60);
      const totalMessages = data.reduce((s, r) => s + (r.message_count ?? 0), 0);
      const streak = computeStreak(data);
      setUserStats({ totalSessions, totalMinutes, totalMessages, streak });
    })();
  }, [user]);

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
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultMode={authMode} />}

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
        <div className="flex items-center gap-1.5">
          <Link
            href="/science"
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all duration-150"
            style={{ color: '#5B6FE8', border: '1px solid #1E2240', background: '#0D0D1A' }}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">The Science</span>
          </Link>
          {user ? (
            <>
              <Link
                href="/history"
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all duration-150"
                style={{ color: '#8888A8', border: '1px solid #1C1C2E', background: '#0D0D1A' }}
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">History</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all duration-150"
                style={{ color: '#4A4A64', border: '1px solid #1C1C2E', background: '#0D0D1A' }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => { setAuthMode('signin'); setShowAuth(true); }}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all duration-150"
              style={{ color: '#8888A8', border: '1px solid #1C1C2E', background: '#0D0D1A' }}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* User Dashboard Strip */}
      {user && userStats && userStats.totalSessions > 0 && (
        <div
          className="border-b px-4 py-4"
          style={{ background: '#080810', borderColor: '#141422' }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#2E2E48' }}>
                Your Progress
              </p>
              <Link
                href="/history"
                className="text-xs font-medium flex items-center gap-1"
                style={{ color: '#3B4FA8' }}
              >
                View all
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <DashStat
                icon={<Flame className="w-4 h-4" />}
                iconBg="rgba(245,158,11,0.12)"
                iconColor="#F59E0B"
                value={userStats.streak > 0 ? `${userStats.streak}d` : '—'}
                label="Streak"
                highlight={userStats.streak >= 3}
              />
              <DashStat
                icon={<BookOpen className="w-4 h-4" />}
                iconBg="rgba(91,111,232,0.12)"
                iconColor="#5B6FE8"
                value={String(userStats.totalSessions)}
                label="Sessions"
              />
              <DashStat
                icon={<Clock className="w-4 h-4" />}
                iconBg="rgba(16,185,129,0.12)"
                iconColor="#10B981"
                value={userStats.totalMinutes >= 60
                  ? `${Math.floor(userStats.totalMinutes / 60)}h ${userStats.totalMinutes % 60}m`
                  : `${userStats.totalMinutes}m`}
                label="Study time"
              />
              <DashStat
                icon={<MessageSquare className="w-4 h-4" />}
                iconBg="rgba(59,130,246,0.12)"
                iconColor="#3B82F6"
                value={String(userStats.totalMessages)}
                label="Exchanges"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-4 pt-12 sm:pt-20 pb-12 sm:pb-16">
        {!user && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ background: '#0D1020', border: '1px solid #1E2440', color: '#5B6FE8' }}
          >
            <Star className="w-3 h-3" />
            Science-backed peer learning for healthcare students
          </div>
        )}

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
          {user ? 'Ready to Study?' : 'Pass Your Clinical Boards. The First Time.'}
        </h1>
        <p className="text-base sm:text-lg max-w-xl leading-relaxed mb-4" style={{ color: '#5A5A7A' }}>
          {user
            ? 'Pick a partner, enter your topic, and dive in.'
            : 'AI-powered peer studying for nursing, PTA, OTA, and allied health students — not a tutor, a partner. Built by a clinician who\'s been there.'}
        </p>
        {!user && (
          <p className="text-sm max-w-md leading-relaxed mb-8 italic" style={{ color: '#3A3A54' }}>
            Created by Dr. Chris Rocchio, DC — practicing chiropractic physician with 10 years of clinical experience
          </p>
        )}

        {!user && (
          <div className="flex flex-wrap justify-center gap-4 mb-10">
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
        )}

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
          {user ? 'Start a Session' : 'Start Studying Free'}
          <ArrowRight className="w-4 h-4" />
        </a>
      </section>

      {/* Why It Works + Boards — guests only */}
      {!user && (
        <>
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

        <section className="px-4 pb-16 max-w-4xl mx-auto w-full">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#3A3A54' }}>
              Coverage
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
              Built for the boards that matter
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BOARDS.map((b) => (
              <div
                key={b.name}
                className="rounded-2xl px-5 py-4 flex flex-col gap-1"
                style={{ background: '#0D0D1A', border: '1px solid #1C1C2E' }}
              >
                <span
                  className="text-base font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #6B8CFF, #A0B4FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {b.name}
                </span>
                <span className="text-xs" style={{ color: '#3A3A54' }}>{b.sub}</span>
              </div>
            ))}
          </div>
        </section>
        </>
      )}

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

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3A3A54' }}>
              Quick-select your exam
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAM_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTopic(tag === 'Other' ? '' : tag)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                  style={{
                    background: topic === tag ? 'rgba(91,111,232,0.15)' : '#0D0D1A',
                    border: `1px solid ${topic === tag ? 'rgba(91,111,232,0.5)' : '#1C1C2E'}`,
                    color: topic === tag ? '#A0B0FF' : '#4A4A64',
                  }}
                  onMouseEnter={(e) => {
                    if (topic !== tag) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#33335A';
                      (e.currentTarget as HTMLButtonElement).style.color = '#8888A8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (topic !== tag) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#1C1C2E';
                      (e.currentTarget as HTMLButtonElement).style.color = '#4A4A64';
                    }
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3A3A54' }}>
            Who do you want to study with?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
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
              placeholder="e.g. Cardiac dysrhythmias, Gait deviations, ADL interventions, ICD-10 coding..."
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3A3A54' }}>
                Study Material{' '}
                <span className="normal-case font-normal" style={{ color: '#2A2A40' }}>(optional)</span>
              </label>
            </div>

            <div
              className="flex rounded-xl p-1 gap-1"
              style={{ background: '#080810', border: '1px solid #141422' }}
            >
              {([
                { id: 'paste' as InputTab, icon: AlignLeft, label: 'Paste Text' },
                { id: 'document' as InputTab, icon: FileText, label: 'Document' },
                { id: 'audio' as InputTab, icon: Mic, label: 'Audio' },
              ] as { id: InputTab; icon: React.ComponentType<{ className?: string }>; label: string }[]).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-150"
                  style={{
                    background: inputTab === id ? '#0D0D1A' : 'transparent',
                    color: inputTab === id ? '#C8C8DC' : '#3A3A54',
                    border: inputTab === id ? '1px solid #1C1C2E' : '1px solid transparent',
                    boxShadow: inputTab === id ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {inputTab === 'paste' && (
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
            )}

            {inputTab === 'document' && (
              <div>
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".txt,.md,.pdf,.doc,.docx,.rtf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDocumentUpload(file);
                  }}
                />
                {uploadStatus === 'idle' && (
                  <button
                    onClick={() => docInputRef.current?.click()}
                    className="w-full rounded-xl flex flex-col items-center justify-center gap-3 py-10 transition-all duration-150 group"
                    style={{ background: '#0D0D1A', border: '1.5px dashed #1C1C2E' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#33335A'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1C1C2E'; }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(91,111,232,0.1)', border: '1px solid rgba(91,111,232,0.2)' }}
                    >
                      <Upload className="w-5 h-5" style={{ color: '#5B6FE8' }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium mb-1" style={{ color: '#C8C8DC' }}>Upload a document</p>
                      <p className="text-xs" style={{ color: '#3A3A54' }}>TXT, MD, PDF, DOC, DOCX, RTF</p>
                    </div>
                  </button>
                )}
                {uploadStatus === 'processing' && <UploadProgress label={uploadedFile?.name ?? ''} message="Extracting text…" />}
                {uploadStatus === 'done' && (
                  <UploadSuccess
                    label={uploadedFile?.name ?? ''}
                    preview={notes}
                    onClear={clearUpload}
                  />
                )}
                {uploadStatus === 'error' && (
                  <UploadError message={uploadError} onClear={clearUpload} />
                )}
              </div>
            )}

            {inputTab === 'audio' && (
              <div>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept=".mp3,.mp4,.wav,.m4a,.ogg,.webm,.flac"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAudioUpload(file);
                  }}
                />
                {uploadStatus === 'idle' && (
                  <button
                    onClick={() => audioInputRef.current?.click()}
                    className="w-full rounded-xl flex flex-col items-center justify-center gap-3 py-10 transition-all duration-150"
                    style={{ background: '#0D0D1A', border: '1.5px dashed #1C1C2E' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#33335A'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1C1C2E'; }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                    >
                      <Mic className="w-5 h-5" style={{ color: '#10B981' }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium mb-1" style={{ color: '#C8C8DC' }}>Upload an audio file</p>
                      <p className="text-xs" style={{ color: '#3A3A54' }}>MP3, MP4, WAV, M4A, OGG, WEBM, FLAC</p>
                      <p className="text-xs mt-1" style={{ color: '#2A2A40' }}>Your audio will be transcribed automatically</p>
                    </div>
                  </button>
                )}
                {uploadStatus === 'processing' && <UploadProgress label={uploadedFile?.name ?? ''} message="Transcribing audio…" />}
                {uploadStatus === 'done' && (
                  <UploadSuccess
                    label={uploadedFile?.name ?? ''}
                    preview={notes}
                    onClear={clearUpload}
                  />
                )}
                {uploadStatus === 'error' && (
                  <UploadError message={uploadError} onClear={clearUpload} />
                )}
              </div>
            )}
          </div>

          {!user && (
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
              style={{ background: '#0D0D1A', border: '1px solid #1C1C2E' }}
            >
              <p className="text-xs" style={{ color: '#3E3E58' }}>
                Sign up free to save sessions and track your progress.
              </p>
              <button
                onClick={() => { setAuthMode('signup'); setShowAuth(true); }}
                className="text-xs font-medium ml-3 flex-shrink-0"
                style={{ color: '#5B6FE8' }}
              >
                Create account
              </button>
            </div>
          )}

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
            © 2026 Study Buddy · Built by clinicians, for clinicians in training
          </p>
        </div>
      </footer>
    </div>
  );
}

async function extractDocumentText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (['txt', 'md', 'rtf'].includes(ext)) {
    return file.text();
  }
  if (['pdf', 'doc', 'docx'].includes(ext)) {
    const formData = new FormData();
    formData.append('document', file);
    const res = await fetch('/api/extract-text', { method: 'POST', body: formData });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || 'Failed to extract text from document');
    }
    const { text } = await res.json();
    return text;
  }
  throw new Error('Unsupported file type');
}

function UploadProgress({ label, message }: { label: string; message: string }) {
  return (
    <div
      className="w-full rounded-xl flex items-center gap-4 px-5 py-5"
      style={{ background: '#0D0D1A', border: '1.5px solid #1C1C2E' }}
    >
      <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" style={{ color: '#5B6FE8' }} />
      <div className="min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: '#C8C8DC' }}>{label}</p>
        <p className="text-xs" style={{ color: '#3A3A54' }}>{message}</p>
      </div>
    </div>
  );
}

function UploadSuccess({ label, preview, onClear }: { label: string; preview: string; onClear: () => void }) {
  return (
    <div
      className="w-full rounded-xl overflow-hidden"
      style={{ background: '#0D0D1A', border: '1.5px solid rgba(16,185,129,0.3)' }}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1C1C2E' }}>
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#10B981' }} />
          <span className="text-sm font-medium truncate" style={{ color: '#C8C8DC' }}>{label}</span>
        </div>
        <button onClick={onClear} className="flex-shrink-0 ml-2 p-1 rounded" style={{ color: '#3A3A54' }}>
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-4 py-3 max-h-32 overflow-y-auto">
        <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: '#4A4A64' }}>
          {preview.slice(0, 600)}{preview.length > 600 ? '…' : ''}
        </p>
      </div>
      <div className="px-4 py-2" style={{ borderTop: '1px solid #141422' }}>
        <p className="text-xs" style={{ color: '#2A2A40' }}>{preview.length.toLocaleString()} characters extracted</p>
      </div>
    </div>
  );
}

function UploadError({ message, onClear }: { message: string; onClear: () => void }) {
  return (
    <div
      className="w-full rounded-xl flex items-start gap-3 px-5 py-4"
      style={{ background: '#0D0D1A', border: '1.5px solid rgba(239,68,68,0.3)' }}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium mb-0.5" style={{ color: '#C8C8DC' }}>Upload failed</p>
        <p className="text-xs" style={{ color: '#4A4A64' }}>{message}</p>
      </div>
      <button onClick={onClear} className="flex-shrink-0 p-1 rounded" style={{ color: '#3A3A54' }}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function DashStat({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  highlight = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{
        background: highlight ? 'rgba(245,158,11,0.06)' : '#0D0D1A',
        border: `1px solid ${highlight ? 'rgba(245,158,11,0.2)' : '#1C1C2E'}`,
      }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-none mb-0.5" style={{ color: highlight ? '#F59E0B' : '#C8C8DC' }}>
          {value}
        </p>
        <p className="text-xs" style={{ color: '#3E3E58' }}>{label}</p>
      </div>
    </div>
  );
}
