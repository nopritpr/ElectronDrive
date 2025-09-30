'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Profile } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  profiles: Record<string, Profile>;
  activeProfile: string;
  onSwitchProfile: (name: string) => void;
  onAddProfile: (name: string) => void;
}

export default function ProfileModal({
  isOpen,
  onOpenChange,
  profiles,
  activeProfile,
  onSwitchProfile,
  onAddProfile,
}: ProfileModalProps) {
  const [newProfileName, setNewProfileName] = useState('');

  const handleAddProfile = () => {
    if (newProfileName.trim()) {
      onAddProfile(newProfileName.trim());
      setNewProfileName('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-headline">Switch Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {Object.keys(profiles).map((name) => (
            <Button
              key={name}
              variant={activeProfile === name ? 'secondary' : 'ghost'}
              className="w-full justify-between"
              onClick={() => {
                onSwitchProfile(name);
                onOpenChange(false);
              }}
            >
              {name}
              {activeProfile === name && <CheckCircle className="h-4 w-4 text-primary" />}
            </Button>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Input
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            placeholder="New profile name..."
          />
          <Button onClick={handleAddProfile}>Add</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
