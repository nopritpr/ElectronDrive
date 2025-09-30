'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';

interface HelpModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ControlItem = ({ kbd, children }: { kbd: string; children: React.ReactNode }) => (
  <li className="flex justify-between items-center">
    <span>{children}</span>
    <Kbd>{kbd}</Kbd>
  </li>
);

export default function HelpModal({ isOpen, onOpenChange }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">EV Dashboard Controls</DialogTitle>
          <DialogDescription>
            Use your keyboard to simulate driving.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-4">
          <div>
            <h3 className="font-semibold text-primary mb-2 font-headline">Driving</h3>
            <ul className="space-y-2">
              <ControlItem kbd="↑">Accelerate</ControlItem>
              <ControlItem kbd="↓">Brake</ControlItem>
              <ControlItem kbd="R">Strong Regenerative Braking</ControlItem>
              <ControlItem kbd="C">Start/Stop Charging</ControlItem>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-2 font-headline">Drive Modes</h3>
            <ul className="space-y-2">
              <ControlItem kbd="1">Eco Mode</ControlItem>
              <ControlItem kbd="2">City Mode</ControlItem>
              <ControlItem kbd="3">Sports Mode</ControlItem>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-2 font-headline">Other</h3>
            <ul className="space-y-2">
              <ControlItem kbd="A">Toggle A/C</ControlItem>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-2 font-headline">Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Release the acceleration key to enable gentle regenerative braking.</li>
              <li>Press and hold 'R' for stronger regenerative braking.</li>
              <li>Different drive modes affect acceleration, efficiency and range.</li>
              <li>Using A/C will consume more battery and reduce range.</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
