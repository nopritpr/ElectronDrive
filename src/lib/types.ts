
import { z } from 'genkit';

export const PredictiveIdleDrainInputSchema = z.object({
  currentBatterySOC: z.number().describe('The current battery State of Charge (percentage).'),
  outsideTemp: z.number().describe('The current outside temperature in Celsius.'),
  cabinOverheatProtectionOn: z.boolean().describe('Whether cabin overheat protection is active.'),
  sentryModeOn: z.boolean().describe('Whether sentry mode or a security system is active.'),
  dashcamOn: z.boolean().describe('Whether a dashcam is recording while parked.'),
  packCapacityKwh: z.number().describe('The total capacity of the battery pack in kWh.'),
});
export type PredictiveIdleDrainInput = z.infer<typeof PredictiveIdleDrainInputSchema>;

export const PredictiveIdleDrainOutputSchema = z.object({
  hourlyPrediction: z.array(
    z.object({
      hour: z.number().describe('The hour from now (e.g., 1, 2, 3...).'),
      soc: z.number().describe('The predicted State of Charge (SOC) at that hour.'),
    })
  ).length(8).describe('An array of 8 objects, each representing the predicted SOC for the next 8 hours.'),
  drainBreakdown: z.object({
      bms: z.number().describe('The percentage of drain attributed to the Battery Management System and base vehicle functions.'),
      cabinProtection: z.number().describe('The percentage of drain attributed to Cabin Overheat Protection.'),
      sentryMode: z.number().describe('The percentage of drain attributed to Sentry Mode.'),
      dashcam: z.number().describe('The percentage of drain attributed to the Dashcam.'),
  }).describe('A breakdown of what caused the predicted drain over the 8-hour period.')
});
export type PredictiveIdleDrainOutput = z.infer<typeof PredictiveIdleDrainOutputSchema>;


export type DriveMode = 'Eco' | 'City' | 'Sports';

export interface ChargingLog {
  startTime: number;
  endTime: number;
  startSOC: number;
  endSOC: number;
  energyAdded: number;
}

export interface SohHistoryEntry {
  odometer: number;
  cycleCount: number;
  avgBatteryTemp: number;
  soh?: number; // SOH is now optional as it might not be present in every entry
  ecoPercent: number;
  cityPercent: number;
  sportsPercent: number;
}

export interface IdlePeriod {
    durationMinutes: number;
    socDrop: number;
}


export type VehiclePhysics = {
  acceleration: number;
  inertiaFactor: number;
  brakingApplied: boolean;
  regenActive: boolean;
  regenPower: number;
};

export interface WeatherListItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

export interface FiveDayForecast {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherListItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface WeatherData {
  weather: {
    main: string;
    icon: string;
  }[];
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  coord: {
    lat: number;
    lon: number;
  },
  name: string;
}

export interface RangePenalties {
  ac: number;
  load: number;
  temp: number;
  driveMode: number;
}

export interface VehicleState {
  odometer: number;
  tripA: number;
  tripB: number;
  activeTrip: 'A' | 'B';
  batterySOC: number;
  range: number;
  initialRange: number;
  driveMode: DriveMode;
  acOn: boolean;
  acTemp: number;
  passengers: number;
  goodsInBoot: boolean;
  chargingLogs: ChargingLog[];
  lastChargeLog?: { startTime: number; startSOC: number };
  speed: number;
  power: number;
  efficiency: number;
  ecoScore: number;
  batteryCapacity_kWh: number;
  lastUpdate: number;
  displaySpeed: number;
  outsideTemp: number;
  insideTemp: number;
  speedHistory: number[];
  accelerationHistory: number[];
  powerHistory: number[];
  energyConsumptionHistory: number[];
  driveModeHistory: DriveMode[];
  idleHistory: IdlePeriod[];
  lastStyleClassificationTime: number;
  aggressiveDrivingCounter: number;
  stabilizerEnabled: boolean;
  rawPredictedRange: number | null;
  sohHistory: SohHistoryEntry[];
  packNominalCapacity_kWh: number;
  packUsableFraction: number;
  packSOH: number;
  equivalentFullCycles: number;
  cumulativeEnergyOut_kWh: number;
  cumulativeEnergyIn_kWh: number;
  batteryTemp: number;
  drivetrainEfficiency: number;
  regenEfficiencyDynamic: number;
  thermalThrottleFactor: number;
  regenLimitFactor: number;
  recentWhPerKm: number;
  recentWhPerKmWindow: number[];
  styleMetrics: {
    aggression: number;
    smoothness: number;
    regenShare: number;
    harshEvents: number;
    harshBrakes: number;
    harshAccel: number;
  };
  lastDegradationUpdate: number;
  lastRangeModelUpdate: number;
  predictedEcoRange: number;
  predictedDynamicRange: number;
  limpMode: boolean;
  powerLimit_kW: number;
  voltageNominal: number;
  internalResistance: number;
  lastSOHUpdate: number;
  lastRangeSpeed: number;
  lastRawDynamicRange: number | null;
  isCharging: boolean;
  weather: WeatherData | null;
  weatherForecast: FiveDayForecast | null;
  rangePenalties: RangePenalties;
  dashcamOn: boolean;
  sentryModeOn: boolean;
  cabinOverheatProtectionOn: boolean;
}


export interface AcUsageImpactOutput {
  rangeImpactKm: number;
  recommendation: string;
  reasoning: string;
}

const WeatherDayInputSchema = z.object({
    temp: z.number().describe('The average temperature for the day in Celsius.'),
    precipitation: z.string().describe('The type of precipitation (e.g., Rain, Snow, None).'),
    windSpeed: z.number().describe('The average wind speed in km/h.'),
});

export const GetWeatherImpactInputSchema = z.object({
  currentSOC: z.number().describe('The current battery State of Charge (percentage).'),
  initialRange: z.number().describe('The vehicle\'s ideal range on a full charge in kilometers.'),
  forecast: z.array(WeatherDayInputSchema).length(5).describe('A 5-day weather forecast.'),
});
export type GetWeatherImpactInput = z.infer<typeof GetWeatherImpactInputSchema>;

export const GetWeatherImpactOutputSchema = z.object({
  dailyImpacts: z.array(z.object({
    day: z.string().describe('The day of the week (e.g., "Monday").'),
    rangePenaltyKm: z.number().describe('The total estimated range penalty for that day in kilometers. Should be a negative number.'),
    reason: z.string().describe('A brief, user-friendly explanation for the penalty.'),
  })).length(5).describe('An array of 5 objects, each representing the weather impact for a day.'),
});
export type GetWeatherImpactOutput = z.infer<typeof GetWeatherImpactOutputSchema>;


export interface AiState {
  drivingRecommendation: string;
  drivingRecommendationJustification: string | null;
  drivingStyle: string;
  drivingStyleRecommendations: string[];
  fatigueWarning: string | null;
  fatigueLevel: number;
  idleDrainPrediction: PredictiveIdleDrainOutput | null;
  acUsageImpact: AcUsageImpactOutput | null;
  weatherImpact: GetWeatherImpactOutput | null;
}
