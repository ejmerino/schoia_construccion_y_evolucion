'use client';

import type { CareerInfo } from '@/types';
import { HeroSection } from './sections/hero-section';
import { FeaturesSection } from './sections/features-section';
import { StatsSection } from './sections/stats-section';
import { FeaturedCareersSection } from './sections/featured-careers-section';

interface HomePageClientProps {
  careers: (CareerInfo & { id: string })[];
  stats: {
    universityCount: number;
    careerCount: number;
    subjectCount: number;
  };
}

export function HomePageClient({ careers, stats }: HomePageClientProps) {
  return (
    <div className="flex flex-col items-center bg-background">
      <HeroSection />
      <FeaturesSection />
      <StatsSection stats={stats} />
      <FeaturedCareersSection careers={careers} />
    </div>
  );
}
