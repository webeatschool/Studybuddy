'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Send, X, Clock } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Session {
  personaId: string;
  topic: string;
  studyNotes: string;
}

const PERSONA_META: Record<string, { name: string; emoji: string; color: string }> = {
  alex: { name: 'Alex', emoji: '🧠', color: '#3B82F6' },
  maya: { name: 'Maya', emoji: '✨', color: '#F59E0B' },
  jordan: { name: 'Jordan', emoji: '🔍', color: '#10B981' },
};

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ChatPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [openingSent, setOpeningSent] = useState(false);

  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('studySession');
    if (!raw) { router.push('/'); return; }
    try { setSession(JSON.parse(raw)); } catch { router.push('/'); }
  }, [router]);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
  }, [input]);

  const callAPI = useCallback(async (msgs: Message[], sess: Session, isOpening = false) => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgs,
          personaId: sess.personaId,
          topic: sess.topic,
          studyNotes: sess.studyNotes,
          isOpening,
        }),
      });
      const data = await res.json();
      if (data.text) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.error ?? "Something went wrong. Let's try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Something went wrong on my end. Let's try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session || openingSent) return;
    setOpeningSent(true);
    callAPI([], session, true);
  }, [session, openingSent, callAPI]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading || !session) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    await callAPI(updated, session);
  }, [input, loading, messages, session, callAPI]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endSession = () => {
    localStorage.removeItem('studySession');
    if (timerRef.current) clearInterval(timerRef.current);
    router.push('/');
  };

  if (!session) return null;

  const persona = PERSONA_META[session.personaId] ?? { name: '?', emoji: '?', color: '#6B8CFF' };
  const canSend = input.trim().length > 0 && !loading;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0A0A0F' }}>
      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b"
        style={{ background: '#0B0B14', borderColor: '#181828' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg"
            style={{
              background: '#111120',
              border: `1.5px solid ${persona.color}33`,
              boxShadow: `0 0 12px ${persona.color}22`,
            }}
          >
            {persona.emoji}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight" style={{ color: persona.color }}>
              {persona.name}
            </p>
            <p
              className="text-xs truncate leading-tight max-w-[160px] sm:max-w-xs"
              style={{ color: '#3E3E58' }}
              title={session.topic}
            >
              {session.topic}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium"
            style={{ background: '#0F0F1C', color: '#4A4A66', border: '1px solid #1C1C2E' }}
          >
            <Clock className="w-3 h-3" />
            {formatTime(elapsed)}
          </div>
          <button
            onClick={endSession}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 focus:outline-none"
            style={{ background: '#1C0F0F', color: '#D44444', border: '1px solid #3A1818' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2A1212'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1C0F0F'; }}
          >
            <X className="w-3 h-3" />
            End Session
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {msg.role === 'assistant' && (
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm mb-0.5"
                  style={{
                    background: '#111120',
                    border: `1.5px solid ${persona.color}33`,
                  }}
                >
                  {persona.emoji}
                </div>
              )}
              <div
                className="max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={
                  msg.role === 'assistant'
                    ? {
                        background: '#111120',
                        color: '#CECEE0',
                        border: '1px solid #1E1E32',
                        borderBottomLeftRadius: '4px',
                      }
                    : {
                        background: '#141830',
                        color: '#D0D4F0',
                        border: '1px solid #222846',
                        borderBottomRightRadius: '4px',
                      }
                }
              >
                {msg.content.split('\n').map((line, j, arr) => (
                  <span key={j}>
                    {line}
                    {j < arr.length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-end gap-2.5">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm"
                style={{ background: '#111120', border: `1.5px solid ${persona.color}33` }}
              >
                {persona.emoji}
              </div>
              <div
                className="rounded-2xl px-4 py-3"
                style={{
                  background: '#111120',
                  border: '1px solid #1E1E32',
                  borderBottomLeftRadius: '4px',
                }}
              >
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="block w-1.5 h-1.5 rounded-full"
                      style={{
                        background: '#3A3A58',
                        animation: `studyDot 1.3s ease-in-out ${i * 0.22}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div
        className="flex-shrink-0 border-t px-4 py-3"
        style={{ background: '#0B0B14', borderColor: '#181828' }}
      >
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Message… (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none transition-all duration-150 leading-relaxed"
            style={{
              background: '#0D0D1A',
              border: '1.5px solid #1C1C2E',
              color: '#D0D0E8',
              caretColor: '#5B6FE8',
              maxHeight: '160px',
              overflowY: 'auto',
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
          <button
            onClick={sendMessage}
            disabled={!canSend}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 focus:outline-none"
            style={{
              background: canSend ? 'linear-gradient(135deg, #2D3FA8, #4B5ED4)' : '#0F0F1C',
              color: canSend ? '#FFFFFF' : '#2A2A42',
              border: canSend ? 'none' : '1.5px solid #1C1C2E',
              cursor: canSend ? 'pointer' : 'not-allowed',
              boxShadow: canSend ? '0 2px 14px rgba(45,63,168,0.45)' : 'none',
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
