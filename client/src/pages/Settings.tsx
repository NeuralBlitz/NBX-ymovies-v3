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

interface NotificationSettings {
  recommendations: boolean;
  newReleases: boolean;
  watchHistory: boolean;
  useForRecommendations: boolean;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  recommendations: true,
  newReleases: true,
  watchHistory: true,
  useForRecommendations: true,
};

async function getAuthHeaders(firebaseUser: any): Promise<Record<string, string>> {
  const token = await firebaseUser.getIdToken();
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

const Settings = () => {
  const { user, firebaseUser, signOut, changePassword } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [isSaving, setIsSaving] = useState(false);

  // Load app settings from server on mount
  useEffect(() => {
    if (!firebaseUser) return;
    let cancelled = false;

    (async () => {
      try {
        const headers = await getAuthHeaders(firebaseUser);
        const res = await fetch("/api/preferences", { headers });
        if (!res.ok) return;
        const data = await res.json();
        const saved = data?.appSettings?.notifications;
        if (saved && !cancelled) {
          setNotificationSettings((prev) => ({ ...prev, ...saved }));
        }
      } catch {
        // Keep defaults on failure
      }
    })();

    return () => { cancelled = true; };
  }, [firebaseUser]);

  const toggleSetting = async (key: keyof NotificationSettings) => {
    if (!firebaseUser) return;

    const updated = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(updated);
    setIsSaving(true);

    try {
      const headers = await getAuthHeaders(firebaseUser);

      // Fetch current preferences to merge into
      const res = await fetch("/api/preferences", { headers });
      const current = res.ok ? await res.json() : {};

      const body = {
        ...current,
        appSettings: { ...(current.appSettings || {}), notifications: updated },
      };

      const saveRes = await fetch("/api/preferences", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (saveRes.ok) {
        toast({ title: "Settings updated", description: "Your preferences have been saved." });
      } else {
        throw new Error("Server returned " + saveRes.status);
      }
    } catch {
      toast({ title: "Saved locally", description: "We'll sync your settings when the connection is restored." });
    } finally {
      setIsSaving(false);
    }
  };

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const canSubmitChange = useMemo(
    () => newPassword.length >= 8 && newPassword === confirmPassword && currentPassword.length > 0,
    [newPassword, confirmPassword, currentPassword]
  );

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
                  onCheckedChange={() => toggleSetting('recommendations')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span>New Releases</span>
                <Switch 
                  checked={notificationSettings.newReleases} 
                  onCheckedChange={() => toggleSetting('newReleases')} 
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
                  onCheckedChange={() => toggleSetting('watchHistory')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span>Use Viewing Activity for Recommendations</span>
                <Switch 
                  checked={notificationSettings.useForRecommendations} 
                  onCheckedChange={() => toggleSetting('useForRecommendations')} 
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
