import { useState } from 'react';
import { Shield, Lock, Eye, Trash2, Cookie, Globe, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const LAST_UPDATED = 'June 26, 2026';

export default function Privacy() {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await supabase.from('projects').delete().eq('user_id', user.id);
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete account. Please contact support.');
    } finally {
      setDeleting(false);
    }
  };

  const sectionIconSize = 18;

  return (
    <div className="min-h-screen bg-[#1a1c20] text-gray-300">
      <header className="border-b border-white/10 bg-[#16181c]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft size={16} />
            <span className="text-sm text-gray-500">Back to App</span>
          </Link>
          <span className="text-xs text-gray-600">Last updated: {LAST_UPDATED}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-500">How we collect, use, and protect your data</p>
        </div>

        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock size={sectionIconSize} className="text-teal-400" />
              <h2 className="text-xl font-semibold text-white">Data Collection</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="mb-4">
                Andio collects the following personal data when you sign in with Google:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li><strong>Account Information:</strong> Name, email address, and profile picture from your Google account</li>
                <li><strong>Project Data:</strong> All tracks, clips, notes, and musical compositions you create</li>
                <li><strong>Usage Data:</strong> Browser type, IP address, and interaction logs for service improvement</li>
                <li><strong>Audio Recordings:</strong> Any audio you record using the microphone feature (stored locally by default, cloud storage optional)</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye size={sectionIconSize} className="text-teal-400" />
              <h2 className="text-xl font-semibold text-white">How We Use Your Data</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="mb-4 text-gray-400">
                Your data is used exclusively for the following purposes:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>Providing and maintaining your account and projects</li>
                <li>Storing and syncing your musical compositions across devices</li>
                <li>Sending essential service notifications (e.g., security alerts)</li>
                <li>Improving our service through anonymized analytics (opt-in only)</li>
                <li>Protecting against abuse and ensuring service security</li>
              </ul>
              <p className="mt-4 text-gray-400">
                We <strong>do not</strong> sell your personal data to third parties, use your compositions for AI training without consent, or share your projects with anyone.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Globe size={sectionIconSize} className="text-teal-400" />
              <h2 className="text-xl font-semibold text-white">International Data Transfers</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400">
                Your data may be processed and stored on servers located in the United States. By using Andio, you consent to the transfer of your data to the U.S. and other jurisdictions where our service providers operate. We implement appropriate safeguards including Standard Contractual Clauses (SCCs) for EU data transfers.
              </p>
              <div className="mt-4 p-4 bg-[#22252b] border border-white/10 rounded-lg">
                <p className="text-sm text-gray-500">
                  <strong className="text-gray-400">Philippines Users:</strong> In compliance with the Data Privacy Act of 2012 (RA 10173), we maintain appropriate security measures and will notify the National Privacy Commission of any data breach affecting personal data within 72 hours of discovery.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Cookie size={sectionIconSize} className="text-teal-400" />
              <h2 className="text-xl font-semibold text-white">Cookies & Tracking</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="mb-4 text-gray-400">
                We use cookies and similar technologies for:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li><strong>Essential:</strong> Authentication, session management, and basic functionality (required)</li>
                <li><strong>Analytics:</strong> Understanding how users interact with the service (optional)</li>
              </ul>
              <p className="mt-4 text-gray-400">
                You can manage cookie preferences through our cookie consent banner or your browser settings. Disabling essential cookies will prevent the application from functioning correctly.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield size={sectionIconSize} className="text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">Your Rights</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="mb-4 text-gray-400">
                Depending on your location, you have the following rights:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { title: 'Access', desc: 'Request a copy of all your personal data' },
                  { title: 'Correction', desc: 'Request correction of inaccurate data' },
                  { title: 'Deletion', desc: 'Request erasure of all your personal data ("Right to be Forgotten")' },
                  { title: 'Portability', desc: 'Export your projects in a machine-readable format' },
                  { title: 'Objection', desc: 'Object to processing for marketing purposes' },
                  { title: 'Withdrawal', desc: 'Withdraw consent at any time' },
                ].map((right) => (
                  <div key={right.title} className="p-3 bg-[#22252b] border border-white/10 rounded-lg">
                    <h4 className="font-medium text-white text-sm">{right.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{right.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Trash2 size={sectionIconSize} className="text-red-400" />
              <h2 className="text-xl font-semibold text-white">Account Deletion</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400 mb-4">
                You can delete your account at any time. This action is permanent and will:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400 mb-6">
                <li>Delete all your projects and compositions</li>
                <li>Remove your account from our database</li>
                <li>Clear all session cookies</li>
                <li>This action cannot be undone</li>
              </ul>

              {user ? (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400 mb-3">
                    Danger zone: Deleting your account is permanent and cannot be recovered.
                  </p>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-500/30 hover:bg-red-500/50 border border-red-500/50 text-red-400 rounded-lg text-sm transition-colors"
                    >
                      Delete My Account
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-400">Are you absolutely sure?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleting}
                          className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                        >
                          {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 bg-white/10 text-gray-400 rounded-lg text-sm hover:bg-white/20"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  <Link to="/auth" className="text-teal-400 hover:underline">Sign in</Link> to manage your account data.
                </p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail size={sectionIconSize} className="text-teal-400" />
              <h2 className="text-xl font-semibold text-white">Data Protection Officer</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400 mb-4">
                For questions about your personal data or to exercise your rights, contact us:
              </p>
              <div className="p-4 bg-[#22252b] border border-white/10 rounded-lg">
                <p><strong className="text-white">Email:</strong> privacy@andio.app</p>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                We will respond to all requests within 30 days as required by law.
              </p>
            </div>
          </section>

          <section className="border-t border-white/10 pt-8">
            <h2 className="text-lg font-semibold text-white mb-4">Children's Privacy (COPPA, GDPR Article 8)</h2>
            <p className="text-gray-400">
              Andio is not intended for users under 13 years of age (or 16 in certain EU countries). We do not knowingly collect personal information from children. If you believe a child under the age limit has provided us with personal information, please contact us immediately, and we will delete their data.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-xs text-gray-600">
          <div className="flex justify-center gap-6 mb-3">
            <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          </div>
          <p>© 2026 Andio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
