
'use server';

/**
 * @fileOverview Predicts the impact of A/C usage on driving range using a regression model.
 *
 * - getAcUsageImpact - A function that returns the predicted range impact of A/C usage.
 * - AcUsageImpactInput - The input type for the getAcUsageImpact function.
 * - AcUsageImpactOutput - The return type for the getAcUsageImpact function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const AcUsageImpactInputSchema = z.object({
  acOn: z.boolean().describe('Whether the A/C is currently active.'),
  acTemp: z.number().describe('The A/C temperature setting in Celsius.'),
  outsideTemp: z.number().describe('The current outside temperature in Celsius.'),
  recentWhPerKm: z.number().describe('The recent average energy consumption in Watt-hours per kilometer.'),
});
export type AcUsageImpactInput = z.infer<typeof AcUsageImpactInputSchema>;

const AcUsageImpactOutputSchema = z.object({
  rangeImpactKm: z.number().describe('The predicted range change in kilometers over the next hour, based on a regression model. Positive if range is gained (e.g., by turning A/C off), negative if lost (e.g., by turning A/C on).'),
  recommendation: z.string().describe('A brief, actionable recommendation based on the A/C impact.'),
});
export type AcUsageImpactOutput = z.infer<typeof AcUsageImpactOutputSchema>;

export async function getAcUsageImpact(input: AcUsageImpactInput): Promise<AcUsageImpactOutput> {
  return acUsageImpactFlow(input);
}

const acUsageImpactPrompt = ai.definePrompt({
  name: 'acUsageImpactPrompt',
  input: {schema: AcUsageImpactInputSchema},
  output: {schema: AcUsageImpactOutputSchema},
  config: {
    model: googleAI.model('gemini-pro'),
  },
  prompt: `You are an EV energy regression model. Your task is to calculate the range impact of the A/C over the next hour using a specific regression formula.

Current Vehicle & Environmental Data:
- A/C Status: {{#if acOn}}On{{else}}Off{{/if}} (acOn: {{acOn}})
- A/C Temperature: {{acTemp}}°C
- Outside Temperature: {{outsideTemp}}°C
- Recent Efficiency: {{recentWhPerKm}} Wh/km

Regression Model:
Range_Impact = β₀ + β₁×Temp_Diff + β₂×AC_Power + β₃×Efficiency

Coefficients:
β₀ = -2.5
β₁ = 2.1
β₂ = 5.8
β₃ = -0.03
Max_AC_Power = 3.0 kW

Follow these steps precisely:
1.  **Calculate Temperature Differential (Temp_Diff)**:
    Temp_Diff = abs({{outsideTemp}} - {{acTemp}})

2.  **Calculate A/C Power Consumption (AC_Power)**:
    Duty_Cycle = min(1.0, Temp_Diff / 10.0)
    AC_Power (kW) = Duty_Cycle × 3.0

3.  **Apply the Regression Formula**:
    Calculated_Impact = -2.5 + (2.1 * Temp_Diff) + (5.8 * AC_Power) + (-0.03 * {{recentWhPerKm}})

4.  **Determine Final Output**:
    - If the A/C is ON ('{{acOn}}' is true), the 'rangeImpactKm' is the 'Calculated_Impact' as a NEGATIVE number, because range is being lost.
    - If the A/C is OFF ('{{acOn}}' is false), the 'rangeImpactKm' is the 'Calculated_Impact' as a POSITIVE number, representing the potential range loss if it were turned on.
    - The final 'rangeImpactKm' value should be rounded to one decimal place.
    - Generate a helpful, concise 'recommendation' based on the impact. For example, if A/C is on, suggest increasing the temperature to save range.

Execute the calculation with the provided data and return ONLY the JSON object.`,
});

const acUsageImpactFlow = ai.defineFlow(
  {
    name: 'acUsageImpactFlow',
    inputSchema: AcUsageImpactInputSchema,
    outputSchema: AcUsageImpactOutputSchema,
  },
  async input => {
    const {output} = await acUsageImpactPrompt(input);
    return output!;
  }
);
