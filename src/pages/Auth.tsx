import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckSquare, Square } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Auth() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<'signin' | 'register'>(params.get('tab') === 'register' ? 'register' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (tab === 'register') {
      if (!ageConfirmed) { setError('You must confirm you are at least 13 years old.'); return; }
      if (!termsAccepted) { setError('You must accept the Terms of Service and Privacy Policy.'); return; }
    }

    setLoading(true);
    if (tab === 'signin') {
      const err = await signIn(email, password);
      if (err) setError(err);
    } else {
      const err = await signUp(email, password);
      if (err) setError(err);
      else { setSuccess('Account created! Check your email to confirm your account, then sign in.'); setTab('signin'); }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1a1c20] flex flex-col">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/8 shrink-0">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm transition-colors"><ArrowLeft size={14} /> Back</button>
        <div className="ml-4">
          <Logo size={20} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">{tab === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
            <p className="text-sm text-gray-500">{tab === 'signin' ? 'Sign in to access your projects.' : 'Free forever. No credit card required.'}</p>
          </div>

          <div className="flex bg-[#22252b] rounded-lg p-1 mb-6">
            {(['signin', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-[#2d3038] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>
                {t === 'signin' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {error && <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          {success && <div className="mb-4 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#22252b] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 outline-none focus:border-teal-500/50 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full pl-9 pr-10 py-2.5 bg-[#22252b] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 outline-none focus:border-teal-500/50 transition-colors" />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {tab === 'register' && (
              <div className="space-y-3 mb-4">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <button
                    type="button"
                    onClick={() => setAgeConfirmed(a => !a)}
                    className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      ageConfirmed ? 'bg-teal-500 border-teal-500 text-black' : 'border-white/20 group-hover:border-white/40'
                    }`}
                  >
                    {ageConfirmed && <CheckSquare size={10} />}
                  </button>
                  <span className="text-xs text-gray-500 leading-relaxed">
                    I confirm that I am at least <strong className="text-gray-400">13 years old</strong> (or 16 in the EU) and understand that parental consent is required for users under 18 in certain jurisdictions.
                  </span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <button
                    type="button"
                    onClick={() => setTermsAccepted(t => !t)}
                    className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      termsAccepted ? 'bg-teal-500 border-teal-500 text-black' : 'border-white/20 group-hover:border-white/40'
                    }`}
                  >
                    {termsAccepted && <CheckSquare size={10} />}
                  </button>
                  <span className="text-xs text-gray-500 leading-relaxed">
                    I have read and agree to the{' '}
                    <Link to="/terms" target="_blank" className="text-teal-400 hover:underline">Terms of Service</Link> and{' '}
                    <Link to="/privacy" target="_blank" className="text-teal-400 hover:underline">Privacy Policy</Link>.
                  </span>
                </label>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-black font-bold rounded-lg transition-colors">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-6">
            {tab === 'signin' ? <>No account? <button className="text-teal-400 hover:text-teal-300" onClick={() => { setTab('register'); setError(''); }}>Register free</button></> :
            <>Already have one? <button className="text-teal-400 hover:text-teal-300" onClick={() => { setTab('signin'); setError(''); }}>Sign in</button></>}
          </p>
        </div>
      </div>
    </div>
  );
}
