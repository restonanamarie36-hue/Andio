import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Trash2, Clock, Layers, Loader2, AlertCircle, X, Check, FileAudio, Music, Waves, Mic2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { SavedProject, PROJECT_TEMPLATES, TemplateType } from '../types';
import { tracksFromTemplate } from '../lib/defaultProject';
import Logo from '../components/Logo';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [createError, setCreateError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: 'My New Project',
    bpm: 120,
    loopBars: 4,
    template: 'default' as TemplateType
  });

  useEffect(() => { loadProjects(); }, []);

  async function loadProjects() {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').eq('user_id', user?.id ?? '').order('updated_at', { ascending: false });
    if (error) console.error('Failed to load projects:', error);
    setProjects((data ?? []) as SavedProject[]);
    setLoading(false);
  }

  async function createProject() {
    if (!user) return;
    setCreating(true);
    const tracks = tracksFromTemplate(form.template);
    const { data, error } = await supabase.from('projects').insert({
      name: form.name.trim() || 'Untitled',
      bpm: form.bpm,
      data: { tracks, loopBars: form.loopBars },
      user_id: user.id,
    }).select('id').single();
    setCreating(false);
    if (error) { setCreateError(error.message); return; }
    if (data) navigate(`/project/${data.id}`);
  }

  async function deleteProject(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { setDeleteId(null); return; }
    setProjects(ps => ps.filter(p => p.id !== id));
    setDeleteId(null);
  }

const formatDate = (ts: string) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const templateIcons = {
    'default': Music,
    'empty': FileAudio,
    'beat': Waves,
    'synth': Sparkles,
    'vocal-demo': Mic2,
  };

  return (
    <div className="min-h-screen bg-[#1a1c20] text-white flex flex-col">
      <header className="flex items-center gap-4 px-6 py-3.5 border-b border-white/8 shrink-0">
        <button onClick={() => navigate('/')}>
          <Logo size={20} />
        </button>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:block">{user?.email}</span>
          <button onClick={signOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs transition-colors">
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Projects</h1>
            <p className="text-sm text-gray-500 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''} saved</p>
          </div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-lg text-sm transition-colors">
            <Plus size={15} /> New Project
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 size={24} className="text-gray-600 animate-spin" /></div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#22252b] border border-white/10 flex items-center justify-center mb-4"><Music size={28} className="text-gray-600" /></div>
            <h3 className="font-semibold text-white mb-1">No projects yet</h3>
            <p className="text-sm text-gray-500 mb-6">Create your first project to get started.</p>
            <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-lg text-sm transition-colors">
              <Plus size={14} /> Create Project
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <div key={project.id}
                className="group relative bg-[#22252b] border border-white/8 rounded-xl p-5 hover:border-white/20 hover:bg-[#2a2d34] transition-all cursor-pointer"
                onClick={() => navigate(`/project/${project.id}`)}>
                <div className="flex gap-0.5 mb-4">
                  {(project.data?.tracks ?? []).slice(0, 8).map((t, i) => (
                    <div key={i} className="h-1 flex-1 rounded-full" style={{ backgroundColor: t.color ?? '#334155' }} />
                  ))}
                </div>
                <h3 className="font-semibold text-white text-sm mb-2 truncate pr-6">{project.name}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Layers size={10} /> {project.data?.tracks?.length ?? 0} tracks</span>
                  <span>{project.bpm} BPM</span>
                  <span className="flex items-center gap-1 ml-auto"><Clock size={10} /> {formatDate(project.updated_at)}</span>
                </div>
                <button onClick={e => { e.stopPropagation(); setDeleteId(project.id); }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#22252b] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="font-semibold text-white">New Project</h2>
              <button onClick={() => setShowNew(false)} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Project Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#1a1c20] border border-white/10 rounded-lg text-white text-sm outline-none focus:border-teal-500/50 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">BPM</label>
                  <input type="number" value={form.bpm} min={40} max={240} onChange={e => setForm(f => ({ ...f, bpm: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 bg-[#1a1c20] border border-white/10 rounded-lg text-white text-sm outline-none focus:border-teal-500/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Loop Length</label>
                  <select value={form.loopBars} onChange={e => setForm(f => ({ ...f, loopBars: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 bg-[#1a1c20] border border-white/10 rounded-lg text-white text-sm outline-none focus:border-teal-500/50 transition-colors">
                    <option value={1}>1 bar</option><option value={2}>2 bars</option><option value={4}>4 bars</option><option value={8}>8 bars</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-medium">Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PROJECT_TEMPLATES.map(template => {
                    const Icon = templateIcons[template.id];
                    const isSelected = form.template === template.id;
                    return (
                      <button key={template.id}
                        onClick={() => setForm(f => ({ ...f, template: template.id }))}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
                          isSelected ? 'border-teal-500/50 bg-teal-500/10' : 'border-white/10 bg-white/5 hover:bg-white/8'
                        }`}>
                        <div className={`mt-0.5 ${isSelected ? 'text-teal-400' : 'text-gray-500'}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isSelected ? 'text-teal-400' : 'text-white'}`}>
                              {template.name}
                            </span>
                            {isSelected && <Check size={12} className="text-teal-400" />}
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {createError && <p className="px-6 pb-2 text-xs text-red-400">{createError}</p>}
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={createProject} disabled={creating}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-lg text-sm transition-colors disabled:opacity-60">
                {creating && <Loader2 size={13} className="animate-spin" />} Create & Open
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#22252b] border border-white/10 rounded-xl shadow-2xl w-full max-w-xs p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4"><AlertCircle size={20} className="text-red-400" /></div>
            <h3 className="font-semibold text-white mb-1">Delete project?</h3>
            <p className="text-sm text-gray-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={() => deleteProject(deleteId)} className="flex-1 py-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-sm text-white font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
