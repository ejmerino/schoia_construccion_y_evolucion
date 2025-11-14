
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MateriasClient } from "./materias-client";
import { CareersClient } from "./careers-client";
import { UniversitiesClient } from "./universities-client";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Materia, CareerInfo, University } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

export default function ManagementPage() {
    const { userProfile } = useAuth();
    const [universities, setUniversities] = useState<University[]>([]);
    const [careers, setCareers] = useState<CareerInfo[]>([]);
    const [materias, setMaterias] = useState<Materia[]>([]);
    
    const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
    const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
    const [semesterFilter, setSemesterFilter] = useState<string>('all');

    const [isLoading, setIsLoading] = useState({ universities: true, careers: false, materias: false });

    // Fetch Universities
    const fetchUniversities = useCallback(async () => {
        setIsLoading(prev => ({ ...prev, universities: true }));
        try {
            const universitiesRef = collection(db, 'universidades');
            const q = query(universitiesRef, orderBy('nombre'));
            const querySnapshot = await getDocs(q);
            const fetched = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as University));
            setUniversities(fetched);
        } catch (error) {
            console.error("Failed to fetch universities:", error);
        } finally {
            setIsLoading(prev => ({ ...prev, universities: false }));
        }
    }, []);

    useEffect(() => {
        fetchUniversities();
    }, [fetchUniversities]);

    // Fetch Careers when University changes
    const fetchCareers = useCallback(async (universityId: string) => {
        setIsLoading(prev => ({...prev, careers: true}));
        setCareers([]);
        setSelectedCareerId(null);
        try {
            const careersRef = collection(db, 'universidades', universityId, 'carreras');
            const q = query(careersRef, orderBy('nombre'));
            const querySnapshot = await getDocs(q);
            const fetched = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as CareerInfo));
            setCareers(fetched);
        } catch (error) {
            console.error("Failed to fetch careers:", error);
        } finally {
            setIsLoading(prev => ({ ...prev, careers: false }));
        }
    }, []);

    useEffect(() => {
        if (selectedUniversityId) {
            fetchCareers(selectedUniversityId);
        }
    }, [selectedUniversityId, fetchCareers]);

    // Fetch Subjects when Career changes
     const fetchMaterias = useCallback(async (universityId: string, careerId: string) => {
        setIsLoading(prev => ({...prev, materias: true}));
        try {
            const materiasRef = collection(db, 'universidades', universityId, 'carreras', careerId, 'materias');
            const querySnapshot = await getDocs(materiasRef);
            const fetchedMaterias = querySnapshot.docs.map(docSnapshot => ({
                id: docSnapshot.id,
                ...docSnapshot.data()
            } as Materia));
            setMaterias(fetchedMaterias);
        } catch (error) {
            console.error("Failed to fetch materias:", error);
        } finally {
             setIsLoading(prev => ({ ...prev, materias: false}));
        }
    }, []);

    useEffect(() => {
        if (selectedUniversityId && selectedCareerId) {
            fetchMaterias(selectedUniversityId, selectedCareerId);
        } else {
            setMaterias([]); // Clear subjects if no career is selected
        }
    }, [selectedUniversityId, selectedCareerId, fetchMaterias]);
    
    // Reset semester filter when career changes
    useEffect(() => {
        setSemesterFilter('all');
    }, [selectedCareerId]);

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Contenido</h1>
        <p className="text-muted-foreground">Administra la información académica de la plataforma.</p>
      </div>
      <Tabs defaultValue="universities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="universities" disabled={userProfile?.role !== 'Superadmin'}>Universidades</TabsTrigger>
          <TabsTrigger value="careers">Carreras</TabsTrigger>
          <TabsTrigger value="materias">Materias</TabsTrigger>
        </TabsList>

        <TabsContent value="universities">
           {isLoading.universities ? (
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                    <CardContent><Skeleton className="h-40 w-full" /></CardContent>
                </Card>
           ) : (
             <UniversitiesClient initialUniversities={universities} onDataChange={fetchUniversities} />
           )}
        </TabsContent>

        <TabsContent value="careers" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Paso 1: Selecciona una Universidad</CardTitle>
                </CardHeader>
                <CardContent>
                     {isLoading.universities ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        <Select onValueChange={(value) => { setSelectedUniversityId(value); setSelectedCareerId(null); }} value={selectedUniversityId || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Elige una universidad..." />
                            </SelectTrigger>
                            <SelectContent>
                                {universities.map(uni => (
                                    <SelectItem key={uni.id} value={uni.id}>
                                        {uni.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>
             {selectedUniversityId && (
                isLoading.careers ? (
                    <Card><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
                ) : (
                    <CareersClient
                        initialCareers={careers}
                        universityId={selectedUniversityId}
                        role={userProfile?.role}
                        onDataChange={() => fetchCareers(selectedUniversityId)}
                    />
                )
             )}
        </TabsContent>

        <TabsContent value="materias" className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>Paso 1: Selecciona Universidad y Carrera</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    {isLoading.universities ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        <Select onValueChange={(value) => { setSelectedUniversityId(value); setSelectedCareerId(null); }} value={selectedUniversityId || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Elige una universidad..." />
                            </SelectTrigger>
                            <SelectContent>
                                {universities.map(uni => (
                                    <SelectItem key={uni.id} value={uni.id}>
                                        {uni.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                     {selectedUniversityId && (
                        isLoading.careers ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select onValueChange={setSelectedCareerId} value={selectedCareerId || ''} disabled={!selectedUniversityId || careers.length === 0}>
                                <SelectTrigger>
                                    <SelectValue placeholder={careers.length > 0 ? "Elige una carrera..." : "No hay carreras disponibles"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {careers.map(career => (
                                        <SelectItem key={career.id} value={career.id}>
                                            {career.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )
                    )}
                </CardContent>
            </Card>
            
            {selectedUniversityId && selectedCareerId && (
                isLoading.materias ? (
                     <Card>
                        <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                        <CardContent><Skeleton className="h-40 w-full" /></CardContent>
                    </Card>
                ) : (
                    <MateriasClient 
                        initialMaterias={materias} 
                        universityId={selectedUniversityId} 
                        careerId={selectedCareerId}
                        onDataChange={() => fetchMaterias(selectedUniversityId, selectedCareerId)}
                        semesterFilter={semesterFilter}
                        setSemesterFilter={setSemesterFilter}
                    />
                )
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
