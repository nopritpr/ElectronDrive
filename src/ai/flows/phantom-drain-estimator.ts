
'use server';

/**
 * @fileOverview An AI agent that predicts overnight battery drain (phantom drain)
 * by simulating an anomaly detection model on idle vehicle data.
 *
 * - estimatePhantomDrain - A function that analyzes idle periods and predicts drain.
 * - PhantomDrainInput - The input type for the estimatePhantomDrain function.
 * - PhantomDrainOutput - The return type for the estimatePhantomDrain function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const PhantomDrainInputSchema = z.object({
  idleHistory: z
    .array(
      z.object({
        durationMinutes: z.number().describe('The duration the vehicle was idle in minutes.'),
        socDrop: z.number().describe('The battery State of Charge (SOC) drop during that idle period.'),
      })
    )
    .describe('A history of idle periods and the corresponding SOC drop.'),
});
export type PhantomDrainInput = z.infer<typeof PhantomDrainInputSchema>;

const PhantomDrainOutputSchema = z.object({
  predictedDrainPercentage: z
    .number()
    .describe('The predicted battery percentage loss over a typical 8-hour overnight period.'),
  isAnomaly: z
    .boolean()
    .describe('Whether the current drain rate is considered anomalous (higher than a learned baseline).'),
  reasoning: z
    .string()
    .describe('A brief explanation if the drain is anomalous.'),
});
export type PhantomDrainOutput = z.infer<typeof PhantomDrainOutputSchema>;

export async function estimatePhantomDrain(input: PhantomDrainInput): Promise<PhantomDrainOutput> {
  return phantomDrainEstimatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'phantomDrainEstimatorPrompt',
  input: {schema: PhantomDrainInputSchema},
  output: {schema: PhantomDrainOutputSchema},
  config: {
    model: googleAI.model('gemini-pro'),
  },
  prompt: `You are an expert AI system simulating an anomaly detection model for an electric vehicle's phantom drain. Your task is to analyze historical idle data and predict the expected overnight battery loss.

A normal phantom drain for an 8-hour period is between 0.5% and 1.0% SOC. This is due to background processes like the battery management system, security, and connectivity.

Analyze the following idle history data:
{{{json idleHistory}}}

Based on this data, calculate the average drain rate per hour. Project this rate over an 8-hour period to determine the 'predictedDrainPercentage'.

Then, determine if this predicted drain is an anomaly. An anomalous drain would be anything significantly higher than the typical 1.0% for 8 hours (e.g., above 1.5%).
- If the predicted drain is anomalous, set 'isAnomaly' to true and provide a brief 'reasoning', such as "Higher than normal background draw detected, suggesting a potential issue."
- If the drain is normal, set 'isAnomaly' to false and provide a simple 'reasoning' like "Drain rate is within normal operational parameters."`,
});

const phantomDrainEstimatorFlow = ai.defineFlow(
  {
    name: 'phantomDrainEstimatorFlow',
    inputSchema: PhantomDrainInputSchema,
    outputSchema: PhantomDrainOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
