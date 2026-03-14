'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[rgba(8,8,8,0.9)] backdrop-blur-[16px] border-b border-[rgba(255,255,255,0.07)]">
        <div className="max-w-[1200px] mx-auto px-[5%] flex items-center justify-between h-16">
          <Link href="/" className="font-['Syne'] font-extrabold text-[1.3rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
            SmartSmile
          </Link>
          <div className="flex gap-8 list-none">
            <Link href="/about" className="text-[#666] no-underline text-[0.9rem] hover:text-[#f0f0f0] transition-colors">About</Link>
            <Link href="/contact" className="text-[#666] no-underline text-[0.9rem] hover:text-[#f0f0f0] transition-colors">Contact</Link>
          </div>
          <Link href="/signup" className="bg-[#00e5ff] text-black px-5 py-2 rounded-md font-semibold text-[0.85rem] no-underline hover:opacity-85 transition-opacity">
            Start Screening
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-[760px] mx-auto px-[5%] pt-[120px] pb-[80px]">
        <div className="inline-block text-[0.72rem] tracking-[0.12em] text-[#a855f7] bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.15)] px-3 py-1 rounded-[100px] mb-5">
          Legal
        </div>
        <h1 className="font-['Syne'] font-extrabold text-[2.5rem] mb-2 leading-[1.15]">Terms of Service</h1>
        <p className="text-[#666] text-[0.85rem] mb-12 pb-8 border-b border-[rgba(255,255,255,0.07)]">Effective date: January 27, 2026</p>

        <div className="bg-[rgba(249,115,22,0.06)] border border-[rgba(249,115,22,0.2)] rounded-[12px] p-5 mb-8 flex gap-4">
          <div className="text-[1.2rem]">⚠️</div>
          <p className="text-[#f97316] text-[0.88rem] leading-[1.65] m-0">SmartSmile is a preventive screening tool only. It does not provide medical diagnoses and is not a substitute for professional dental care. By creating an account and using this service, you acknowledge and fully accept this limitation.</p>
        </div>

        <h2 className="font-['Syne'] font-bold text-[1.15rem] mt-10 mb-3 text-[#f0f0f0]">1. Acceptance of Terms</h2>
        <p className="text-[#666] leading-[1.8] text-[0.92rem] mb-3">By accessing or using SmartSmile, you agree to be bound by these Terms of Service and our <Link href="/privacy" className="text-[#00e5ff] no-underline hover:underline">Privacy Policy</Link>. If you do not agree to these terms, you must not use the platform.</p>

        <h2 className="font-['Syne'] font-bold text-[1.15rem] mt-10 mb-3 text-[#f0f0f0]">2. Eligibility</h2>
        <p className="text-[#666] leading-[1.8] text-[0.92rem] mb-3">You must be at least 18 years of age to create an account and use SmartSmile. By registering, you confirm that you meet this age requirement. We reserve the right to terminate accounts found to be in violation of this requirement.</p>

        <h2 className="font-['Syne'] font-bold text-[1.15rem] mt-10 mb-3 text-[#f0f0f0]">3. User Responsibilities</h2>
        <p className="text-[#666] leading-[1.8] text-[0.92rem] mb-3">By creating an account, you agree to:</p>
        <ul className="text-[#666] leading-[1.8] text-[0.92rem] pl-5 mb-3">
          <li className="mb-1">Provide accurate information during registration</li>
          <li className="mb-1">Maintain the security and confidentiality of your account credentials</li>
          <li className="mb-1">Use the platform only for personal, non-commercial preventive health awareness</li>
          <li className="mb-1">Notify us immediately of any unauthorized use of your account</li>
          <li className="mb-1">Not share your account with any other individual</li>
          <li>Not attempt to reverse-engineer, scrape, or abuse the platform or its AI model</li>
        </ul>

        <h2 className="font-['Syne'] font-bold text-[1.15rem] mt-10 mb-3 text-[#f0f0f0]">4. Prohibited Content</h2>
        <p className="text-[#666] leading-[1.8] text-[0.92rem] mb-3">When using SmartSmile, you must not upload or submit:</p>
        <ul className="text-[#666] leading-[1.8] text-[0.92rem] pl-5 mb-3">
          <li className="mb-1">Images of other individuals without their explicit consent</li>
          <li className="mb-1">Non-dental images intended to manipulate, deceive, or test the AI system</li>
          <li className="mb-1">Any content that violates applicable local, national, or international laws</li>
          <li>Offensive, abusive, or illegal content of any kind</li>
        </ul>
        <p className="text-[#666] leading-[1.8] text-[0.92rem]">Violations may result in immediate account suspension or termination without notice.</p>

        <h2 className="font-['Syne'] font-bold text-[1.15rem] mt-10 mb-3 text-[#f0f0f0]">5. Medical Disclaimer</h2>
        <div className="bg-[rgba(249,115,22,0.06)] border border-[rgba(249,115,22,0.2)] rounded-[12px] p-5 mb-8 flex gap-4">
          <div className="text-[1.2rem]">🏥</div>
          <p className="text-[#f97316] text-[0.88rem] leading-[1.65] m-0">SmartSmile is not a medical device and does not provide clinical diagnoses. It is not intended to replace professional dental care, clinical examination, or treatment by a licensed dental professional. All results generated by SmartSmile are for preventive awareness purposes only. Never disregard professional dental advice or delay seeking treatment based on SmartSmile results.</p>
        </div>

        <h2 className="font-['Syne'] font-bold text-[1.15rem] mt-10 mb-3 text-[#f0f0f0]">6. Intellectual Property</h2>
        <p className="text-[#666] leading-[1.8] text-[0.92rem] mb-3">All content, designs, code, branding, and AI models within SmartSmile are the intellectual property of SmartSmile and its developers. You may not reproduce, copy, distribute, or create derivative works from any part of the platform without prior written permission.</p>

        <h2 className="font-['Syne'] font-bold text-[1.15rem] mt-10 mb-3 text-[#f0f0f0]">7. Limitation of Liability</h2>
        <p className="text-[#666] leading-[1.8] text-[0.92rem] mb-3">SmartSmile is provided "as is" without warranties of any kind, either express or implied. To the maximum extent permitted by applicable law, SmartSmile and its developers shall not be liable for:</p>
        <ul className="text-[#666] leading-[1.8] text-[0.92rem] pl-5 mb-3">
          <li className="mb-1">Any direct, indirect, incidental, or consequential damages arising from use of the platform</li>
          <li className="mb-1">Any reliance placed on AI screening results for medical or clinical decisions</li>
          <li className="mb-1">Any loss of data, interruption of service, or unauthorized access beyond our reasonable control</li>
          <li>Any decisions made based on SmartSmile results without professional dental consultation</li>
        </ul>

        <h2 className="font-['Syne'] font-bold text-[1.15rem] mt-10 mb-3 text-[#f0f0f0]">8. Service Availability</h2>
        <p className="text-[#666] leading-[1.8] text-[0.92rem] mb-3">We reserve the right to modify, suspend, or terminate the service or any part of it at any time with or without notice. We will make reasonable efforts to notify registered users of significant planned changes or outages.</p>

        <h2 className="font-['Syne'] font-bold text-[1.15rem] mt-10 mb-3 text-[#f0f0f0]">9. Termination</h2>
        <p className="text-[#666] leading-[1.8] text-[0.92rem] mb-3">We may suspend or terminate your account at any time if you violate these Terms of Service. You may also delete your account at any time from the Account Settings page. Upon termination, your right to use the platform ceases immediately.</p>

        <div className="bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.1)] rounded-[12px] p-5 mb-8">
          <p className="text-[#f0f0f0] text-[0.88rem] leading-[1.65] m-0">These terms are governed by applicable law. If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full Force and effect.</p>
        </div>

        <h2 className="font-['Syne'] font-bold text-[1.15rem] mt-10 mb-3 text-[#f0f0f0]">10. Contact</h2>
        <p className="text-[#666] leading-[1.8] text-[0.92rem] mb-3">For any questions regarding these Terms of Service, please reach out through our <Link href="/contact" className="text-[#00e5ff] no-underline hover:underline">Contact page</Link> or email <a href="mailto:legal@smartsmile.ai" className="text-[#00e5ff] no-underline hover:underline">legal@smartsmile.ai</a>.</p>
      </div>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.07)] py-12 px-[5%] mt-16">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center flex-wrap gap-6">
          <div className="font-['Syne'] font-extrabold text-[1.3rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
            SmartSmile
          </div>
          <div className="flex gap-8">
            <Link href="/about" className="text-[#666] no-underline text-[0.85rem] hover:text-[#f0f0f0] transition-colors">About</Link>
            <Link href="/privacy" className="text-[#666] no-underline text-[0.85rem] hover:text-[#f0f0f0] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[#666] no-underline text-[0.85rem] hover:text-[#f0f0f0] transition-colors">Terms of Service</Link>
            <Link href="/contact" className="text-[#666] no-underline text-[0.85rem] hover:text-[#f0f0f0] transition-colors">Contact</Link>
          </div>
          <div className="text-[#666] text-[0.8rem]">© 2026 SmartSmile. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
