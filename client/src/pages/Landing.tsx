import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Play, Star, Zap, Users, Film, ChevronRight, ArrowDown, ArrowUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DotGrid from '@/components/DotGrid';

const Landing = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setShowBackToTop(currentScrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 200);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="relative">
        <div className="absolute inset-0 opacity-60 z-0">
          <DotGrid
            dotSize={3}
            gap={20}
            baseColor="#2c1a1aff"
            activeColor="#DC2626"
            proximity={300}
            shockRadius={200}
            shockStrength={6}
            resistance={750}
            returnDuration={1.5}
          />
        </div>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 z-10">

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
                <div className="aspect-[4/5] rounded-2xl relative border border-red-600/30">
                  <img 
                    src="/film-background.webp" 
                    alt="Movie Background" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-600 rounded-full opacity-50"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-red-800 rounded-full opacity-30"></div>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="space-y-4 mb-8">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="block text-gray-200">SMART</span>
                  <span className="block text-red-600">ENTERTAINMENT</span>
                  <span className="block text-gray-200">FOR EVERYONE</span>
                </h2>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-13" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                YMovies revolutionizes how you discover entertainment. Our AI-powered recommendation engine 
                learns your preferences and serves up personalized movie and TV show suggestions that match 
                your unique taste. From blockbusters to hidden gems, we make every viewing experience extraordinary.
              </p>

              <div className="pt-4">
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
      <footer className="py-16 px-4 border-t border-gray-800 bg-black relative z-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="max-w-8xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-8 gap-8 mb-12">
            {/* About Section */}
            <div className="col-span-2 lg:col-span-2">
              <h3 className="font-bold text-white text-lg mb-4">About Us</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Experience limitless entertainment with YMovies! Stream blockbuster movies and binge-worthy TV shows in seamless high-definition. Enjoy a user-friendly interface for your ultimate viewing pleasure.
              </p>
            </div>

            {/* Spacer for equal padding */}
            <div className="lg:col-span-1 hidden lg:block"></div>

            {/* Browse Section */}
            <div className="lg:col-span-1">
              <button
                type="button"
                onClick={() => toggleSection('browse')}
                className="w-full flex items-center justify-start gap-2 md:cursor-default md:pointer-events-none"
                aria-expanded={!!openSections['browse']}
                aria-controls="footer-browse"
              >
                <h3 className="font-bold text-white text-lg">Browse</h3>
                <ChevronDown className={`h-5 w-5 transition-transform md:hidden ${openSections['browse'] ? 'rotate-180' : ''}`} />
              </button>
              <div id="footer-browse" className={`${openSections['browse'] ? 'mt-4 block' : 'hidden'} md:block`}>
                <ul className="space-y-3">
                  <li><Link href="/home" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Home</Link></li>
                  <li><Link href="/movies" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Movies</Link></li>
                  <li><Link href="/tv" className="text-gray-400 hover:text-red-600 transition-colors text-sm">TV Shows</Link></li>
                  <li><Link href="/popular" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Popular</Link></li>
                  <li><Link href="/top-rated" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Top Rated</Link></li>
                </ul>
              </div>
            </div>

            {/* Genres Section */}
            <div className="lg:col-span-1">
              <button
                type="button"
                onClick={() => toggleSection('genres')}
                className="w-full flex items-center justify-start gap-2 md:cursor-default md:pointer-events-none"
                aria-expanded={!!openSections['genres']}
                aria-controls="footer-genres"
              >
                <h3 className="font-bold text-white text-lg">Genres</h3>
                <ChevronDown className={`h-5 w-5 transition-transform md:hidden ${openSections['genres'] ? 'rotate-180' : ''}`} />
              </button>
              <div id="footer-genres" className={`${openSections['genres'] ? 'mt-4 block' : 'hidden'} md:block`}>
                <ul className="space-y-3">
                  <li><Link href="/genre/action" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Action</Link></li>
                  <li><Link href="/genre/comedy" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Comedy</Link></li>
                  <li><Link href="/genre/drama" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Drama</Link></li>
                  <li><Link href="/genre/horror" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Horror</Link></li>
                  <li><Link href="/genre/romance" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Romance</Link></li>
                  <li><Link href="/genre/documentary" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Documentary</Link></li>
                </ul>
              </div>
            </div>

            {/* Franchises Section */}
            <div className="lg:col-span-1">
              <button
                type="button"
                onClick={() => toggleSection('franchises')}
                className="w-full flex items-center justify-start gap-2 md:cursor-default md:pointer-events-none"
                aria-expanded={!!openSections['franchises']}
                aria-controls="footer-franchises"
              >
                <h3 className="font-bold text-white text-lg">Franchises</h3>
                <ChevronDown className={`h-5 w-5 transition-transform md:hidden ${openSections['franchises'] ? 'rotate-180' : ''}`} />
              </button>
              <div id="footer-franchises" className={`${openSections['franchises'] ? 'mt-4 block' : 'hidden'} md:block`}>
                <ul className="space-y-3">
                  <li><Link href="/franchise/marvel" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Marvel</Link></li>
                  <li><Link href="/franchise/dc" className="text-gray-400 hover:text-red-600 transition-colors text-sm">DC</Link></li>
                  <li><Link href="/franchise/cw" className="text-gray-400 hover:text-red-600 transition-colors text-sm">CW</Link></li>
                  <li><Link href="/franchise/anime" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Anime</Link></li>
                </ul>
              </div>
            </div>

            {/* User Section */}
            <div className="lg:col-span-1">
              <button
                type="button"
                onClick={() => toggleSection('user')}
                className="w-full flex items-center justify-start gap-2 md:cursor-default md:pointer-events-none"
                aria-expanded={!!openSections['user']}
                aria-controls="footer-user"
              >
                <h3 className="font-bold text-white text-lg">User</h3>
                <ChevronDown className={`h-5 w-5 transition-transform md:hidden ${openSections['user'] ? 'rotate-180' : ''}`} />
              </button>
              <div id="footer-user" className={`${openSections['user'] ? 'mt-4 block' : 'hidden'} md:block`}>
                <ul className="space-y-3">
                  <li><Link href="/signin" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Sign In</Link></li>
                  <li><Link href="/signup" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Sign Up</Link></li>
                  <li><Link href="/profile" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Profile</Link></li>
                  <li><Link href="/watchlist" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Watchlist</Link></li>
                  <li><Link href="/watch-history" className="text-gray-400 hover:text-red-600 transition-colors text-sm">Watch History</Link></li>
                </ul>
              </div>
            </div>

            {/* Follow Us Section */}
            <div className="lg:col-span-1">
              <button
                type="button"
                onClick={() => toggleSection('follow')}
                className="w-full flex items-center justify-start gap-2 md:cursor-default md:pointer-events-none"
                aria-expanded={!!openSections['follow']}
                aria-controls="footer-follow"
              >
                <h3 className="font-bold text-white text-lg">Follow Us</h3>
                <ChevronDown className={`h-5 w-5 transition-transform md:hidden ${openSections['follow'] ? 'rotate-180' : ''}`} />
              </button>
              <div id="footer-follow" className={`${openSections['follow'] ? 'mt-4 block' : 'hidden'} md:block`}>
                <ul className="space-y-3">
                  <li>
                    <a href="https://github.com/yassnemo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a href="https://twitter.com/yassnemo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a href="https://linkedin.com/in/yassnemo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a href="https://instagram.com/yassnemo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.59-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      Instagram
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
              <Link href="/about" className="text-gray-400 hover:text-red-600 transition-colors">About</Link>
              <Link href="/contact" className="text-gray-400 hover:text-red-600 transition-colors">Contact Us</Link>
              <Link href="/terms" className="text-gray-400 hover:text-red-600 transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-red-600 transition-colors">Privacy Policy</Link>
              <Link href="/dmca" className="text-gray-400 hover:text-red-600 transition-colors">DMCA</Link>
            </div>
            
            <div className="text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                <p className="text-gray-500 text-sm">&copy; 2025 YMovies. All rights reserved.</p>
                <div className="flex items-center">
                  <div className="hidden sm:block w-px h-4 bg-gray-600 mx-2"></div>
                  <a 
                    href="/humans.txt" 
                    className="text-gray-500 text-sm font-semibold relative group inline-block"
                  >
                    Crafted by yours truly
                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gray-600 transition-all duration-300 group-hover:opacity-0"></span>
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-all duration-500 hover:scale-110 ${
          showBackToTop 
            ? 'opacity-100 translate-y-0 shadow-lg hover:shadow-red-600/20 hover:shadow-2xl' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          boxShadow: showBackToTop ? '0 0 20px rgba(220, 38, 38, 0.15)' : 'none'
        }}
        aria-label="Back to top"
      >
        <ArrowUp className="h-6 w-6" />
      </button>
    </div>
  );
};

export default Landing;
