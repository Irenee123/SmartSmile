'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[rgba(8,8,8,0.9)] backdrop-blur-[16px] border-b border-[rgba(255,255,255,0.07)]">
        <div className="max-w-[1200px] mx-auto px-[5%] flex items-center justify-between h-16">
          <Link href="/" className="font-['Syne'] font-extrabold text-[1.3rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
            SmartSmile
          </Link>
          <div className="flex gap-8">
            <Link href="/about" className="text-[#666] text-[0.9rem] hover:text-[#f0f0f0] transition-colors">About</Link>
            <Link href="/contact" className="text-[#666] text-[0.9rem] hover:text-[#f0f0f0] transition-colors">Contact</Link>
          </div>
          <Link href="/signup" className="bg-[#00e5ff] text-black px-5 py-2 rounded-md font-semibold text-[0.85rem] no-underline hover:opacity-85 transition-opacity">
            Start Screening
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-[760px] mx-auto px-[5%] pt-[120px] pb-[80px]">
        <div className="inline-block text-[0.72rem] tracking-[0.12em] text-[#00e5ff] bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.15)] px-3 py-1 rounded-[100px] mb-5">
          Legal
        </div>
        <h1 className="font-['Syne'] font-extrabold text-[2.5rem] mb-2 leading-[1.15]">Privacy Policy</h1>
        <p className="text-[#555] text-[0.85rem] mb-10 pb-8 border-b border-[rgba(255,255,255,0.07)]">Last updated: January 27, 2026</p>

        {/* Intro banner */}
        <div className="bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.1)] rounded-[14px] p-6 mb-12">
          <p className="text-[#c0c0c0] text-[0.9rem] leading-[1.8] m-0">
            SmartSmile was built with privacy at its core. We collect only what is strictly necessary to provide the service and give you full control over your data at all times. This policy explains what we collect, why we collect it, how it is protected, and what rights you hold.
          </p>
        </div>

        {/* Clause 1 */}
        <Section number="1" title="Scope and Application">
          <p>
            This Privacy Policy applies to all users of the SmartSmile oral health screening platform, including the web application, its AI analysis features, and all associated services. By creating an account and using SmartSmile, you acknowledge that you have read and understood this policy. If you do not agree with any part of it, you should discontinue use of the platform.
          </p>
        </Section>

        {/* Clause 2 */}
        <Section number="2" title="Data Collection and Purpose">
          <p>
            SmartSmile collects the following personal data from registered users: your email address for account creation and communication, your name if optionally provided for personalisation, dental photographs you submit for AI analysis, AI-generated analysis results including condition classification, confidence score, risk level, and heatmap visualisation, and screening history records linked to your account.
          </p>
          <p>
            This data is collected solely for the purpose of providing the SmartSmile preventive oral health screening service. It will not be used for any other purpose without your explicit consent. SmartSmile does not sell, rent, or share your personal data with third parties for commercial purposes.
          </p>
        </Section>

        {/* Clause 3 */}
        <Section number="3" title="Informed Consent for Health Data Processing">
          <p>
            By submitting a dental photograph for AI analysis, you provide explicit, specific, and informed consent for SmartSmile to process that image using its machine learning model for the sole purpose of generating a preventive oral health screening result. You understand that this image will be temporarily processed by the AI inference server and that the analysis result (but not the raw image) will be stored in your screening history.
          </p>
          <p>
            You have the right to withdraw your consent at any time by deleting your screening history or requesting account deletion via the Settings page. Withdrawal of consent does not affect the lawfulness of processing carried out before withdrawal.
          </p>
        </Section>

        {/* Clause 4 */}
        <Section number="4" title="Data Security and Storage">
          <p>
            SmartSmile stores all user account data and screening results in a secured cloud database provided by Supabase (PostgreSQL). Access to user data is protected by JWT (JSON Web Token) authentication. Users can only access their own screening records, and administrative access is restricted to authorised personnel only.
          </p>
          <p>
            Dental images submitted for analysis are processed in memory by the AI inference server and are not stored permanently on the inference server. All data transmissions between your browser and the SmartSmile servers are encrypted using industry-standard HTTPS protocols. In the event of a data breach that is likely to result in a risk to your rights and freedoms, we will notify affected users within 72 hours of becoming aware of the breach.
          </p>
        </Section>

        {/* Clause 5 */}
        <Section number="5" title="Data Retention and the Right to Deletion">
          <p>
            SmartSmile retains your personal data and screening history for as long as your account is active. If you choose to delete your account, all associated personal data, including your email address, name, screening history, and analysis results, will be permanently deleted from our systems within 30 days of your deletion request.
          </p>
          <p>
            You may request deletion of individual screening records at any time through the History page without deleting your entire account. SmartSmile does not retain data for longer than is necessary for the purposes for which it was collected.
          </p>
        </Section>

        {/* Clause 6 */}
        <Section number="6" title="Your Rights">
          <p>
            You have the right to access and download a copy of your data, request correction of any inaccurate information, and request permanent deletion of your account and all associated data at any time through the Settings page. You may also withdraw consent for health data processing by removing your screening records or closing your account entirely. For any data-related requests or concerns, please reach out via our <Link href="/contact" className="text-[#00e5ff] no-underline hover:underline">Contact page</Link>.
          </p>
        </Section>

        {/* Clause 7 */}
        <Section number="7" title="Cookies">
          <p>
            SmartSmile uses only essential session cookies required to keep you authenticated during your visit. We do not use tracking cookies, advertising cookies, or any third-party analytics cookies. No cookie data is shared with external parties.
          </p>
        </Section>

        {/* Clause 8 */}
        <Section number="8" title="Changes to This Policy">
          <p>
            If we make significant changes to this Privacy Policy, we will notify you by email before the changes take effect. Continued use of the platform after notification constitutes your acceptance of the updated policy. The date at the top of this page will always reflect when the policy was last revised.
          </p>
        </Section>

        {/* Clause 9 */}
        <Section number="9" title="Contact">
          <p>
            For any privacy-related questions, data requests, or concerns, please contact us through our <Link href="/contact" className="text-[#00e5ff] no-underline hover:underline">Contact page</Link>. We aim to respond to all privacy enquiries within 2 business days.
          </p>
        </Section>
      </div>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.07)] py-12 px-[5%] mt-8">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center flex-wrap gap-6">
          <div className="font-['Syne'] font-extrabold text-[1.3rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
            SmartSmile
          </div>
          <div className="flex gap-8">
            <Link href="/about" className="text-[#666] text-[0.85rem] hover:text-[#f0f0f0] transition-colors">About</Link>
            <Link href="/privacy" className="text-[#666] text-[0.85rem] hover:text-[#f0f0f0] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[#666] text-[0.85rem] hover:text-[#f0f0f0] transition-colors">Terms of Service</Link>
            <Link href="/contact" className="text-[#666] text-[0.85rem] hover:text-[#f0f0f0] transition-colors">Contact</Link>
          </div>
          <div className="text-[#555] text-[0.8rem]">© 2026 SmartSmile. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10 pb-10 border-b border-[rgba(255,255,255,0.05)] last:border-b-0">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[rgba(168,85,247,0.12)] border border-[rgba(168,85,247,0.25)] flex items-center justify-center text-[0.68rem] font-bold text-[#a855f7]">
          {number}
        </span>
        <h2 className="font-['Syne'] font-bold text-[1.05rem] text-[#f0f0f0] m-0">{title}</h2>
      </div>
      <div className="pl-10 text-[#777] leading-[1.9] text-[0.9rem] flex flex-col gap-4">
        {children}
      </div>
    </div>
  )
}
