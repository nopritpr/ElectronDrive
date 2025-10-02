import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {groq} from 'genkitx-groq';

export const ai = genkit({
  plugins: [
    googleAI(),
    groq,
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
