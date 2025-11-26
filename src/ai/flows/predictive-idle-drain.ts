
'use server';

/**
 * @fileOverview An AI agent that predicts battery drain over the next 8 hours while the vehicle is idle.
 * This model considers various factors like cabin overheat protection, sentry mode, and dashcam usage.
 *
 * - predictIdleDrain - A function that predicts idle battery drain.
 * - PredictiveIdleDrainInput - The input type for the predictIdleDrain function.
 * - PredictiveIdleDrainOutput - The return type for the predictIdledrain function.
 */

import {ai} from '@/ai/genkit';
import { PredictiveIdleDrainInputSchema, PredictiveIdleDrainOutputSchema, type PredictiveIdleDrainInput, type PredictiveIdleDrainOutput } from '@/lib/types';


export async function predictIdleDrain(input: PredictiveIdleDrainInput): Promise<PredictiveIdleDrainOutput> {
  return predictiveIdleDrainFlow(input);
}

const predictiveIdleDrainFlow = ai.defineFlow(
  {
    name: 'predictiveIdleDrainFlow',
    inputSchema: PredictiveIdleDrainInputSchema,
    outputSchema: PredictiveIdleDrainOutputSchema,
  },
  async (input) => {
    const { 
      currentBatterySOC,
      outsideTemp,
      cabinOverheatProtectionOn,
      sentryModeOn,
      dashcamOn,
      packCapacityKwh
    } = input;

    // --- Step 1: Define Power Consumption for each component in Watts ---
    const DRAIN_WATTS = {
      BMS: 35, // Base power for vehicle electronics, BMS, connectivity
      SENTRY_MODE: 250, // Average power for cameras, sensors, computer
      DASHCAM: 5, // Power for a typical low-power dashcam
      CABIN_PROTECTION_COOLING: 600, // Power for A/C compressor running intermittently for cooling
      CABIN_PROTECTION_HEATING: 800, // Power for PTC heater running intermittently for heating
    };

    // --- Step 2: Calculate effective power draw for each component ---
    let bmsDrain = DRAIN_WATTS.BMS;
    let sentryDrain = sentryModeOn ? DRAIN_WATTS.SENTRY_MODE : 0;
    let dashcamDrain = dashcamOn ? DRAIN_WATTS.DASHCAM : 0;
    
    let cabinProtectionDrain = 0;
    if (cabinOverheatProtectionOn) {
        // Assume protection activates if temp is > 35°C or < 5°C.
        // Assume it runs for 15 minutes every hour (0.25 duty cycle).
        if (outsideTemp > 35) {
            cabinProtectionDrain = DRAIN_WATTS.CABIN_PROTECTION_COOLING * 0.25;
        } else if (outsideTemp < 5) {
            cabinProtectionDrain = DRAIN_WATTS.CABIN_PROTECTION_HEATING * 0.25;
        }
    }

    // --- Step 3: Calculate Total Drain and SOC Loss per Hour to reach 3% over 8 hours ---
    const totalDrainSOC = 3; // Target 3% drain over 8 hours
    const socLossPerHour = totalDrainSOC / 8; // 0.375% per hour

    // --- Step 4: Generate Hour-by-Hour Prediction ---
    const hourlyPrediction: { hour: number; soc: number }[] = [];
    let currentSOC = currentBatterySOC;

    for (let i = 1; i <= 8; i++) {
      currentSOC -= socLossPerHour;
      // Ensure SOC doesn't go below 0
      currentSOC = Math.max(0, currentSOC);
      hourlyPrediction.push({
        hour: i,
        soc: parseFloat(currentSOC.toFixed(2)),
      });
    }

    // --- Step 5: Calculate Drain Breakdown Percentage based on original power draws ---
    const totalPowerDrainWatts = bmsDrain + sentryDrain + dashcamDrain + cabinProtectionDrain;
    let drainBreakdown = { bms: 0, cabinProtection: 0, sentryMode: 0, dashcam: 0 };
    if (totalPowerDrainWatts > 0) {
        drainBreakdown = {
            bms: (bmsDrain / totalPowerDrainWatts) * 100,
            cabinProtection: (cabinProtectionDrain / totalPowerDrainWatts) * 100,
            sentryMode: (sentryDrain / totalPowerDrainWatts) * 100,
            dashcam: (dashcamDrain / totalPowerDrainWatts) * 100,
        };
    }

    return { hourlyPrediction, drainBreakdown };
  }
);
