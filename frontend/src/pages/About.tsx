import React from 'react';
import PageTitleSection from '@/components/about/PageTitleSection';
import WhoWeAreSection from '@/components/about/WhoWeAreSection';
import StatsSection from '@/components/about/StatsSection';
import CoreOfferingsSection from '@/components/about/CoreOfferingsSection';
import MissionSection from '@/components/about/MissionSection';
import MentorsSection from '@/components/about/MentorsSection';
import CTASection from '@/components/about/CTASection';

export function AboutPage() {
  return (
    <div style={{ position: 'relative', zIndex: 1, backgroundColor: '#fff' }}>
      <div style={{ backgroundColor: 'rgba(32, 52, 91, 0.85)', backdropFilter: 'blur(2px)' }}>
        <PageTitleSection />
        <WhoWeAreSection />
      </div>
      <StatsSection />
      <CoreOfferingsSection />
      <MissionSection />
      <MentorsSection />
      <CTASection />
    </div>
  );
}
