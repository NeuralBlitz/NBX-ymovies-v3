import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import MovieDetail from "@/pages/MovieDetail";
import Quiz from "@/pages/Quiz";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Loading state while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={Search} />
        <Route path="/movie/:id" component={MovieDetail} />
        <Route path="/quiz">
          {isAuthenticated ? <Quiz /> : <div className="flex justify-center py-20">Please <a href="/api/login" className="text-primary mx-1">login</a> to take the quiz</div>}
        </Route>
        <Route path="/profile">
          {isAuthenticated ? <Profile /> : <div className="flex justify-center py-20">Please <a href="/api/login" className="text-primary mx-1">login</a> to view your profile</div>}
        </Route>
        <Route path="/settings">
          {isAuthenticated ? <Settings /> : <div className="flex justify-center py-20">Please <a href="/api/login" className="text-primary mx-1">login</a> to access settings</div>}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
