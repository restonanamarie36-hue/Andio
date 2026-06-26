import { useNavigate, Link } from 'react-router-dom';
import { Layers, Cpu, Cloud, Zap, Sliders, ArrowRight, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const features = [
  { icon: Layers, title: 'Multi-Track Sequencer', desc: '8 tracks across drums, melodic, and jazz with per-track volume, mute, and solo.', color: 'text-teal-400', bg: 'bg-teal-400/10 border-teal-400/20' },
  { icon: Cpu, title: 'Piano Roll Editor', desc: 'Click to place notes, drag to resize, drag to move. Full chromatic range from C2 to E5.', color: 'text-teal-400', bg: 'bg-teal-400/10 border-teal-400/20' },
  { icon: Cpu, title: 'Tone.js Audio Engine', desc: 'Web Audio API synthesis — kick, snare, hi-hat, piano, bass, sax and more.', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  { icon: Cloud, title: 'Cloud Projects', desc: 'Every project saves to your account. Pick up where you left off.', color: 'text-teal-400', bg: 'bg-teal-400/10 border-teal-400/20' },
  { icon: Zap, title: 'Keyboard Shortcuts', desc: 'Space to play/stop, Ctrl+Z/Y for undo/redo, Delete to erase.', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  { icon: Sliders, title: 'Full Mixer Controls', desc: 'Per-track volume sliders, mute/solo, master volume, and loop region.', color: 'text-teal-400', bg: 'bg-teal-400/10 border-teal-400/20' },
];

const steps = [
  { n: '01', title: 'Create a project', desc: 'Name it, set your BPM, and choose a loop length.' },
  { n: '02', title: 'Build your arrangement', desc: 'Place clips on the timeline, then open the piano roll to draw notes.' },
  { n: '03', title: 'Play and refine', desc: 'Hit Space to hear it back. Undo mistakes with Ctrl+Z. Save to the cloud.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => navigate(user ? '/dashboard' : '/auth');

  return (
    <div className="min-h-screen bg-[#1a1c20] text-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <Logo size={24} className="text-lg" />
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-lg text-sm transition-colors">
              Dashboard <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/auth')} className="px-4 py-2 text-gray-300 hover:text-white text-sm transition-colors">Sign In</button>
              <button onClick={() => navigate('/auth?tab=register')} className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-lg text-sm transition-colors">
                Get Started <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </nav>

      <section className="flex flex-col items-center text-center px-6 pt-20 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-teal-500/8 via-transparent to-transparent pointer-events-none" />
        <h1 className="text-5xl md:text-7xl font-black tracking-tight max-w-3xl leading-tight mb-6">
          Make Music.<br /><span className="text-teal-400">In Your Browser.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed">
          Andio is a professional multi-track sequencer powered by the Web Audio API. Build beats, write melodies, and save your projects.
        </p>
        <div className="flex items-center gap-3 mb-16">
          <button onClick={handleCTA} className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl text-base transition-all">
            <Play size={16} fill="currentColor" /> Start Creating Free
          </button>
          <a href="#how-it-works" className="flex items-center gap-2 px-6 py-3 border border-white/15 hover:border-white/30 text-gray-300 hover:text-white rounded-xl text-base transition-colors">
            How it works
          </a>
        </div>
      </section>

      <section className="px-6 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Everything You Need to Create</h2>
          <p className="text-gray-500 max-w-md mx-auto">From the first beat to the final mixdown — all in one tab.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="p-5 rounded-xl border bg-[#22252b] hover:bg-[#2a2d34] transition-colors">
              <div className={`inline-flex p-2 rounded-lg border mb-4 ${bg}`}><Icon size={18} className={color} /></div>
              <h3 className="font-semibold text-white mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-20 bg-[#16181c] border-y border-white/8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">From Zero to Groove in Minutes</h2>
            <p className="text-gray-500">No setup. No tutorials needed. Just create.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="flex flex-col gap-3">
                <div className="text-4xl font-black text-white/8">{n}</div>
                <div className="w-8 h-0.5 bg-teal-400" />
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-4xl font-black mb-4">Ready to make music?</h2>
          <p className="text-gray-500 mb-8">Free account. No credit card. All projects saved to the cloud.</p>
          <button onClick={handleCTA} className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl text-lg transition-all">
            <Play size={18} fill="currentColor" /> Open Andio
          </button>
        </div>
      </section>

      <footer className="border-t border-white/8 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size={18} className="text-sm" />
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
          <p className="text-xs text-gray-600">Built with React, Tone.js, Tailwind CSS, and Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
