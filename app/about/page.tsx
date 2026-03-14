'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080808] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[rgba(8,8,8,0.85)] backdrop-blur-[16px] border-b border-[rgba(255,255,255,0.07)]">
        <div className="max-w-[1200px] mx-auto px-[5%] flex items-center justify-between h-16">
          <Link href="/" className="font-['Syne'] font-extrabold text-[1.3rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
            SmartSmile
          </Link>
          <div className="flex gap-8 list-none">
            <Link href="/about" className="text-[#f0f0f0] no-underline text-[0.9rem]">About</Link>
            <Link href="/contact" className="text-[#777] no-underline text-[0.9rem] hover:text-[#f0f0f0] transition-colors">Contact</Link>
          </div>
          <Link href="/signup" className="bg-[#00e5ff] text-black px-5 py-2 rounded-md font-semibold text-[0.85rem] no-underline hover:opacity-85 transition-opacity">
            Start Screening
          </Link>
        </div>
      </nav>

      {/* Page Hero */}
      <div className="pt-[140px] pb-[60px] px-[5%] text-center relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.1)_0%,rgba(168,85,247,0.06)_50%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        
        <div className="text-[0.75rem] tracking-[0.15em] text-[#00e5ff] uppercase mb-3">About SmartSmile</div>
        <h1 className="font-['Syne'] font-extrabold text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.1] mb-4">
          AI that cares about<br/>your <span className="bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">smile</span>
        </h1>
        <p className="text-[#777] max-w-[600px] mx-auto leading-[1.7] text-[1.05rem]">
          SmartSmile is a machine learning–powered preventive oral health screening platform designed to make dental awareness accessible to everyone, everywhere.
        </p>
      </div>

      {/* What We Do Section */}
      <section className="py-20 px-[5%]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[0.75rem] tracking-[0.15em] text-[#00e5ff] uppercase mb-3">What We Do</div>
          <h2 className="font-['Syne'] font-extrabold text-[clamp(1.6rem,3.5vw,2.2rem)] mb-4">
            Preventive screening,<br/>not clinical diagnosis
          </h2>
          <p className="text-[#777] leading-[1.75] text-[0.92rem] mb-0 max-w-[700px]">
            SmartSmile analyzes smartphone photos of your teeth to detect visible indicators of common oral health conditions. We help you become aware of early warning signs so you can take preventive action before problems worsen and become costly to treat.
          </p>
          
          <div className="grid grid-cols-2 gap-6 mt-10">
            <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-[16px] p-8 transition-colors hover:border-[rgba(0,229,255,0.2)]">
              <div className="text-[2rem] mb-4">🔬</div>
              <h3 className="font-['Syne'] font-bold text-[1rem] mb-2">What SmartSmile Does</h3>
              <p className="text-[#777] text-[0.88rem] m-0">Analyzes photos for visible signs of dental caries, plaque accumulation, and gum inflammation. Provides a risk level and personalized preventive advice to support timely professional consultation.</p>
            </div>
            <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-[16px] p-8 transition-colors hover:border-[rgba(0,229,255,0.2)]">
              <div className="text-[2rem] mb-4">🚫</div>
              <h3 className="font-['Syne'] font-bold text-[1rem] mb-2">What SmartSmile Doesn't Do</h3>
              <p className="text-[#777] text-[0.88rem] m-0">SmartSmile is not a diagnostic tool and does not replace a dentist. It cannot read X-rays, use clinical instruments, or provide medical diagnoses. Always consult a dental professional for treatment decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-[5%]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[0.75rem] tracking-[0.15em] text-[#00e5ff] uppercase mb-3">Technology</div>
          <h2 className="font-['Syne'] font-extrabold text-[clamp(1.6rem,3.5vw,2.2rem)] mb-4">How the AI works</h2>
          <p className="text-[#777] leading-[1.75] text-[0.92rem] mb-0 max-w-[700px]">
            SmartSmile is built on convolutional neural network (CNN) models trained on thousands of annotated dental images. The system preprocesses each uploaded image and runs it through the model to detect visible oral health indicators in real time, returning a risk score and confidence percentage within seconds.
          </p>
          
          <div className="grid grid-cols-3 gap-4 mt-10">
            <div className="bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.1)] rounded-[12px] p-5 text-center transition-colors hover:border-[rgba(0,229,255,0.25)]">
              <div className="font-['Syne'] font-bold text-[0.95rem] mb-1">CNN Model</div>
              <div className="text-[#777] text-[0.78rem] leading-[1.5]">Deep learning backbone for dental image feature extraction and classification</div>
            </div>
            <div className="bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.1)] rounded-[12px] p-5 text-center transition-colors hover:border-[rgba(0,229,255,0.25)]">
              <div className="font-['Syne'] font-bold text-[0.95rem] mb-1">OpenCV</div>
              <div className="text-[#777] text-[0.78rem] leading-[1.5]">Image preprocessing — resize, normalize, blur detection, brightness check</div>
            </div>
            <div className="bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.1)] rounded-[12px] p-5 text-center transition-colors hover:border-[rgba(0,229,255,0.25)]">
              <div className="font-['Syne'] font-bold text-[0.95rem] mb-1">FastAPI</div>
              <div className="text-[#777] text-[0.78rem] leading-[1.5]">High-performance Python backend connecting the React UI to the ML model</div>
            </div>
            <div className="bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.1)] rounded-[12px] p-5 text-center transition-colors hover:border-[rgba(0,229,255,0.25)]">
              <div className="font-['Syne'] font-bold text-[0.95rem] mb-1">TensorFlow</div>
              <div className="text-[#777] text-[0.78rem] leading-[1.5]">ML framework used for model training, validation, and inference</div>
            </div>
            <div className="bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.1)] rounded-[12px] p-5 text-center transition-colors hover:border-[rgba(0,229,255,0.25)]">
              <div className="font-['Syne'] font-bold text-[0.95rem] mb-1">Risk Scoring</div>
              <div className="text-[#777] text-[0.78rem] leading-[1.5]">Low / Moderate / High classification with confidence percentage output</div>
            </div>
            <div className="bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.1)] rounded-[12px] p-5 text-center transition-colors hover:border-[rgba(0,229,255,0.25)]">
              <div className="font-['Syne'] font-bold text-[0.95rem] mb-1">Supabase</div>
              <div className="text-[#777] text-[0.78rem] leading-[1.5]">Secure cloud database and storage for screening records and user data</div>
            </div>
          </div>
        </div>
      </section>

      {/* Limitations Section */}
      <section className="py-20 px-[5%]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[0.75rem] tracking-[0.15em] text-[#00e5ff] uppercase mb-3">Limitations</div>
          <h2 className="font-['Syne'] font-extrabold text-[clamp(1.6rem,3.5vw,2.2rem)] mb-4">What you should know</h2>
          <p className="text-[#777] leading-[1.75] text-[0.92rem] mb-0 max-w-[700px]">
            We believe in full transparency about what SmartSmile can and cannot do. Understanding these limitations helps you use the platform responsibly.
          </p>
          
          <ul className="list-none flex flex-col gap-[0.9rem] mt-6">
            <li className="flex gap-[0.85rem] items-start text-[#777] text-[0.9rem] leading-[1.65]">
              <div className="min-w-[20px] h-[20px] rounded-full bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.2)] flex items-center justify-center text-[0.65rem] text-[#f97316] mt-[2px]">!</div>
              SmartSmile analyzes visible surface features only — it cannot detect issues beneath the tooth surface or interpret dental X-rays.
            </li>
            <li className="flex gap-[0.85rem] items-start text-[#777] text-[0.9rem] leading-[1.65]">
              <div className="min-w-[20px] h-[20px] rounded-full bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.2)] flex items-center justify-center text-[0.65rem] text-[#f97316] mt-[2px]">!</div>
              Image quality directly affects accuracy. Blurry, poorly lit, or incorrectly angled photos may significantly reduce result reliability.
            </li>
            <li className="flex gap-[0.85rem] items-start text-[#777] text-[0.9rem] leading-[1.65]">
              <div className="min-w-[20px] h-[20px] rounded-full bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.2)] flex items-center justify-center text-[0.65rem] text-[#f97316] mt-[2px]">!</div>
              The AI model may not generalize equally across all demographics, lighting conditions, skin tones, or oral anatomies.
            </li>
            <li className="flex gap-[0.85rem] items-start text-[#777] text-[0.9rem] leading-[1.65]">
              <div className="min-w-[20px] h-[20px] rounded-full bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.2)] flex items-center justify-center text-[0.65rem] text-[#f97316] mt-[2px]">!</div>
              SmartSmile is not validated for clinical use and should not replace regular professional dental examinations or treatment.
            </li>
            <li className="flex gap-[0.85rem] items-start text-[#777] text-[0.9rem] leading-[1.65]">
              <div className="min-w-[20px] h-[20px] rounded-full bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.2)] flex items-center justify-center text-[0.65rem] text-[#f97316] mt-[2px]">!</div>
              A Low risk result does not mean you have perfect oral health — it means no visible surface indicators were detected in this specific image.
            </li>
          </ul>
        </div>
      </section>

      {/* Ethics Section */}
      <section className="py-20 px-[5%]">
        <div className="max-w-[1100px] mx-auto">
          <div className="bg-gradient-to-br from-[rgba(168,85,247,0.06)] to-[rgba(0,229,255,0.04)] border border-[rgba(168,85,247,0.15)] rounded-[20px] p-12 relative overflow-hidden">
            <div className="absolute top-[-80px] right-[-80px] w-[250px] h-[250px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.1),transparent_70%)]"></div>
            
            <h3 className="font-['Syne'] font-extrabold text-[1.3rem] mb-4 text-[#a855f7]">Ethical AI Statement</h3>
            <p className="text-[#777] leading-[1.8] text-[0.92rem] mb-3">
              SmartSmile is built on principles of fairness, transparency, and user empowerment. We are committed to being completely clear about what our AI can and cannot do, and we actively work to prevent harm through responsible design choices.
            </p>
            <p className="text-[#777] leading-[1.8] text-[0.92rem] mb-0">
              We do not collect unnecessary personal information, we store all data securely with full user control, and we never use your dental images for advertising or profiling purposes. Our AI is a preventive awareness tool — not a replacement for human clinical judgment.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-4 text-center">
                <div className="text-[1.5rem] mb-2">⚖️</div>
                <h4 className="font-['Syne'] font-bold text-[0.85rem] mb-1">Fairness</h4>
                <p className="text-[#777] text-[0.75rem] m-0">Continuously evaluated for bias across diverse user groups and conditions</p>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-4 text-center">
                <div className="text-[1.5rem] mb-2">🔍</div>
                <h4 className="font-['Syne'] font-bold text-[0.85rem] mb-1">Transparency</h4>
                <p className="text-[#777] text-[0.75rem] m-0">Clear about what the AI detects, its confidence, and its limitations</p>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-4 text-center">
                <div className="text-[1.5rem] mb-2">🔒</div>
                <h4 className="font-['Syne'] font-bold text-[0.85rem] mb-1">Privacy</h4>
                <p className="text-[#777] text-[0.75rem] m-0">Minimum data collection, full user control, and no third-party data sharing</p>
              </div>
            </div>
          </div>

          <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-[16px] p-8 flex justify-between items-center gap-6 flex-wrap mt-8">
            <div>
              <h3 className="font-['Syne'] font-bold text-[1.05rem] mb-1">Have a question about SmartSmile?</h3>
              <p className="text-[#777] text-[0.88rem] m-0">We're happy to answer any questions about the technology, data handling, or how to use the platform.</p>
            </div>
            <Link href="/contact" className="bg-[#00e5ff] text-black px-6 py-2.5 rounded-[8px] font-bold text-[0.85rem] no-underline hover:opacity-90 transition-opacity whitespace-nowrap">
              Contact Us →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.07)] py-12 px-[5%]">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center flex-wrap gap-6">
          <div className="font-['Syne'] font-extrabold text-[1.3rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
            SmartSmile
          </div>
          <div className="flex gap-8">
            <Link href="/about" className="text-[#f0f0f0] no-underline text-[0.85rem]">About</Link>
            <Link href="/privacy" className="text-[#777] no-underline text-[0.85rem] hover:text-[#f0f0f0] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[#777] no-underline text-[0.85rem] hover:text-[#f0f0f0] transition-colors">Terms of Service</Link>
            <Link href="/contact" className="text-[#777] no-underline text-[0.85rem] hover:text-[#f0f0f0] transition-colors">Contact</Link>
          </div>
          <div className="text-[#777] text-[0.8rem]">© 2026 SmartSmile. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
