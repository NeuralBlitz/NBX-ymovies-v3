import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { X } from "lucide-react";
import SocialLoginButtons from "@/components/SocialLoginButtons";

const AUTH_PROMPT_DELAY_MS = 10000; // Show after 10 seconds of browsing (was 60000)
const AUTH_PROMPT_LOCAL_STORAGE_KEY = "auth_prompt_dismissed";
const AUTH_PROMPT_DISMISS_DURATION_DAYS = 3; // Don't show again for 3 days if dismissed

const AuthPrompt = () => {
  const { isAuthenticated, isLoading, isGuest } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  
  // Add a way to force show the prompt for testing (you can call this in console)
  useEffect(() => {
    // @ts-ignore - Adding to window for testing
    window.forceShowAuthPrompt = () => {
      localStorage.removeItem(AUTH_PROMPT_LOCAL_STORAGE_KEY);
      setShowPrompt(true);
      console.log('AuthPrompt: Force showing prompt');
    };
    
    // @ts-ignore - Adding to window for testing  
    window.resetAuthPrompt = () => {
      localStorage.removeItem(AUTH_PROMPT_LOCAL_STORAGE_KEY);
      console.log('AuthPrompt: Reset dismissal state');
    };
  }, []);
    useEffect(() => {
    // Don't show if user is authenticated or loading
    if (isAuthenticated || isLoading || !isGuest) {
      console.log('AuthPrompt: Not showing - authenticated:', isAuthenticated, 'loading:', isLoading, 'guest:', isGuest);
      return;
    }
    
    // Check if user has previously dismissed the prompt
    const lastDismissed = localStorage.getItem(AUTH_PROMPT_LOCAL_STORAGE_KEY);
    if (lastDismissed) {
      const dismissedDate = new Date(lastDismissed);
      const daysSinceDismissed = (new Date().getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24);
      
      console.log('AuthPrompt: Last dismissed:', dismissedDate, 'Days since:', daysSinceDismissed);
      
      // If it's been less than the dismissal period, don't show
      if (daysSinceDismissed < AUTH_PROMPT_DISMISS_DURATION_DAYS) {
        console.log('AuthPrompt: Not showing - dismissed recently');
        return;
      }
    }
    
    console.log('AuthPrompt: Setting timer to show in', AUTH_PROMPT_DELAY_MS, 'ms');
    
    // Show the auth prompt after the delay
    const timer = setTimeout(() => {
      console.log('AuthPrompt: Timer fired - showing prompt');
      setShowPrompt(true);
    }, AUTH_PROMPT_DELAY_MS);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, isGuest]);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(AUTH_PROMPT_LOCAL_STORAGE_KEY, new Date().toISOString());
  };

  if (!showPrompt || isAuthenticated || isLoading) {
    return null;
  }  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="bg-gradient-to-br from-black via-gray-900/98 to-black border border-red-900/40 max-w-md rounded-2xl backdrop-blur-lg shadow-2xl shadow-red-900/30 animate-in slide-in-from-bottom-10 fade-in-50 duration-500 overflow-hidden">
        <DialogHeader className="relative pb-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-1 -top-1 z-10 text-gray-400 hover:text-white hover:bg-red-600/20 rounded-full w-8 h-8 transition-all duration-200"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-5 -mt-4">
          {/* Hero Image with Overlay Content */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-xl">
              <img 
                src="/movie-posters.jpg" 
                alt="Movie collection" 
                className="w-full h-48 object-cover"
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                {/* Content overlay on image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-gray-200 text-sm opacity-90 drop-shadow">
                  Create your personal collection of favorites
                </p>
              </div>
            </div>
          </div>
          
          {/* Features List */}
          <div className="px-4 space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
              <span className="text-gray-300">Save movies to your personal watchlist</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
              <span className="text-gray-300">Get personalized recommendations</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
              <span className="text-gray-300">Track your viewing history</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3 px-4 pb-2">
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/25"
              asChild
            >
              <Link href="/signup">Join Free</Link>
            </Button>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-gray-600 bg-gray-900/50 hover:bg-gray-800/70 text-gray-300 hover:text-white rounded-xl py-4 transition-all duration-300"
                asChild
              >
                <Link href="/signin">Sign In</Link>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex-1 text-gray-400 hover:text-gray-300 hover:bg-gray-800/30 rounded-xl py-4 transition-all duration-300"
                onClick={handleDismiss}
              >
                Maybe Later
              </Button>
            </div>
            
            {/* Social Login */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-3 text-gray-500">or</span>
              </div>
            </div>
            
            <SocialLoginButtons 
              showGoogle={true}
              onSuccess={handleDismiss}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPrompt;
