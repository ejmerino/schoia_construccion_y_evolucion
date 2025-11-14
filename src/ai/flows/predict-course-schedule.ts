// predict-course-schedule.ts
'use server';

/**
 * @fileOverview Predicts future course schedules based on historical data, course demands, and professor's previous schedules.
 *
 * - predictCourseSchedule - A function that predicts the course schedule.
 * - PredictCourseScheduleInput - The input type for the predictCourseSchedule function.
 * - PredictCourseScheduleOutput - The return type for the predictCourseSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictCourseScheduleInputSchema = z.object({
  courseName: z.string().describe('The name of the course to predict the schedule for.'),
});
export type PredictCourseScheduleInput = z.infer<typeof PredictCourseScheduleInputSchema>;

const PredictCourseScheduleOutputSchema = z.object({
  predictedSchedule: z.string().describe('The predicted course schedule, including semester, time, and professor, with a confidence measure.'),
  confidenceMeasure: z.number().describe('A measure of confidence in the predicted schedule (0-1).'),
});
export type PredictCourseScheduleOutput = z.infer<typeof PredictCourseScheduleOutputSchema>;

export async function predictCourseSchedule(input: PredictCourseScheduleInput): Promise<PredictCourseScheduleOutput> {
  return predictCourseScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictCourseSchedulePrompt',
  input: {schema: PredictCourseScheduleInputSchema},
  output: {schema: PredictCourseScheduleOutputSchema},
  prompt: `You are an AI assistant that predicts future course schedules based on simulated historical data for a university.

  Based on common university scheduling patterns, predict a likely schedule for the course "{{courseName}}". Consider that core subjects are often offered every semester, while specialized ones might be annual.

  Provide the predicted schedule, including semester, time, and a generic professor name like "Prof. por Asignar", along with a confidence measure (0-1).
  Follow the schema.
  `,
});

const predictCourseScheduleFlow = ai.defineFlow(
  {
    name: 'predictCourseScheduleFlow',
    inputSchema: PredictCourseScheduleInputSchema,
    outputSchema: PredictCourseScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
