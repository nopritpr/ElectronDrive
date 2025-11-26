
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import EcoScoreGauge from "../charts/eco-score-gauge";
import type { VehicleState, AiState } from "@/lib/types";
import { Leaf, BrainCircuit, BarChart, Wind, TrendingDown, TrendingUp, Zap, ShieldCheck, Video, ThermometerSun } from "lucide-react";
import IdleDrainChart from "../charts/idle-drain-chart";
import { EV_CONSTANTS } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";

interface OptimizationTabProps {
    state: VehicleState & AiState;
    onDashcamToggle: () => void;
    onSentryModeToggle: () => void;
    onCabinOverheatProtectionToggle: () => void;
}

const DrainBreakdown = ({ breakdown }: { breakdown: AiState['idleDrainPrediction']['drainBreakdown'] | null }) => {
    const factors = [
        { name: 'BMS', value: breakdown?.bms || 0, color: 'bg-sky-500' },
        { name: 'Sentry', value: breakdown?.sentryMode || 0, color: 'bg-yellow-500' },
        { name: 'Cabin', value: breakdown?.cabinProtection || 0, color: 'bg-red-500' },
        { name: 'Dashcam', value: breakdown?.dashcam || 0, color: 'bg-purple-500' },
    ].filter(f => f.value > 0);

    if (!breakdown || factors.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground">No idle drain sources active.</p>
            </div>
        );
    }
    
    return (
        <div className="w-full flex flex-col gap-2">
            <div className="w-full h-3 flex rounded-full overflow-hidden">
                {factors.map(factor => (
                    <div key={factor.name} className={factor.color} style={{ width: `${factor.value}%` }} />
                ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                {factors.map(factor => (
                    <div key={factor.name} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${factor.color}`} />
                        <span>{factor.name} ({factor.value.toFixed(0)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AcImpactDisplay = ({ impact, recommendation, reasoning }: { impact: number, recommendation: string, reasoning: string }) => {
  const isGain = impact > 0;
  const displayValue = Math.abs(impact).toFixed(1);
  const colorClass = isGain ? "text-green-400" : "text-destructive";

  return (
    <div className="p-3 rounded-lg flex flex-col items-center justify-center text-center gap-2 bg-muted/50 border border-border/50 h-full">
       <p className={`text-3xl font-bold font-headline ${colorClass}`}>
        {isGain ? '+' : '-'}{displayValue} km
       </p>
       <p className="text-xs font-semibold leading-snug">{recommendation}</p>
       <p className="text-xs text-muted-foreground leading-snug mt-1">{reasoning}</p>
    </div>
  );
};

const GreenScoreCard = ({ score }: { score: number }) => {
  const scoreInKg = score / 1000;
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm font-headline flex items-center gap-2">
          <Leaf className="w-4 h-4 text-green-500" />
          Green Score
        </CardTitle>
        <CardDescription className="text-xs -mt-2">
          Formula: Odometer (km) × 120g CO₂/km
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
        <p className="text-3xl lg:text-4xl font-bold text-green-400 font-headline">
          {scoreInKg.toFixed(1)}
        </p>
        <p className="text-sm font-medium text-muted-foreground">kg CO₂ Saved</p>
      </CardContent>
    </Card>
  );
};

const EcoScoreReasoning = ({ acceleration, currentWhPerKm, power }: { acceleration: number, currentWhPerKm: number, power: number }) => {
    const isAcceleratingSmoothly = acceleration < 1.5;
    const isEfficient = currentWhPerKm > 0 && currentWhPerKm < EV_CONSTANTS.baseConsumption;
    const isRegenActive = power < 0;

    return (
        <div className="text-xs text-muted-foreground space-y-2 mt-2">
            <div className="flex items-center gap-2">
                {isAcceleratingSmoothly ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                <p>
                    {isAcceleratingSmoothly ? 'Smooth acceleration is preserving your score.' : 'Harsh acceleration is lowering your score.'}
                </p>
            </div>
            <div className="flex items-center gap-2">
                {isEfficient ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                <p>
                    {isEfficient ? 'Energy usage is below baseline, good job!' : `High energy usage is lowering your score.`}
                </p>
            </div>
             <div className="flex items-center gap-2">
                {isRegenActive ? <Zap className="w-4 h-4 text-regen-green" /> : <Zap className="w-4 h-4 text-muted-foreground/30" />}
                <p>
                    {isRegenActive ? 'Regenerative braking is active, increasing score.' : 'Coasting or braking captures energy.'}
                </p>
            </div>
        </div>
    );
};


export default function OptimizationTab({ state, onDashcamToggle, onSentryModeToggle, onCabinOverheatProtectionToggle }: OptimizationTabProps) {
  
  const greenScore = state.odometer > 0 ? state.odometer * 120 : 0; // 120g CO2 saved per km vs average ICE car

  const defaultAcImpact = {
    rangeImpactKm: state.acOn ? -2.5 : 0,
    recommendation: state.acOn ? "Turn off A/C to save range." : "A/C is off.",
    reasoning: "Calculating impact based on current conditions..."
  };

  return (
        <div className="h-full grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 min-h-0">
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-2 text-center">
                    <CardTitle className="text-sm font-headline flex items-center gap-2"><BarChart className="w-4 h-4"/>Eco-Driving Score</CardTitle>
                    <CardDescription className="text-xs -mt-2 px-2">Based on: Acceleration, Energy Usage & Regen.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow w-full flex flex-col items-center justify-start p-4">
                    <div className="w-48 h-48">
                        <EcoScoreGauge score={state.ecoScore} />
                    </div>
                    {state.speed > 1 && (
                        <EcoScoreReasoning
                            acceleration={state.accelerationHistory[0] || 0}
                            currentWhPerKm={state.recentWhPerKm}
                            power={state.power}
                        />
                    )}
                </CardContent>
            </Card>
            
             <GreenScoreCard score={greenScore} />


            <Card className="p-4 row-start-3 md:row-start-auto">
                <CardHeader className="p-0 mb-3">
                    <CardTitle className="text-sm font-headline flex items-center gap-2">Idle Drain Insights</CardTitle>
                    <CardDescription className="text-xs -mt-2">Manage features that consume power while parked.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="sentry-mode-toggle" className="flex items-center gap-2 text-sm"><ShieldCheck size={16}/> Sentry Mode</Label>
                            <Switch id="sentry-mode-toggle" checked={state.sentryModeOn} onCheckedChange={onSentryModeToggle} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="cabin-overheat-toggle" className="flex items-center gap-2 text-sm"><ThermometerSun size={16}/> Cabin Protection</Label>
                            <Switch id="cabin-overheat-toggle" checked={state.cabinOverheatProtectionOn} onCheckedChange={onCabinOverheatProtectionToggle} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="dashcam-toggle" className="flex items-center gap-2 text-sm"><Video size={16}/> Dashcam</Label>
                            <Switch id="dashcam-toggle" checked={state.dashcamOn} onCheckedChange={onDashcamToggle} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-3 md:col-span-2 row-start-2 md:row-start-auto flex flex-col">
                <CardHeader>
                    <CardTitle className="text-sm font-headline flex items-center gap-2"><BrainCircuit className="w-4 h-4"/>Predictive Idle Drain</CardTitle>
                    <CardDescription className="text-xs -mt-2">An energy consumption model forecasts battery loss over 8 hours based on current settings.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow min-h-0 flex flex-col">
                    <div className="flex-grow min-h-0">
                      <IdleDrainChart data={state.idleDrainPrediction} currentSOC={state.batterySOC} />
                    </div>
                    <div className="pt-2">
                        <h4 className="text-xs font-semibold mb-1">Drain Contributors</h4>
                        <DrainBreakdown breakdown={state.idleDrainPrediction?.drainBreakdown || null} />
                    </div>
                </CardContent>
            </Card>

            <Card className="p-4 flex flex-col">
                 <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-sm font-headline flex items-center gap-2"><Wind className="w-4 h-4"/>A/C Usage Impact</CardTitle>
                    <CardDescription className="text-xs -mt-2">A regression model predicts range change based on A/C settings and temperature.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 pt-2 min-h-0">
                     <div className="flex-grow">
                        {state.acUsageImpact ? (
                            <AcImpactDisplay 
                                impact={state.acUsageImpact.rangeImpactKm} 
                                recommendation={state.acUsageImpact.recommendation}
                                reasoning={state.acUsageImpact.reasoning}
                            />
                        ) : (
                             <AcImpactDisplay 
                                impact={defaultAcImpact.rangeImpactKm} 
                                recommendation={defaultAcImpact.recommendation}
                                reasoning={defaultAcImpact.reasoning}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

    