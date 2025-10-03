
'use server';

/**
 * @fileOverview Predicts the impact of A/C usage on driving range.
 *
 * - getAcUsageImpact - A function that returns the predicted range impact of A/C usage.
 * - AcUsageImpactInput - The input type for the getAcUsageImpact function.
 * - AcUsageImpactOutput - The return type for the getAcUsageImpact function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AcUsageImpactInputSchema = z.object({
  acOn: z.boolean().describe('Whether the A/C is currently active.'),
  acTemp: z.number().describe('The A/C temperature setting in Celsius.'),
  outsideTemp: z.number().describe('The current outside temperature in Celsius.'),
  recentEfficiency: z.number().describe('The recent average energy consumption in Watt-hours per kilometer.'),
});
export type AcUsageImpactInput = z.infer<typeof AcUsageImpactInputSchema>;

const AcUsageImpactOutputSchema = z.object({
  rangeImpactKm: z.number().describe('The predicted range change in kilometers over the next hour. Positive if range is gained (e.g., by turning A/C off), negative if lost (e.g., by turning A/C on).'),
  recommendation: z.string().describe('A brief, actionable recommendation based on the A/C impact.'),
});
export type AcUsageImpactOutput = z.infer<typeof AcUsageImpactOutputSchema>;

export async function getAcUsageImpact(input: AcUsageImpactInput): Promise<AcUsageImpactOutput> {
  return acUsageImpactFlow(input);
}

const RecommendationPromptInputSchema = z.object({
    acOn: z.boolean(),
    acTemp: z.number(),
    calculatedImpact: z.number(),
    outsideTemp: z.number(),
});

const recommendationPrompt = ai.definePrompt({
  name: 'acUsageRecommendationPrompt',
  input: {schema: RecommendationPromptInputSchema},
  output: {schema: z.object({ recommendation: z.string() })},
  prompt: `You are an EV energy efficiency expert. Based on a calculated hourly range impact of {{calculatedImpact}} km, provide a single, concise, and helpful recommendation.

The user's A/C is currently {{#if acOn}}On at {{acTemp}}°C{{else}}Off{{/if}}.
The outside temperature is {{outsideTemp}}°C.

Example Recommendations:
- If impact is high and negative: "High A/C usage is significantly reducing your range. Consider increasing the temperature to save range."
- If impact is low: "Your A/C usage is efficient. No changes needed."
- If A/C is off, but the potential impact of turning it on is high: "Turning on the A/C now would reduce your range by approximately {{calculatedImpact}} km per hour."

Generate ONLY the JSON object with the 'recommendation' field. Be creative and helpful.`,
});


const acUsageImpactFlow = ai.defineFlow(
  {
    name: 'acUsageImpactFlow',
    inputSchema: AcUsageImpactInputSchema,
    outputSchema: AcUsageImpactOutputSchema,
  },
  async (input) => {
    // --- Step 1: Perform all calculations directly in TypeScript for reliability. ---
    const { acOn, acTemp, outsideTemp, recentEfficiency } = input;
    
    // Use a fallback if efficiency is zero to prevent division by zero errors
    const vehicleEfficiencyWhPerKm = recentEfficiency > 0 ? recentEfficiency : 160; 
    
    const MAX_AC_POWER_KW = 1.5; // More realistic max power for A/C compressor

    // Calculate Temperature Differential
    const tempDiff = Math.abs(outsideTemp - acTemp);

    // Calculate AC Duty Cycle and Power Consumption
    const dutyCycle = Math.min(1.0, tempDiff / 15.0); // Less aggressive duty cycle scaling
    const acPowerKw = dutyCycle * MAX_AC_POWER_KW;

    // Calculate energy consumed by AC in one hour
    const acEnergyWh = acPowerKw * 1000;

    // Calculate the range that could have been driven with that energy
    const potentialImpactKm = acEnergyWh / vehicleEfficiencyWhPerKm;

    // --- Step 2: Determine Final Output based on A/C status ---
    // If A/C is ON, the impact is a loss (negative).
    // If A/C is OFF, we show the potential impact *if it were turned on* (also as a negative, representing potential loss).
    const finalImpactKm = -Math.abs(potentialImpactKm);

    // --- Step 3: Use the AI *only* to generate the human-friendly recommendation text. ---
    // If A/C is off, we want to recommend what happens if they turn it on (negative impact)
    // If A/C is on, we want to recommend what happens if they turn it off (positive impact)
    let recommendationImpact = finalImpactKm;
    if (acOn) {
        // If A/C is on, the recommendation should be about the *gain* from turning it off
        recommendationImpact = Math.abs(finalImpactKm);
    }
    
    const { output } = await recommendationPrompt({
      acOn: acOn,
      acTemp: acTemp,
      outsideTemp: outsideTemp,
      calculatedImpact: recommendationImpact,
    });

    const recommendation = output?.recommendation ?? "Adjust A/C for optimal range.";

    // The component always shows the *current cost* of the A/C. If it's on, it's a loss. If it's off, the cost is 0.
    // The recommendation is separate.
    return {
      rangeImpactKm: acOn ? parseFloat(finalImpactKm.toFixed(1)) : 0,
      recommendation: recommendation,
    };
  }
);
