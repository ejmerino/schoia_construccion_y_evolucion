import { HomePageClient } from '@/components/landing/home-page-client';
import { getCareers, getStats } from '@/lib/data';

export default async function Home() {
  const careers = await getCareers('espe');
  const stats = await getStats();

  return <HomePageClient careers={careers} stats={stats} />;
}
