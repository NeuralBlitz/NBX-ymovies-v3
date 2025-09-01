import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Play, Star, Zap, Users, Film, ChevronRight, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 200);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-red-600 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-800 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className={`text-center z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          {/* Main Logo/Title */}
          <h1 className="font-logo text-6xl md:text-8xl lg:text-9xl font-bold text-red-600 mb-4 tracking-wider">
            YMOVIES
          </h1>
          
          {/* Subtitle */}
          <div className="space-y-2 mb-8">
            <p className="text-lg md:text-xl lg:text-2xl font-light tracking-widest text-gray-300">
              MOVIE + TV STREAMING
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm md:text-base text-gray-400">
              <span>PERSONALIZED</span>
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <span>AI-POWERED</span>
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <span>RECOMMENDATIONS</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mb-16">
            <Link href="/home">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-2xl"
              >
                EXPLORE MOVIES
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce">
            <div className="flex flex-col items-center text-gray-400">
              <span className="text-xs tracking-wider mb-2">SCROLL</span>
              <span className="text-xs tracking-wider mb-2">TO</span>
              <span className="text-xs tracking-wider mb-4">DISCOVER</span>
              <ArrowDown className="h-6 w-6" />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Character/Hero Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl">
                <div className="aspect-[4/5] bg-gradient-to-br from-red-900/20 to-black border border-red-600/30 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Film className="h-24 w-24 text-red-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Your Movie Journey Starts Here</p>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-600 rounded-full opacity-50"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-red-800 rounded-full opacity-30"></div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="block text-gray-200">SMART</span>
                  <span className="block text-red-600">ENTERTAINMENT</span>
                  <span className="block text-gray-200">FOR EVERYONE</span>
                </h2>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed">
                YMovies revolutionizes how you discover entertainment. Our AI-powered recommendation engine 
                learns your preferences and serves up personalized movie and TV show suggestions that match 
                your unique taste. From blockbusters to hidden gems, we make every viewing experience extraordinary.
              </p>

              <Link href="/movies">
                <Button 
                  variant="outline" 
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-3 text-base font-semibold"
                >
                  EXPLORE CATALOG
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-red-600">POWERFUL</span>{' '}
              <span className="text-white">FEATURES</span>
            </h2>
            <div className="flex items-center justify-center">
              <div className="w-24 h-1 bg-red-600"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-12 w-12" />,
                title: "AI RECOMMENDATIONS",
                description: "13+ personalized categories powered by advanced machine learning algorithms"
              },
              {
                icon: <Star className="h-12 w-12" />,
                title: "PREMIUM CONTENT",
                description: "Access to 800,000+ movies and TV shows with detailed information and trailers"
              },
              {
                icon: <Users className="h-12 w-12" />,
                title: "SOCIAL FEATURES",
                description: "Create watchlists, rate content, and share your favorite discoveries"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="text-center p-8 rounded-xl bg-black/50 border border-gray-800 hover:border-red-600/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="text-red-600 mb-6 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "800K+", label: "Movies & Shows" },
              { number: "13+", label: "AI Categories" },
              { number: "99%", label: "Uptime" },
              { number: "4K", label: "Quality Streaming" }
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-red-600">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm md:text-base tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-900/20 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            <span className="text-white">READY TO</span>
            <br />
            <span className="text-red-600">GET STARTED?</span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of movie enthusiasts who have discovered their next favorite film through YMovies
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/home">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
              >
                START WATCHING
                <Play className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/signin">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-12 py-4 text-lg font-semibold rounded-full transition-all duration-300"
              >
                SIGN IN
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="font-logo text-2xl font-bold text-red-600">YMovies</span>
              <p className="text-gray-400 mt-1">Smart Entertainment for Everyone</p>
            </div>
            
            <div className="flex space-x-6 text-gray-400">
              <Link href="/home" className="hover:text-red-600 transition-colors">
                Home
              </Link>
              <Link href="/movies" className="hover:text-red-600 transition-colors">
                Movies
              </Link>
              <Link href="/tv" className="hover:text-red-600 transition-colors">
                TV Shows
              </Link>
              <Link href="/signin" className="hover:text-red-600 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>&copy; 2025 YMovies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
