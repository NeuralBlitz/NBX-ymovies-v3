import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { X } from "lucide-react";
import SocialLoginButtons from "@/components/SocialLoginButtons";

const AUTH_PROMPT_DELAY_MS = 60000; // Show after 1 minute of browsing
const AUTH_PROMPT_LOCAL_STORAGE_KEY = "auth_prompt_dismissed";
const AUTH_PROMPT_DISMISS_DURATION_DAYS = 3; // Don't show again for 3 days if dismissed

const AuthPrompt = () => {
  const { isAuthenticated, isLoading, isGuest } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    // Don't show if user is authenticated or loading
    if (isAuthenticated || isLoading || !isGuest) return;
    
    // Check if user has previously dismissed the prompt
    const lastDismissed = localStorage.getItem(AUTH_PROMPT_LOCAL_STORAGE_KEY);
    if (lastDismissed) {
      const dismissedDate = new Date(lastDismissed);
      const daysSinceDismissed = (new Date().getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24);
      
      // If it's been less than the dismissal period, don't show
      if (daysSinceDismissed < AUTH_PROMPT_DISMISS_DURATION_DAYS) {
        return;
      }
    }
    
    // Show the auth prompt after the delay
    const timer = setTimeout(() => {
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
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="bg-black/95 border-gray-800 max-w-md rounded-xl backdrop-blur-sm animate-in slide-in-from-bottom-10 fade-in-50">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl text-center">Get More From YMovies</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="/movie-poster-collage.png" 
                alt="Movie posters" 
                className="h-32 rounded-lg shadow-2xl shadow-red-600/20"
              />
            </div>
            <p className="text-gray-300 text-sm mb-2">
              Create an account to save your favorite movies, get personalized recommendations, and track your watching history.
            </p>
          </div>
            <div className="grid gap-4 px-2">
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white flex justify-center"
              asChild
            >
              <Link href="/signup">Create a free account</Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-gray-700 bg-transparent hover:bg-gray-800 text-gray-300"
              asChild
            >
              <Link href="/signin">Already have an account? Sign in</Link>
            </Button>            <div className="px-2">
              <SocialLoginButtons 
                showGoogle={true}
                onSuccess={handleDismiss}
              />
            </div>
            
            <Button 
              variant="link" 
              className="text-gray-400 hover:text-gray-300 text-sm"
              onClick={handleDismiss}
            >
              Continue browsing as guest
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By joining, you agree to our <a href="/terms" className="text-red-500 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-red-500 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPrompt;
