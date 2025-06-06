import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserIcon, ChevronRight } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader
} from "@/components/ui/dialog";
import SocialLoginButtons from "@/components/SocialLoginButtons";

const NavAuthButton = () => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
    if (isAuthenticated) {
    return null; // Don't show this component for authenticated users
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 flex items-center font-semibold"
        >
          <UserIcon className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[90vw] bg-gradient-to-br from-black via-gray-900 to-black border border-red-900/30 text-white shadow-2xl shadow-red-900/20 backdrop-blur-md">
        <DialogHeader className="text-center space-y-3 pb-2">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            Welcome to YMovies
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base leading-relaxed">
            Sign in to unlock personalized recommendations, save your favorites, and track your viewing journey.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="space-y-4">
            <SocialLoginButtons 
              showGoogle={true} 
              onSuccess={() => setOpen(false)} 
            />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-4 text-gray-400 font-medium">Or continue with</span>
              </div>
            </div>
            
            <Button 
              onClick={() => {
                setOpen(false);
                window.location.href = "/signin";
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/25 font-semibold"
            >
              <span>Sign in with Email</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => {
                setOpen(false);
                window.location.href = "/signup";
              }} 
              variant="outline"
              className="w-full border-2 border-gray-600 bg-transparent hover:bg-red-600/10 hover:border-red-500 text-gray-200 hover:text-white py-3 transition-all duration-300 hover:scale-[1.02] font-semibold"
            >
              Create New Account
            </Button>
          </div>
          
          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">
              By signing in, you agree to our{" "}
              <span className="text-red-500 hover:text-red-400 cursor-pointer transition-colors">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-red-500 hover:text-red-400 cursor-pointer transition-colors">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NavAuthButton;
