import TrustBar from './TrustBar';
import ComplianceTrustSection from './ComplianceTrustSection';
import ClientSection from './ClientSection';
import ProblemSection from './ProblemSection';
import ServicesSection from './ServicesSection';
import CapabilitiesShowcaseSection from './CapabilitiesShowcaseSection';
import WhyInteleraSection from './WhyInteleraSection';
import DifferentiatorStrip from './DifferentiatorStrip';
import HowWeWork from './HowWeWork';
import IndustriesSection from './IndustriesSection';
import CaseStudyPreview from './CaseStudyPreview';
import ResourcesInsightsSection from './ResourcesInsightsSection';
import HomeFAQSection from './HomeFAQSection';
import TestimonialSection from './TestimonialSection';
import FinalCTASection from './FinalCTASection';

/** Everything below the hero — lazy-loaded so LCP + first paint stay fast. */
export default function HomeBelowFold() {
  return (
    <>
      <TrustBar />
      <ComplianceTrustSection />
      <ClientSection />
      <ProblemSection />
      <ServicesSection />
      <CapabilitiesShowcaseSection />
      <WhyInteleraSection />
      <DifferentiatorStrip />
      <HowWeWork />
      <IndustriesSection />
      <CaseStudyPreview />
      <ResourcesInsightsSection />
      <HomeFAQSection />
      <TestimonialSection />
      <FinalCTASection />
    </>
  );
}
