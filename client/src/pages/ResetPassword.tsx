import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [, navigate] = useLocation();
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await resetPassword(email);
      
      if (success) {
        setIsSubmitted(true);
        toast({
          title: "Password reset email sent",
          description: "Check your inbox for further instructions"
        });
      }
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem processing your request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-black to-gray-900">
      <div className="w-full max-w-md space-y-8 bg-black/80 backdrop-blur-sm p-8 rounded-lg border border-gray-800">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
          {!isSubmitted ? (
            <p className="text-gray-400">
              Enter your email address and we'll send you a link to reset your password
            </p>
          ) : (
            <p className="text-green-400">
              If an account exists for {email}, you will receive an email with instructions to reset your password.
            </p>
          )}
        </div>
        
        {!isSubmitted ? (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-900 border-gray-700 focus:ring-red-500 focus:border-red-500 text-white"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-6"
              disabled={isLoading}
            >
              {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
            </Button>
            
            <div className="text-center mt-4">
              <Link href="/signin" className="text-gray-400 hover:text-white flex items-center justify-center gap-1">
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center mt-8">
            <Button
              onClick={() => navigate('/signin')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Return to Sign In
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-400">
        <p>Need help? Visit our <a href="#" className="text-red-500 hover:underline">Help Center</a></p>
      </div>
    </div>
  );
};

export default ResetPassword;
