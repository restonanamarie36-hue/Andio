import { Link } from 'react-router-dom';
import { FileText, Scale, Users, Copyright, AlertTriangle, Ban, Mail, ArrowLeft } from 'lucide-react';

const LAST_UPDATED = 'June 26, 2026';

export default function Terms() {
  const sectionIconSize = 18;

  return (
    <div className="min-h-screen bg-[#0a0c11] text-gray-300">
      <header className="border-b border-white/10 bg-[#0d0f14]/95 backdrop-blur-sm sticky top-0 z-40">
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
          <div className="w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
            <Scale size={28} className="text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-500">Please read these terms carefully before using GrooveGrid</p>
        </div>

        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText size={sectionIconSize} className="text-violet-400" />
              <h2 className="text-xl font-semibold text-white">Acceptance of Terms</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400">
                By accessing or using GrooveGrid ("the Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this Service.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Users size={sectionIconSize} className="text-violet-400" />
              <h2 className="text-xl font-semibold text-white">Account Eligibility</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>You must be at least <strong>13 years of age</strong> (or 16 in certain EU member states) to create an account</li>
                <li>You must provide accurate and complete registration information</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must not use another person's account without permission</li>
              </ul>
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-400">
                    <strong>Age Verification:</strong> If you are between 13-16 years old, you must have verifiable parental or legal guardian consent to use this service in accordance with COPPA and GDPR Article 8.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Copyright size={sectionIconSize} className="text-violet-400" />
              <h2 className="text-xl font-semibold text-white">Intellectual Property</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <h4 className="text-white mb-2">Your Content</h4>
              <p className="text-gray-400 mb-4">
                You retain full ownership of all musical compositions, audio recordings, and other content you create using GrooveGrid. By using the Service, you grant GrooveGrid a limited license to store and display your content solely for the purpose of providing the Service to you.
              </p>

              <h4 className="text-white mb-2">Our Platform</h4>
              <p className="text-gray-400 mb-4">
                The GrooveGrid application, including but not limited to its visual design, audio engine architecture, DSP algorithms, user interface, and source code, is protected by copyright and intellectual property laws.
              </p>

              <div className="p-4 bg-[#141720] border border-white/10 rounded-lg">
                <h4 className="text-white text-sm mb-2">Prohibited Activities:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
                  <li>Reverse engineering, decompiling, or disassembling the application</li>
                  <li>Creating derivative works based on our proprietary audio engine</li>
                  <li>Scraping or automated extraction of data from the platform</li>
                  <li>Using the Service to infringe on copyrights of third parties</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale size={sectionIconSize} className="text-violet-400" />
              <h2 className="text-xl font-semibold text-white">Copyright & DMCA</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400 mb-4">
                In compliance with the Digital Millennium Copyright Act (DMCA) Title 17, Section 512, GrooveGrid maintains Safe Harbor protections for user-generated content.
              </p>
              <div className="p-4 bg-[#141720] border border-white/10 rounded-lg mb-4">
                <h4 className="text-white text-sm mb-2">DMCA Notice-and-Takedown Protocol</h4>
                <p className="text-sm text-gray-500">
                  If you believe copyrighted material has been uploaded without authorization, send a DMCA takedown notice to our designated agent with:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-500 mt-2 space-y-1">
                  <li>Your physical or electronic signature</li>
                  <li>Identification of the copyrighted work</li>
                  <li>Identification of the infringing material and its location</li>
                  <li>Your contact information</li>
                  <li>A statement of good faith belief</li>
                  <li>A statement of accuracy under penalty of perjury</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">
                <strong className="text-gray-400">DMCA Agent:</strong> dmca@groovegrid.app
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Ban size={sectionIconSize} className="text-red-400" />
              <h2 className="text-xl font-semibold text-white">Prohibited Conduct</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400 mb-4">You agree not to:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>Upload viruses, malware, or any malicious code</li>
                <li>Harrass, abuse, or harm other users</li>
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to any systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Upload content that infringes on intellectual property rights</li>
                <li>Share your account credentials with others</li>
                <li>Create multiple accounts to circumvent restrictions</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={sectionIconSize} className="text-amber-400" />
              <h2 className="text-xl font-semibold text-white">Disclaimer of Warranties</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Limitation of Liability</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400">
                IN NO EVENT SHALL GROOVEGRID BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID (IF ANY) FOR ACCESSING THE SERVICE.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Note: GrooveGrid is currently a free service. The limitation above applies to any damages that may arise from your use of the application.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Data Export & Service Transitions</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400 mb-4">
                In compliance with FTC Act Section 5 consumer protection requirements:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>We will provide at least <strong>30 days notice</strong> before any significant service changes</li>
                <li>You can export all your projects at any time via the Export feature</li>
                <li>If the service is discontinued, you will have at least 60 days to download your data</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Modifications to Terms</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400">
                We may modify these Terms at any time. When we make material changes, we will notify you via email (if you've provided one) or through in-app notification at least 30 days before the changes take effect. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Governing Law</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400">
                These Terms shall be governed by the laws of the jurisdiction in which GrooveGrid operates. For users in the Philippines, this includes compliance with Republic Act No. 8293 (Intellectual Property Code) and Republic Act No. 10173 (Data Privacy Act).
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail size={sectionIconSize} className="text-violet-400" />
              <h2 className="text-xl font-semibold text-white">Contact</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400">
                For questions about these Terms, please contact us at:
              </p>
              <div className="p-4 bg-[#141720] border border-white/10 rounded-lg mt-3">
                <p><strong className="text-white">Legal Inquiries:</strong> legal@groovegrid.app</p>
                <p className="mt-1"><strong className="text-white">Support:</strong> support@groovegrid.app</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-xs text-gray-600">
          <div className="flex justify-center gap-6 mb-3">
            <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          </div>
          <p>© 2026 GrooveGrid. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
