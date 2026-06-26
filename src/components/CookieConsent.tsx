import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

const CONSENT_KEY = 'groovegrid_cookie_consent';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, analytics: true, timestamp: new Date().toISOString() }));
    setIsVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, analytics: false, timestamp: new Date().toISOString() }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-3xl mx-auto bg-[#22252b] border border-white/10 rounded-xl shadow-2xl p-5">
        <div className="flex gap-4">
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Cookie size={18} className="text-amber-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Cookie Preferences</h3>
            <p className="text-sm text-gray-400 mb-4">
              We use cookies to provide essential functionality, analyze traffic, and improve your experience.
              By clicking "Accept All", you consent to our use of cookies as described in our{' '}
              <a href="/privacy" className="text-teal-400 hover:underline">Privacy Policy</a>.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={acceptAll}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-lg text-sm transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={acceptEssential}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
              >
                Essential Only
              </button>
              <a
                href="/privacy"
                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
          <button
            onClick={acceptEssential}
            className="text-gray-600 hover:text-white transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function hasCookieConsent(): boolean {
  const consent = localStorage.getItem(CONSENT_KEY);
  if (!consent) return false;
  try {
    return JSON.parse(consent).essential === true;
  } catch {
    return false;
  }
}
