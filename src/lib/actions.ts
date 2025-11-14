
'use server';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { ContactSubmission } from '@/types';

// --- Contact Form Actions ---

const contactFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Por favor ingresa un correo electrónico válido.'),
  subject: z.string(),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres.'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export async function submitContactForm(data: ContactFormData): Promise<{ success: boolean; error?: string }> {
  try {
    const validatedData = contactFormSchema.parse(data);
    const submissionsRef = collection(db, 'contactSubmissions');
    
    await addDoc(submissionsRef, {
      ...validatedData,
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error submitting contact form:', error);
    if (error instanceof z.ZodError) {
        return { success: false, error: 'Los datos del formulario son inválidos.' };
    }
    return { success: false, error: `Error en el servidor: ${error.message}` };
  }
}
