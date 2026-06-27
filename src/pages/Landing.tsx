import { useNavigate, Link } from 'react-router-dom';
import { Layers, Cpu, Cloud, Zap, Sliders, ArrowRight, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

// 60/30/10 palette extracted from the Andio logo:
//   60% — #1c1f24  warm charcoal (base, backgrounds, surfaces)
//   30% — #3dd6ac  teal-mint    (primary brand, CTAs, nav accents)
//   10% — #e8a93d  amber-gold   (pop accent, used sparingly but deliberately)

const TEAL  = '#3dd6ac';
const AMBER = '#e8a93d';

const features = [
  {
    icon: Layers, title: 'Multi-Track Sequencer',
    desc: '8 tracks across drums, melodic, and jazz with per-track volume, mute, and solo.',
    color: 'text-[#3dd6ac]', bg: 'bg-[#3dd6ac]/10 border-[#3dd6ac]/20',
    tags: [{ label: 'React', accent: 'teal' }, { label: '8 Tracks', accent: 'teal' }],
  },
  {
    icon: Cpu, title: 'Piano Roll Editor',
    desc: 'Click to place notes, drag to resize, drag to move. Full chromatic range from C2 to E5.',
    color: 'text-[#3dd6ac]', bg: 'bg-[#3dd6ac]/10 border-[#3dd6ac]/20',
    tags: [{ label: 'MIDI-style', accent: 'neutral' }, { label: 'C2–E5', accent: 'teal' }],
  },
  {
    icon: Cpu, title: 'Tone.js Audio Engine',
    desc: 'Web Audio API synthesis — kick, snare, hi-hat, piano, bass, sax and more.',
    color: 'text-[#e8a93d]', bg: 'bg-[#e8a93d]/10 border-[#e8a93d]/20',
    tags: [{ label: 'Web Audio API', accent: 'neutral' }, { label: 'Tone.js', accent: 'amber' }],
  },
  {
    icon: Cloud, title: 'Cloud Projects',
    desc: 'Every project saves to your account. Pick up where you left off.',
    color: 'text-[#3dd6ac]', bg: 'bg-[#3dd6ac]/10 border-[#3dd6ac]/20',
    tags: [{ label: 'Supabase', accent: 'neutral' }, { label: 'Auto-save', accent: 'teal' }],
  },
  {
    icon: Zap, title: 'Keyboard Shortcuts',
    desc: 'Space to play/stop, Ctrl+Z/Y for undo/redo, Delete to erase.',
    color: 'text-[#e8a93d]', bg: 'bg-[#e8a93d]/10 border-[#e8a93d]/20',
    tags: [{ label: 'Space / Ctrl+Z', accent: 'neutral' }, { label: 'Power user', accent: 'amber' }],
  },
  {
    icon: Sliders, title: 'Full Mixer Controls',
    desc: 'Per-track volume sliders, mute/solo, master volume, and loop region.',
    color: 'text-[#3dd6ac]', bg: 'bg-[#3dd6ac]/10 border-[#3dd6ac]/20',
    tags: [{ label: 'Per-track', accent: 'neutral' }, { label: 'Master vol', accent: 'teal' }],
  },
];

const steps = [
  { n: '01', title: 'Create a project', desc: 'Name it, set your BPM, and choose a loop length.' },
  { n: '02', title: 'Build your arrangement', desc: 'Place clips on the timeline, then open the piano roll to draw notes.' },
  { n: '03', title: 'Play and refine', desc: 'Hit Space to hear it back. Undo mistakes with Ctrl+Z. Save to the cloud.' },
];

const tagClass = (accent: string) => {
  if (accent === 'teal')    return 'bg-[#3dd6ac]/10 text-[#3dd6ac] border border-[#3dd6ac]/20';
  if (accent === 'amber')   return 'bg-[#e8a93d]/10 text-[#e8a93d] border border-[#e8a93d]/20';
  return 'bg-white/5 text-zinc-400 border border-white/8';
};

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => navigate(user ? '/dashboard' : '/auth');

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ backgroundColor: '#1c1f24' }}>

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <Logo size={24} className="text-lg" />
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 font-semibold rounded-lg text-sm transition-colors text-black"
              style={{ backgroundColor: TEAL }}
            >
              Dashboard <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/auth')} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
                Sign In
              </button>
              <button
                onClick={() => navigate('/auth?tab=register')}
                className="flex items-center gap-1.5 px-4 py-2 font-semibold rounded-lg text-sm transition-colors text-black"
                style={{ backgroundColor: TEAL }}
              >
                Get Started <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-16 relative overflow-hidden">
        {/* Dual-color radial glow matching the logo gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 40% 60%, rgba(61,214,172,0.07) 0%, transparent 70%), ' +
              'radial-gradient(ellipse 40% 30% at 65% 55%, rgba(232,169,61,0.05) 0%, transparent 60%)',
          }}
        />

        {/* Pill badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full mx-auto mb-6 border"
          style={{ color: TEAL, backgroundColor: 'rgba(61,214,172,0.08)', borderColor: 'rgba(61,214,172,0.2)' }}
        >
          <span className="flex h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: TEAL }} />
          Multi-track sequencer & audio workstation
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight max-w-3xl leading-tight mb-6">
          Make Music.<br />
          <span style={{ color: TEAL }}>In Your Browser.</span>
        </h1>

        <p className="text-gray-400 text-lg max-w-md mx-auto mb-10 leading-relaxed">
          A professional multi-track sequencer in your browser. Build beats, write melodies, save everything to the cloud.
        </p>

        <div className="flex items-center gap-3 mb-24">
          <button
            onClick={handleCTA}
            className="flex items-center gap-2 px-6 py-3 font-bold rounded-xl text-base transition-all text-black"
            style={{ backgroundColor: TEAL }}
          >
            <Play size={16} fill="currentColor" /> Start Creating Free
          </button>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-base transition-colors text-gray-300 hover:text-white border"
            style={{ borderColor: 'rgba(232,169,61,0.25)', color: '#c9a96e' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,169,61,0.5)'; (e.currentTarget as HTMLElement).style.color = AMBER; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,169,61,0.25)'; (e.currentTarget as HTMLElement).style.color = '#c9a96e'; }}
          >
            How it works
          </a>
        </div>

        {/* App teaser — sequencer mockup with logo-matched colors */}
        <div
          className="relative w-full max-w-4xl mx-auto mt-16 rounded-xl overflow-hidden border shadow-2xl"
          style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#161820', boxShadow: '0 32px 64px rgba(61,214,172,0.06)' }}
        >
          <svg viewBox="0 0 960 320" xmlns="http://www.w3.org/2000/svg" className="w-full opacity-90">
            {/* Header bar */}
            <rect width="960" height="40" fill="#0e1012" />
            <rect x="12" y="10" width="20" height="20" rx="4" fill={TEAL} fillOpacity="0.2" stroke={TEAL} strokeOpacity="0.4" strokeWidth="1" />
            <rect x="40" y="15" width="48" height="10" rx="3" fill="#ffffff" fillOpacity="0.08" />
            <rect x="96" y="15" width="32" height="10" rx="3" fill="#ffffff" fillOpacity="0.05" />
            <rect x="148" y="13" width="60" height="14" rx="3" fill={TEAL} fillOpacity="0.12" stroke={TEAL} strokeOpacity="0.25" strokeWidth="1" />
            <text x="156" y="23" fontSize="8" fill={TEAL} fontFamily="monospace">120 BPM</text>
            <rect x="820" y="12" width="52" height="16" rx="4" fill={TEAL} />
            <text x="832" y="23" fontSize="8" fill="#0e1012" fontFamily="monospace" fontWeight="bold">Save</text>
            {/* Amber export button — 10% accent moment */}
            <rect x="878" y="12" width="52" height="16" rx="4" fill={AMBER} fillOpacity="0.15" stroke={AMBER} strokeOpacity="0.3" strokeWidth="1" />
            <text x="889" y="23" fontSize="8" fill={AMBER} fontFamily="monospace">Export</text>

            {/* Track rows */}
            {[
              { y: 48,  label: 'KICK',  color: TEAL,  clips: [0,1,1,0,1,0,1,0,0,1,1,0,1,0,1,0] },
              { y: 88,  label: 'SNARE', color: TEAL,  clips: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0] },
              { y: 128, label: 'HI-HAT',color: AMBER, clips: [1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1] },
              { y: 168, label: 'BASS',  color: TEAL,  clips: [1,0,0,0,1,0,0,1,1,0,0,0,1,0,0,0] },
              { y: 208, label: 'PIANO', color: TEAL,  clips: [0,1,0,1,0,0,1,0,0,1,0,1,0,0,1,0] },
              { y: 248, label: 'SAX',   color: AMBER, clips: [1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0] },
            ].map(({ y, label, color, clips }) => (
              <g key={label}>
                <rect x="0" y={y} width="960" height="36" fill={y % 80 === 48 ? '#1c1f24' : '#191c21'} />
                <rect x="0" y={y} width="100" height="36" fill="#131619" />
                <text x="12" y={y + 22} fontSize="8" fill="#6b7280" fontFamily="monospace" fontWeight="bold" letterSpacing="1">{label}</text>
                <rect x="80" y={y + 10} width="14" height="16" rx="2" fill={color} fillOpacity="0.15" />
                <text x="83" y={y + 22} fontSize="7" fill={color} fontFamily="monospace">M</text>
                {clips.map((on, i) => (
                  <rect key={i}
                    x={108 + i * 52.5} y={y + 6} width={46} height={24} rx="3"
                    fill={on ? color : '#ffffff'} fillOpacity={on ? 0.72 : 0.04}
                    stroke={on ? color : '#ffffff'} strokeOpacity={on ? 0.35 : 0.06} strokeWidth="1"
                  />
                ))}
                <line x1="0" y1={y + 36} x2="960" y2={y + 36} stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />
              </g>
            ))}

            {/* Playhead — teal, matching logo */}
            <rect x="263" y="40" width="2" height="248" fill={TEAL} fillOpacity="0.65" />
            <polygon points="262,40 268,40 265,47" fill={TEAL} fillOpacity="0.9" />
          </svg>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, #1c1f24 0%, rgba(28,31,36,0.15) 40%, transparent 100%)' }}
          />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Everything You Need to Create</h2>
          <p className="text-gray-500 max-w-md mx-auto">From the first beat to the final mixdown — all in one tab.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc, color, bg, tags }) => (
            <div
              key={title}
              className="p-5 rounded-xl border transition-colors"
              style={{ backgroundColor: '#22252c', borderColor: 'rgba(255,255,255,0.07)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#272b33'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#22252c'}
            >
              <div className={`inline-flex p-2 rounded-lg border mb-3 ${bg}`}><Icon size={18} className={color} /></div>
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {tags.map(({ label, accent }) => (
                  <span key={label} className={`text-[10px] font-mono px-2 py-0.5 rounded ${tagClass(accent)}`}>{label}</span>
                ))}
              </div>
              <h3 className="font-semibold text-white mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="px-6 py-20 border-y border-white/6" style={{ backgroundColor: '#191c21' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">From Zero to Groove in Minutes</h2>
            <p className="text-gray-500">No setup. No tutorials needed. Just create.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="flex flex-col gap-3">
                <div className="text-4xl font-black" style={{ color: 'rgba(255,255,255,0.06)' }}>{n}</div>
                {/* Step rule — alternates teal / amber for visual rhythm */}
                <div
                  className="w-8 h-0.5"
                  style={{ backgroundColor: n === '02' ? AMBER : TEAL }}
                />
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-4xl font-black mb-4">Ready to make music?</h2>
          <p className="text-gray-500 mb-8">Free account. No credit card. All projects saved to the cloud.</p>
          <button
            onClick={handleCTA}
            className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl text-lg transition-all text-black"
            style={{ backgroundColor: TEAL }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = ''}
          >
            <Play size={18} fill="currentColor" /> Open Andio
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/6 px-6 py-8" style={{ backgroundColor: '#161820' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size={18} className="text-sm" />
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Built with React, Tone.js, Tailwind CSS, and Supabase.</p>
        </div>
      </footer>
    </div>
  );
}