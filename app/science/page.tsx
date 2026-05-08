'use client';

import Link from 'next/link';
import { BookOpen, ArrowLeft, Users, Brain, TrendingUp, Globe, FlaskConical, CircleCheck as CheckCircle } from 'lucide-react';

const CATEGORIES = [
  {
    icon: Brain,
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.15)',
    title: 'The Protégé Effect',
    subtitle: 'Why teaching others makes you learn faster',
    body: [
      'When you explain a concept to a peer, your brain is forced to retrieve, organize, and restructure information — a process that dramatically deepens retention.',
      'Research consistently shows that students who teach material to others not only remember it better, but also identify gaps in their own understanding that passive study misses entirely.',
      'This is the foundation of Study Buddy: every session is designed to put you in the role of explainer, not just receiver.',
    ],
    badge: 'Protégé Effect',
  },
  {
    icon: Users,
    color: '#10B981',
    glow: 'rgba(16,185,129,0.15)',
    title: 'The Power of Groups',
    subtitle: 'Why 3–5 people outperform individuals',
    body: [
      'Landmark meta-analyses by Johnson & Johnson (covering 900+ studies) found that cooperative learning produces significantly higher achievement than competitive or individualistic approaches.',
      'Groups of 3 to 5 people consistently outperform even the highest-performing individual on complex cognitive tasks — not because of averaging, but because diverse perspectives catch blind spots.',
      'The sweet spot is 3–5: small enough for accountability, large enough for intellectual diversity.',
    ],
    badge: 'Cooperative Learning',
  },
  {
    icon: TrendingUp,
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.15)',
    title: 'Modern Validation',
    subtitle: '2022–2023 meta-analyses confirm the effect',
    body: [
      'A 2022 meta-analysis in clinical education found peer-led learning groups significantly outperformed traditional instruction in both knowledge retention and application.',
      'A 2023 study across higher education institutions found collaborative learning added an average of 5 months of additional academic progress over the course of a year.',
      "These aren't old findings — the evidence base is growing stronger as peer learning becomes more rigorously studied.",
    ],
    badge: 'Modern Research',
  },
  {
    icon: Globe,
    color: '#0EA5E9',
    glow: 'rgba(14,165,233,0.15)',
    title: 'The Global Standard',
    subtitle: 'Decades of evidence from around the world',
    body: [
      "Keith Topping's comprehensive work on Peer-Assisted Learning (PAL) established a global evidence base showing peer tutoring works across age groups, subjects, and cultures.",
      'The Arco-Tirado (2020) case study demonstrated real-world implementation success in university settings, showing a 69% success rate advantage for students in structured peer programs.',
      'Engineering students in peer-led groups earned nearly a full letter grade higher than those studying alone — one of the most striking findings in educational research.',
    ],
    badge: 'Global Evidence',
  },
];

const BEST_PRACTICES = [
  { title: 'The Sweet Spot', body: 'Groups work best when they are between 3 and 5 people. Too small and you lose diverse perspectives; too large and accountability breaks down.' },
  { title: 'Structure Matters', body: "The most effective groups have clear goals and diverse perspectives. Don't just chat — collaborate around specific problems or concepts." },
  { title: 'Teach, Don\'t Tell', body: 'The highest-value activity is explaining concepts to each other, not passively sharing notes. Force yourself to articulate ideas in your own words.' },
  { title: 'Embrace Friction', body: "Groups that challenge each other — including respectful disagreement — learn more than groups that simply affirm. The devil's advocate role is valuable." },
];

const STAT_CARDS = [
  { value: '0.5+', label: 'Effect Size', detail: 'Standardized effect size for peer tutoring on academic achievement (Topping, 2005)' },
  { value: '+5mo', label: 'Extra Progress', detail: 'Average months of additional academic progress from collaborative learning (Education Endowment Foundation)' },
  { value: '69%', label: 'Success Rate', detail: 'Higher GPA success rate for students in structured peer programs (Arco-Tirado, 2020)' },
  { value: '900+', label: 'Studies', detail: "Number of studies covered in Johnson & Johnson's foundational meta-analysis on cooperative learning" },
];

export default function SciencePage() {
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
          href="/"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150"
          style={{ color: '#5B6FE8', border: '1px solid #1E2240', background: '#0D0D1A' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to App
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-4 pt-16 pb-12">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: '#0D1020', border: '1px solid #1E2440', color: '#5B6FE8' }}
        >
          <FlaskConical className="w-3 h-3" />
          The Science of Learning
        </div>
        <h1
          className="text-4xl sm:text-5xl font-bold leading-tight mb-4 max-w-2xl"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            background: 'linear-gradient(160deg, #E8E8F8 0%, #9090C0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-1px',
          }}
        >
          Why Peer Learning Works
        </h1>
        <p className="text-base max-w-xl leading-relaxed" style={{ color: '#5A5A7A' }}>
          Study Buddy isn't built on intuition. It's built on decades of research showing
          that explaining ideas to peers is one of the most powerful learning strategies ever studied.
        </p>
      </section>

      {/* Stat Cards */}
      <section className="px-4 pb-16 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16">
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col p-4 rounded-2xl"
              style={{ background: '#0D0D1A', border: '1px solid #1C1C2E' }}
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
              <span className="text-xs font-semibold mb-2" style={{ color: '#C0C0D8' }}>{s.label}</span>
              <span className="text-xs leading-snug" style={{ color: '#3A3A54' }}>{s.detail}</span>
            </div>
          ))}
        </div>

        {/* Research Categories */}
        <div className="space-y-6 mb-16">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                className="rounded-2xl p-6 sm:p-8"
                style={{ background: '#0D0D1A', border: '1px solid #1C1C2E' }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: cat.glow, border: `1px solid ${cat.color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="font-semibold text-base" style={{ color: '#C8C8DC' }}>{cat.title}</h2>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: cat.glow, color: cat.color, border: `1px solid ${cat.color}30` }}
                      >
                        {cat.badge}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: '#4A4A64' }}>{cat.subtitle}</p>
                  </div>
                </div>
                <div className="space-y-3 pl-14">
                  {cat.body.map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed" style={{ color: '#5A5A7A' }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Best Practices */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#3A3A54' }}>
              Implementation Tips
            </p>
            <h2
              className="text-2xl font-bold"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                background: 'linear-gradient(135deg, #E0E0EE 0%, #7878A0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              How to Learn Better
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BEST_PRACTICES.map((bp) => (
              <div
                key={bp.title}
                className="flex gap-3 p-5 rounded-2xl"
                style={{ background: '#0D0D1A', border: '1px solid #1C1C2E' }}
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#10B981' }} />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#C8C8DC' }}>{bp.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#4A4A64' }}>{bp.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Research Library */}
        <div
          className="rounded-2xl p-6 sm:p-8 mb-12"
          style={{
            background: 'linear-gradient(135deg, #0D1020, #0A0D1A)',
            border: '1px solid #1E2440',
            borderLeft: '3px solid #3B82F6',
          }}
        >
          <h3 className="font-semibold text-sm mb-4" style={{ color: '#C8C8DC' }}>Research Library</h3>
          <p className="text-xs leading-relaxed mb-4" style={{ color: '#4A4A64' }}>
            Study Buddy is built on the foundations of Peer-Assisted Learning (PAL) and Cooperative Learning.
            The following works form the academic backbone of this platform:
          </p>
          <ul className="space-y-2">
            {[
              'Johnson, D. W., & Johnson, R. T. — Cooperative Learning meta-analysis (900+ studies)',
              'Topping, K. J. — Peer-Assisted Learning: A Practical Guide for Teachers (2005)',
              'Arco-Tirado, J. L. et al. — Peer tutoring program outcomes in higher education (2020)',
              'Education Endowment Foundation — Collaborative Learning Toolkit (+5 months finding)',
              '2022 Clinical Education Meta-Analysis — Peer learning in medical & professional training',
              '2023 Higher Education Meta-Analysis — Collaborative learning in university settings',
            ].map((ref) => (
              <li key={ref} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: '#3B82F6' }} />
                <span className="text-xs" style={{ color: '#3A3A54' }}>{ref}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: '#5A5A7A' }}>
            Ready to put the science to work?
          </p>
          <Link
            href="/#start"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #2D3FA8 0%, #4B5ED4 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 24px rgba(45,63,168,0.45)',
            }}
          >
            Start a Session
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t px-6 py-6 text-center mt-auto"
        style={{ background: '#0B0B14', borderColor: '#181828' }}
      >
        <p className="text-xs" style={{ color: '#2A2A3A' }}>
          © {new Date().getFullYear()} Study Buddy · Built on peer learning science
        </p>
      </footer>
    </div>
  );
}

