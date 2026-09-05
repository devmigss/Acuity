/**
 * Acuity — About Page
 *
 * Comprehensive overview of the Acuity platform, addressing:
 * - What Acuity is (AI-assisted CFU counting, measurement, and research verification)
 * - The Problem (manual colony counting, visual fatigue, transcription errors, audit bottlenecks)
 * - How Acuity Works (01 Upload → 02 Detect → 03 Verify → 04 Export)
 * - Key Capabilities (AI detection, Human-in-the-loop, spatial calibration, faculty review, data export)
 * - Who Acuity is For (Biology Students / Thesis Researchers & Faculty Advisers)
 * - Closing CTA (Registration redirect)
 *
 * Uses structured [IMAGE PLACEHOLDER] components ready for asset replacement.
 */

import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/routeConstants'

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* ── 1. Hero Section ── */}
      <section className="relative overflow-hidden bg-white border-b border-surface-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left: Headline & Narrative */}
            <div className="lg:col-span-7 max-w-2xl">
              <div className="fade-in-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-xs font-semibold text-primary-900 mb-6">
                <span className="w-2 h-2 rounded-full bg-accent-400" />
                Microbiology & Computer Vision
              </div>

              <h1 className="fade-in-up animation-delay-75 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-900 tracking-tight leading-[1.15]">
                Smarter colony counting for{' '}
                <span className="text-accent-400">better research</span>.
              </h1>

              <p className="fade-in-up animation-delay-150 mt-6 text-base sm:text-lg text-surface-600 leading-relaxed">
                Acuity is a web-based computer vision platform engineered to assist biology students, thesis researchers, and laboratory groups with automated Colony Forming Unit (CFU) detection, spatial calibration, morphological measurement, and academic verification.
              </p>

              <div className="fade-in-up animation-delay-225 mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to={ROUTES.AUTH.REGISTER}
                  className="inline-flex items-center justify-center px-7 py-3 text-base font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 cursor-pointer text-center"
                >
                  Get Started — it&apos;s Free
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-7 py-3 text-base font-semibold rounded-lg border-2 border-surface-300 text-surface-700 hover:border-primary-600 hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 cursor-pointer text-center"
                >
                  Explore Workflow
                </a>
              </div>
            </div>

            {/* Right: Petri Dish Image Placeholder */}
            <div className="lg:col-span-5 fade-in-up animation-delay-150">
              <div className="relative w-full aspect-4/3 rounded-2xl bg-primary-950 border border-primary-800 p-6 flex flex-col items-center justify-between shadow-xl overflow-hidden group">
                {/* Background Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-15 bg-[radial-gradient(#8193B7_1px,transparent_1px)] [background-size:16px_16px]"
                  aria-hidden="true"
                />

                {/* Simulated Petri Dish Canvas Illustration */}
                <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 border-accent-400/60 bg-primary-900/60 flex items-center justify-center relative shadow-inner">
                    {/* Simulated colonies */}
                    <div className="absolute top-8 left-12 w-3 h-3 rounded-full bg-accent-400 animate-pulse" />
                    <div className="absolute top-16 right-10 w-2.5 h-2.5 rounded-full bg-accent-300" />
                    <div className="absolute bottom-12 left-16 w-3.5 h-3.5 rounded-full bg-accent-400" />
                    <div className="absolute bottom-10 right-14 w-2 h-2 rounded-full bg-accent-200" />
                    <div className="absolute top-20 left-24 w-4 h-4 rounded-full bg-accent-400/90" />

                    {/* Detection Bounding Box Marker */}
                    <div className="absolute top-18 left-22 w-8 h-8 border border-dashed border-accent-300 rounded flex items-center justify-center text-[9px] text-accent-300 font-mono">
                      CFU #12
                    </div>

                    {/* Petri dish inner rim */}
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-primary-700/50" />
                  </div>
                </div>

                {/* Placeholder Label Banner */}
                <div className="relative z-10 w-full text-center pt-3 border-t border-primary-800/80">
                  <div className="text-xs font-bold text-accent-400 tracking-wider uppercase">
                    [Petri Dish Image Placeholder]
                  </div>
                  <div className="text-[11px] text-primary-200 mt-0.5">
                    Ready for high-resolution laboratory photography
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. The Problem Section ── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-surface-50 border-b border-surface-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-2">
              The Challenge
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Why Manual Colony Counting Falls Short
            </h3>
            <p className="mt-4 text-surface-600 leading-relaxed">
              Traditional microbiology enumeration relies on researchers manually tallying hundreds of colonies across dozens of plates. This creates significant physical and methodological bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1 */}
            <div className="fade-in-up bg-white rounded-xl border border-surface-200 p-6 sm:p-8 shadow-xs group cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:border-danger-200">
              <div className="w-10 h-10 rounded-lg bg-danger-50 text-danger-600 flex items-center justify-center font-bold mb-4 transition-colors duration-300 group-hover:bg-danger-600 group-hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-surface-900 mb-2 transition-colors duration-300 group-hover:text-danger-600">
                Visual Fatigue & Eye Strain
              </h4>
              <p className="text-sm text-surface-500 leading-relaxed">
                Prolonged manual counting under laboratory lighting causes severe visual fatigue, increasing error rates as researchers process replicate plates.
              </p>
            </div>

            {/* Card 2 */}
            <div className="fade-in-up animation-delay-75 bg-white rounded-xl border border-surface-200 p-6 sm:p-8 shadow-xs group cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:border-accent-200">
              <div className="w-10 h-10 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center font-bold mb-4 transition-colors duration-300 group-hover:bg-accent-600 group-hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-surface-900 mb-2 transition-colors duration-300 group-hover:text-accent-600">
                Transcription & Counting Errors
              </h4>
              <p className="text-sm text-surface-500 leading-relaxed">
                Crowded or overlapping colonies cause counting variance between triplicates, while manual transcription into spreadsheets introduces accidental data corruption.
              </p>
            </div>

            {/* Card 3 */}
            <div className="fade-in-up animation-delay-150 bg-white rounded-xl border border-surface-200 p-6 sm:p-8 shadow-xs group cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:border-primary-200">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold mb-4 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-surface-900 mb-2 transition-colors duration-300 group-hover:text-primary-600">
                Verification Bottlenecks
              </h4>
              <p className="text-sm text-surface-500 leading-relaxed">
                Thesis advisers and peer reviewers lack a verifiable digital record to inspect student counts, verify spatial boundaries, or audit morphological measurements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. How Acuity Works ── */}
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-white border-b border-surface-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-2">
              The Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              From Plate Photo to Verified Dataset
            </h3>
            <p className="mt-4 text-surface-600 leading-relaxed">
              Acuity combines modern computer vision with an interactive verification canvas so human expertise remains in control at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {/* Step 1 */}
            <div className="fade-in-up relative text-left group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
              <div className="text-3xl font-extrabold text-accent-400 mb-2 transition-colors duration-300 group-hover:text-primary-500">01</div>
              <h4 className="text-base font-bold text-surface-900 mb-2 transition-colors duration-300 group-hover:text-primary-600">Upload</h4>
              <p className="text-sm text-surface-500 leading-relaxed">
                Upload macroscopic Petri dish photos (JPEG, JPG, or PNG) in batches of up to 10 images per project.
              </p>
            </div>

            {/* Step 2 */}
            <div className="fade-in-up animation-delay-75 relative text-left group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
              <div className="text-3xl font-extrabold text-accent-400 mb-2 transition-colors duration-300 group-hover:text-primary-500">02</div>
              <h4 className="text-base font-bold text-surface-900 mb-2 transition-colors duration-300 group-hover:text-primary-600">Detect</h4>
              <p className="text-sm text-surface-500 leading-relaxed">
                SOD-YOLOv8 deep learning model rapidly identifies, localizes, and counts colony forming units in seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="fade-in-up animation-delay-150 relative text-left group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
              <div className="text-3xl font-extrabold text-accent-400 mb-2 transition-colors duration-300 group-hover:text-primary-500">03</div>
              <h4 className="text-base font-bold text-surface-900 mb-2 transition-colors duration-300 group-hover:text-primary-600">Verify</h4>
              <p className="text-sm text-surface-500 leading-relaxed">
                Review automated detections on the interactive canvas. Add, resize, or delete bounding boxes with confidence scores.
              </p>
            </div>

            {/* Step 4 */}
            <div className="fade-in-up animation-delay-225 relative text-left group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
              <div className="text-3xl font-extrabold text-accent-400 mb-2 transition-colors duration-300 group-hover:text-primary-500">04</div>
              <h4 className="text-base font-bold text-surface-900 mb-2 transition-colors duration-300 group-hover:text-primary-600">Export</h4>
              <p className="text-sm text-surface-500 leading-relaxed">
                Download structured CSV files formatted for SPSS/R or generate academic PDF summary reports for thesis panels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Key Capabilities Section ── */}
      <section id="capabilities" className="py-16 sm:py-20 lg:py-24 bg-surface-50 border-b border-surface-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-2">
              Capabilities
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Engineered for Scientific Precision
            </h3>
            <p className="mt-4 text-surface-600 leading-relaxed">
              Every feature in Acuity is designed around the rigorous requirements of biological research and academic thesis standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Capability 1 */}
            <div className="fade-in-up bg-white rounded-xl border border-surface-200 p-6 shadow-xs group cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:border-primary-200">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold mb-4 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 0 1 10 10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 12a10 10 0 0 0 10 10" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-surface-900 mb-2 transition-colors duration-300 group-hover:text-primary-600">AI Colony Detection</h4>
              <p className="text-sm text-surface-500 leading-relaxed">
                Small-object optimized YOLOv8 model achieves 80%+ target detection F1 across clear agar, nutrient agar, and diverse lighting.
              </p>
            </div>

            {/* Capability 2 */}
            <div className="fade-in-up animation-delay-75 bg-white rounded-xl border border-surface-200 p-6 shadow-xs group cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:border-primary-200">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold mb-4 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-surface-900 mb-2 transition-colors duration-300 group-hover:text-primary-600">Human-in-the-Loop Annotation</h4>
              <p className="text-sm text-surface-500 leading-relaxed">
                Interactive canvas tools allow researchers to manually add missed colonies, adjust spatial boundaries, and delete false positives.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="fade-in-up animation-delay-150 bg-white rounded-xl border border-surface-200 p-6 shadow-xs group cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:border-primary-200">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold mb-4 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-8-6h16" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-surface-900 mb-2 transition-colors duration-300 group-hover:text-primary-600">Morphological Measurement</h4>
              <p className="text-sm text-surface-500 leading-relaxed">
                Spatial calibration converts pixel measurements to millimeters (mm), calculating colony diameter, surface area, and circularity.
              </p>
            </div>

            {/* Capability 4 */}
            <div className="fade-in-up animation-delay-225 bg-white rounded-xl border border-surface-200 p-6 shadow-xs group cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:border-primary-200">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold mb-4 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-surface-900 mb-2 transition-colors duration-300 group-hover:text-primary-600">Multi-Tenant Project Isolation</h4>
              <p className="text-sm text-surface-500 leading-relaxed">
                Laboratory groups operate in isolated tenant workspaces with role-based access control for students, advisers, and administrators.
              </p>
            </div>

            {/* Capability 5 */}
            <div className="fade-in-up animation-delay-300 bg-white rounded-xl border border-surface-200 p-6 shadow-xs group cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:border-primary-200">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold mb-4 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-surface-900 mb-2 transition-colors duration-300 group-hover:text-primary-600">Faculty Review & Verification</h4>
              <p className="text-sm text-surface-500 leading-relaxed">
                Advisers review student submissions with confidence metrics, approve completed datasets, or request re-annotation with audit trails.
              </p>
            </div>

            {/* Capability 6 */}
            <div className="fade-in-up animation-delay-375 bg-white rounded-xl border border-surface-200 p-6 shadow-xs group cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:border-primary-200">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold mb-4 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-surface-900 mb-2 transition-colors duration-300 group-hover:text-primary-600">One-Click Structured Export</h4>
              <p className="text-sm text-surface-500 leading-relaxed">
                Export raw counts, CFU/mL calculations, and morphological parameters directly to CSV formatted for SPSS, GraphPad Prism, and R.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Who Acuity is For ── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white border-b border-surface-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-2">
              Target Users
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Designed for Academic Research Teams
            </h3>
            <p className="mt-4 text-surface-600 leading-relaxed">
              Acuity connects student researchers and faculty advisers through a synchronized, verifiable workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Card */}
            <div className="fade-in-up bg-surface-50 rounded-2xl border border-surface-200 p-8 sm:p-10 flex flex-col justify-between group hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:border-primary-300">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-900 text-xs font-bold mb-4 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
                  For Students & Thesis Groups
                </div>
                <h4 className="text-xl font-bold text-surface-900 mb-3 transition-colors duration-300 group-hover:text-primary-600">
                  Biology Students & Thesis Researchers
                </h4>
                <p className="text-sm text-surface-600 leading-relaxed mb-6">
                  Spend less time manually tallying plates and more time interpreting your experimental results.
                </p>

                <ul className="space-y-3 text-xs sm:text-sm text-surface-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-accent-400/20 text-accent-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold transition-colors duration-300 group-hover:bg-accent-400 group-hover:text-[#0B1F3A]">✓</span>
                    <span>Upload batch Petri dish photos with automatic spatial scale calibration.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-accent-400/20 text-accent-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold transition-colors duration-300 group-hover:bg-accent-400 group-hover:text-[#0B1F3A]">✓</span>
                    <span>Review AI detections on an interactive canvas with fine-grained zoom and pan.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-accent-400/20 text-accent-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold transition-colors duration-300 group-hover:bg-accent-400 group-hover:text-[#0B1F3A]">✓</span>
                    <span>Export structured data files ready for thesis statistical software packages.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-surface-200 transition-colors duration-300 group-hover:border-primary-100">
                <Link
                  to={ROUTES.AUTH.REGISTER}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5 transition-transform duration-300 group-hover:translate-x-1"
                >
                  Create student account →
                </Link>
              </div>
            </div>

            {/* Faculty Card */}
            <div className="fade-in-up animation-delay-75 bg-surface-50 rounded-2xl border border-surface-200 p-8 sm:p-10 flex flex-col justify-between group hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:border-primary-300">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-900 text-xs font-bold mb-4 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
                  For Advisers & Panelists
                </div>
                <h4 className="text-xl font-bold text-surface-900 mb-3 transition-colors duration-300 group-hover:text-primary-600">
                  Faculty Advisers & Reviewers
                </h4>
                <p className="text-sm text-surface-600 leading-relaxed mb-6">
                  Maintain rigorous academic standards with transparent digital audit trails and verification tools.
                </p>

                <ul className="space-y-3 text-xs sm:text-sm text-surface-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold transition-all duration-300 group-hover:bg-accent-400 group-hover:text-[#0B1F3A]">✓</span>
                    <span>Audit student annotations directly on plate images with detection confidence filters.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold transition-all duration-300 group-hover:bg-accent-400 group-hover:text-[#0B1F3A]">✓</span>
                    <span>Approve completed datasets or request specific re-annotation with audit timestamps.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold transition-all duration-300 group-hover:bg-accent-400 group-hover:text-[#0B1F3A]">✓</span>
                    <span>Ensure isolated multi-tenant data governance across multiple thesis advisory groups.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-surface-200 transition-colors duration-300 group-hover:border-primary-100">
                <Link
                  to={ROUTES.AUTH.LOGIN}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5 transition-transform duration-300 group-hover:translate-x-1"
                >
                  Sign in to workspace →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Closing CTA ── */}
      <section className="bg-[#0B1F3A] border-b border-[#05101E]/60 py-16 sm:py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Spend less time counting. <br className="hidden sm:inline" />
            Spend more time <span className="text-accent-400">researching</span>.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-primary-200 max-w-xl mx-auto leading-relaxed">
            Designed for biology thesis groups and academic researchers to automate CFU detection, verify counts interactively, and export publication-ready datasets.
          </p>
          <div className="mt-8">
            <Link
              to={ROUTES.AUTH.REGISTER}
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-lg bg-accent-400 text-[#0B1F3A] hover:bg-accent-300 transition-colors shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900 cursor-pointer"
            >
              Get Started — it&apos;s Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
