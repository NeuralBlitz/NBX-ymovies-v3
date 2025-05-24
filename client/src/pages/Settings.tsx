import React, { useState } from "react";
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
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // State for notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    recommendations: true,
    newReleases: true,
    watchHistory: true,
    useForRecommendations: true
  });
  
  // Toggle notification setting
  const toggleNotification = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    // Simulate saving settings
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };
  
  // Change password handler
  const handleChangePassword = () => {
    toast({
      title: "Feature Not Available",
      description: "Password change is not available in this demo. Please use Replit Auth settings.",
    });
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
                
                <div>
                  <Label htmlFor="password" className="text-muted-foreground mb-1 block">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value="••••••••" 
                    readOnly 
                    className="bg-secondary/20"
                  />
                  <Button 
                    variant="link" 
                    className="text-primary hover:text-primary/80 text-sm p-0 h-auto mt-1"
                    onClick={handleChangePassword}
                  >
                    Change Password
                  </Button>
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
            </div>
          </CardContent>
        </Card>
        
        {/* About & Version */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">About</h2>
            
            <div className="space-y-2">
              <p className="text-muted-foreground">Version 1.3.0</p>
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
