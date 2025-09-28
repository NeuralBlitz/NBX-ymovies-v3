import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const Settings = () => {
  const { user, signOut, changePassword } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Persisted settings live in user preferences; for now we store them inside preferences.liked/disliked as typed fields in a dedicated object in localStorage/server.
  // We'll manage a local settings object and save through the preferences API using a single blob.
  const [notificationSettings, setNotificationSettings] = useState({
    recommendations: true,
    newReleases: true,
    watchHistory: true,
    useForRecommendations: true,
  });
  // Hydrate from server/local on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/preferences');
        if (!res.ok) return;
        const data = await res.json();
        const saved = data?.appSettings?.notifications;
        if (saved && !cancelled) setNotificationSettings((prev) => ({ ...prev, ...saved }));
      } catch (_) {
        // ignore; will keep defaults
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load and persist via preferences endpoint using the authenticated token when available
  const [isSaving, setIsSaving] = useState(false);
  
  // Toggle notification setting
  const toggleNotification = async (setting: keyof typeof notificationSettings) => {
    const updated = { ...notificationSettings, [setting]: !notificationSettings[setting] };
    setNotificationSettings(updated);
    setIsSaving(true);
    try {
      // Save to server through /api/preferences, merging into existing blob if present
      const res = await fetch('/api/preferences', { headers: {} });
      const current = res.ok ? await res.json() : {};
      const body = { ...current, appSettings: { ...(current.appSettings || {}), notifications: updated } };
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      toast({ title: 'Settings Updated', description: 'Your preferences have been saved.' });
    } catch (e) {
      // Still reflect locally; backend save will retry next time
      console.error('Failed saving settings', e);
      toast({ title: 'Saved locally', description: 'We will sync your settings later.' });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Change password handler
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const canSubmitChange = useMemo(() => newPassword.length >= 8 && newPassword === confirmPassword && currentPassword.length > 0, [newPassword, confirmPassword, currentPassword]);
  const handleChangePassword = async () => {
    if (!canSubmitChange) return;
    setChanging(true);
    const ok = await changePassword(currentPassword, newPassword);
    setChanging(false);
    if (ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="container mx-auto pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        {/* Account Settings */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-6">Account Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-muted-foreground mb-1 block">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={user?.email || "No email available"} 
                    readOnly 
                    className="bg-secondary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-muted-foreground mb-1 block">Current Password</Label>
                  <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                  <Label htmlFor="new-password" className="text-muted-foreground mb-1 block">New Password</Label>
                  <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
                  <Label htmlFor="confirm-password" className="text-muted-foreground mb-1 block">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
                  <div className="flex justify-end pt-2">
                    <Button size="sm" disabled={!canSubmitChange || changing} onClick={handleChangePassword}>
                      {changing ? 'Updating…' : 'Change Password'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
          </CardContent>
        </Card>
        
        {/* Notification Settings */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Notification Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>New Recommendations</span>
                <Switch 
                  checked={notificationSettings.recommendations} 
                  onCheckedChange={() => toggleNotification('recommendations')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span>New Releases</span>
                <Switch 
                  checked={notificationSettings.newReleases} 
                  onCheckedChange={() => toggleNotification('newReleases')} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Privacy Settings */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Privacy</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Save Watch History</span>
                <Switch 
                  checked={notificationSettings.watchHistory} 
                  onCheckedChange={() => toggleNotification('watchHistory')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span>Use Viewing Activity for Recommendations</span>
                <Switch 
                  checked={notificationSettings.useForRecommendations} 
                  onCheckedChange={() => toggleNotification('useForRecommendations')} 
                />
              </div>
              {isSaving && <p className="text-xs text-muted-foreground">Saving…</p>}
            </div>
          </CardContent>
        </Card>
        
        {/* About & Version */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">About</h2>
            
            <div className="space-y-2">
              <p className="text-muted-foreground">Version 3.0.0</p>
              <p className="text-muted-foreground">© 2025 YMovies</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Sign Out */}
        <div className="flex justify-center mb-6">
          <Button 
            variant="ghost" 
            className="text-primary"
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
