import { getUniversities } from '@/lib/data';
import { UniversitiesClient } from './universities-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Universidades - SchoIA+',
  description: 'Explora todas las universidades disponibles en nuestra plataforma.',
};

export default async function UniversitiesPage() {
  let universities = await getUniversities();
  // TODO: Remove this filter once more universities have complete data
  universities = universities.filter(u => u.id === 'espe');
  return <UniversitiesClient universities={universities} />;
}
