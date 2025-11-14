import { getCareers, getUniversity } from '@/lib/data';
import { CareersPageClient } from '@/components/careers/careers-page-client';
import type { Metadata, ResolvingMetadata } from 'next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Building2 } from 'lucide-react';
import Link from 'next/link';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const universityId = searchParams.university as string;
  if (!universityId) {
    return {
      title: 'Seleccionar Universidad - SchoIA+',
    };
  }
  const university = await getUniversity(universityId);
  const universityName = university?.nombre || 'Universidad';
  return {
    title: `Carreras en ${universityName} - SchoIA+`,
    description: `Explora las carreras disponibles en ${universityName} y empieza a planificar tu futuro académico.`,
  };
}


export default async function CareersPage({ searchParams }: Props) {
  const universityId = searchParams.university as string;

  if (!universityId) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
             <Alert className="max-w-lg mx-auto">
                <Building2 className="h-4 w-4" />
                <AlertTitle>No se ha especificado una universidad.</AlertTitle>
                <AlertDescription>
                    Por favor, <Link href="/universities" className="font-bold underline hover:text-primary">selecciona una universidad</Link> para ver sus carreras.
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  const careers = await getCareers(universityId);
  const university = await getUniversity(universityId);

  return <CareersPageClient careers={careers} university={university} />;
}
