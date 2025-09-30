'use server';

/**
 * @fileOverview Estimates the remaining range of an EV based on driving style, climate control settings, and weather data.
 *
 * - predictRange - A function that takes driving behavior, climate control settings, and weather data as input, and estimates the remaining range.
 * - PredictiveRangeInput - The input type for the predictRange function.
 * - PredictiveRangeOutput - The return type for the predictRange function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveRangeInputSchema = z.object({
  drivingStyle: z.string().describe('The driving style of the user (e.g., aggressive, moderate, eco).'),
  climateControlSettings: z.object({
    acUsage: z.number().describe('The percentage of time the air conditioning is used.'),
    temperatureSetting: z.number().describe('The temperature setting of the climate control system (in Celsius).'),
  }).describe('The climate control settings of the vehicle.'),
  weatherData: z.object({
    temperature: z.number().describe('The current temperature (in Celsius).'),
    precipitation: z.string().describe('The current precipitation conditions (e.g., sunny, rainy, snowy).'),
    windSpeed: z.number().describe('The current wind speed (in km/h).'),
  }).describe('The current weather conditions.'),
  historicalData: z.array(z.object({
    speed: z.number(),
    powerConsumption: z.number(),
  })).describe('Historical driving data, including speed and power consumption.'),
  batteryCapacity: z.number().describe('The current battery capacity in kWh'),
  currentBatteryLevel: z.number().describe('The current battery level as a percentage'),
});
export type PredictiveRangeInput = z.infer<typeof PredictiveRangeInputSchema>;

const PredictiveRangeOutputSchema = z.object({
  estimatedRange: z.number().describe('The estimated remaining range of the EV (in kilometers).'),
  confidenceLevel: z.number().describe('A value between 0 and 1 indicating the confidence level of the range estimation.'),
  recommendations: z.array(z.string()).describe('A list of driving recommendations to improve energy efficiency.'),
});
export type PredictiveRangeOutput = z.infer<typeof PredictiveRangeOutputSchema>;

export async function predictRange(input: PredictiveRangeInput): Promise<PredictiveRangeOutput> {
  return predictiveRangeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveRangePrompt',
  input: {schema: PredictiveRangeInputSchema},
  output: {schema: PredictiveRangeOutputSchema},
  prompt: `You are an expert EV range estimator. Given the following information about a user's driving style, climate control settings, weather data, and historical data, estimate the remaining range of the EV.

Driving Style: {{{drivingStyle}}}
Climate Control Settings: A/C Usage: {{{climateControlSettings.acUsage}}}%, Temperature Setting: {{{climateControlSettings.temperatureSetting}}}°C
Weather Data: Temperature: {{{weatherData.temperature}}}°C, Precipitation: {{{weatherData.precipitation}}}, Wind Speed: {{{weatherData.windSpeed}}} km/h
Historical Data: {{#each historicalData}}Speed: {{{speed}}}, Power Consumption: {{{powerConsumption}}}; {{/each}}
Battery Capacity: {{{batteryCapacity}}} kWh
Current Battery Level: {{{currentBatteryLevel}}}%

Consider all these factors to estimate the remaining range as accurately as possible. Also, provide a confidence level for your estimation (0-1) and give a few practical recommendations to the user to improve their energy efficiency.

Ensure that the estimatedRange returned is in kilometers.
`,
});

const predictiveRangeFlow = ai.defineFlow(
  {
    name: 'predictiveRangeFlow',
    inputSchema: PredictiveRangeInputSchema,
    outputSchema: PredictiveRangeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
