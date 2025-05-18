import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserIcon, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const NavAuthButton = () => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  
  if (isAuthenticated) {
    return null; // Don't show this component for authenticated users
  }
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-red-600 hover:bg-red-700 transition-transform hover:scale-105 duration-200 flex items-center"
        >
          <UserIcon className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 bg-black/90 border border-gray-800 backdrop-blur-sm text-white shadow-lg shadow-red-900/20">
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Join YMovies Today</h3>
          <p className="text-sm text-gray-300">
            Sign in to enjoy personalized recommendations, save your favorites, and keep track of what you've watched.
          </p>
          <div className="grid gap-2">
            <Button 
              onClick={() => window.location.href = "/api/login"} 
              className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-between"
            >
              Sign in with Google
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button 
              onClick={() => window.location.href = "/signup"} 
              variant="outline"
              className="border-gray-700 bg-transparent hover:bg-gray-800 text-gray-300"
            >
              Create an account
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NavAuthButton;
