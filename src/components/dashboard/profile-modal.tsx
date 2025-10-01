
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Profile } from '@/lib/types';
import { CheckCircle, Trash2, UserPlus } from 'lucide-react';
import { Label } from '../ui/label';

interface ProfileModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  profiles: Record<string, Profile>;
  activeProfile: string;
  onSwitchProfile: (name: string) => void;
  onAddProfile: (name: string, profile: Omit<Profile, 'driveMode'>) => void;
  onDeleteProfile: (name: string) => void;
}

export default function ProfileModal({
  isOpen,
  onOpenChange,
  profiles,
  activeProfile,
  onSwitchProfile,
  onAddProfile,
  onDeleteProfile
}: ProfileModalProps) {
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAge, setNewProfileAge] = useState('');
  const [newProfilePhone, setNewProfilePhone] = useState('');
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [isAddingProfile, setIsAddingProfile] = useState(false);

  const handleAddProfile = () => {
    if (newProfileName.trim() && !profiles[newProfileName.trim()]) {
        const age = parseInt(newProfileAge, 10);
        const newProfile: Omit<Profile, 'driveMode'> = {
            id: `USR-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            age: isNaN(age) ? undefined : age,
            phone: newProfilePhone || undefined,
        }
      onAddProfile(newProfileName.trim(), newProfile);
      setNewProfileName('');
      setNewProfileAge('');
      setNewProfilePhone('');
      setIsAddingProfile(false);
    }
  };

  const handleDeleteProfile = () => {
    if (profileToDelete) {
        onDeleteProfile(profileToDelete);
        setProfileToDelete(null);
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setIsAddingProfile(false);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {isAddingProfile ? 'Add New Profile' : 'Switch Profile'}
          </DialogTitle>
           {isAddingProfile && (
            <DialogDescription>Enter the details for the new profile.</DialogDescription>
          )}
        </DialogHeader>
        
        {isAddingProfile ? (
            <div className="space-y-4 py-2">
                <div className='space-y-2'>
                    <Label htmlFor="new-profile-name">Name</Label>
                    <Input
                        id="new-profile-name"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        placeholder="Enter name..."
                    />
                </div>
                <div className='space-y-2'>
                    <Label htmlFor="new-profile-age">Age</Label>
                    <Input
                        id="new-profile-age"
                        type="number"
                        value={newProfileAge}
                        onChange={(e) => setNewProfileAge(e.target.value)}
                        placeholder="Enter age..."
                    />
                </div>
                <div className='space-y-2'>
                    <Label htmlFor="new-profile-phone">Phone</Label>
                    <Input
                        id="new-profile-phone"
                        value={newProfilePhone}
                        onChange={(e) => setNewProfilePhone(e.target.value)}
                        placeholder="Enter phone number..."
                    />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsAddingProfile(false)}>Cancel</Button>
                    <Button onClick={handleAddProfile}>Add Profile</Button>
                </div>
            </div>
        ) : (
            <>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                {Object.keys(profiles).map((name) => (
                    <div key={name} className="flex items-center gap-2 group">
                    <Button
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
                    {Object.keys(profiles).length > 1 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setProfileToDelete(name)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the profile for "{profileToDelete}" and all its associated data. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setProfileToDelete(null)}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteProfile} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    </div>
                ))}
                </div>
                <Button className="w-full mt-4" variant="outline" onClick={() => setIsAddingProfile(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add New Profile
                </Button>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}

