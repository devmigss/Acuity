/**
 * Acuity — Landing Page
 *
 * Assembles the public-facing landing page sections.
 * Wrapped by PublicLayout which provides Navbar and Footer.
 */

import Hero from '@/components/landing/Hero'
import FeatureCards from '@/components/landing/FeatureCards'
import HowItWorks from '@/components/landing/HowItWorks'
import CTASection from '@/components/landing/CTASection'

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeatureCards />
      <HowItWorks />
      <CTASection />
    </>
  )
}
