import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType } from "@/hooks/useAuth";
import { useThemeContext } from "@/components/ui/theme-provider";
import { SearchIcon, User as UserIcon, ChevronDown, Moon, Sun, X, Bell, Film, Tv } from "lucide-react";
import NavAuthButton from "@/components/NavAuthButton";
import { Button } from "@/components/ui/button";
import SearchSuggestions from "@/components/SearchSuggestions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const [location] = useLocation();
  const { user, isAuthenticated, signOut } = useAuth();
  const { theme, setTheme } = useThemeContext();
  const [scrolled, setScrolled] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const prevScrollY = useRef(0);
  const [navVisible, setNavVisible] = useState(true);

  // Handle navbar background when scrolling and hide/show navbar on scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if we should show or hide the navbar based on scroll direction
      if (currentScrollY > prevScrollY.current && currentScrollY > 100) {
        setNavVisible(false); // Scrolling down & past threshold - hide navbar
      } else {
        setNavVisible(true); // Scrolling up - show navbar
      }
      
      // Update background opacity based on scroll position
      if (currentScrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      prevScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Focus search input when search is activated
  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchActive]);

  // Handle search form submission
  const [, navigate] = useLocation();
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchActive(false); // Close the search input after submitting
    }
  };

  // Toggle search with animation
  const toggleSearch = () => {
    if (searchActive) {
      setSearchQuery("");
    }
    setSearchActive(!searchActive);
    
    // Focus the search input when activated
    if (!searchActive) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  return (
    <nav 
      className={`fixed top-0 w-full z-50 px-4 py-2 transition-all duration-300 
        ${scrolled || searchActive ? "bg-background shadow-lg" : "bg-gradient-to-b from-black/80 to-transparent"}
        ${navVisible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center">
          <Link href="/" className="group relative">
            <div className="text-primary font-bold text-3xl mr-10 transition-all duration-300 hover:text-red-500">
              YMovies
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex space-x-1">
              {/* Home */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/"
                    className={`px-4 py-2 text-sm font-medium relative overflow-hidden group transition-colors duration-300
                      ${location === "/" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <span className="relative z-10">Home</span>
                    {location === "/" && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></span>
                    )}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              {/* TV Shows */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/tv"
                    className={`px-4 py-2 text-sm font-medium relative overflow-hidden group transition-colors duration-300
                      ${location.startsWith("/tv") && !location.includes("/tv/") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <span className="relative z-10">TV Shows</span>
                    {location.startsWith("/tv") && !location.includes("/tv/") && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></span>
                    )}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              {/* Search */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/search"
                    className={`px-4 py-2 text-sm font-medium relative overflow-hidden group transition-colors duration-300
                      ${location.startsWith("/search") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <span className="relative z-10">Search</span>
                    {location.startsWith("/search") && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></span>
                    )}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              {/* Browse (dropdown menu for categories) */}
              <NavigationMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="link" className="px-4 py-2 h-auto text-sm font-medium relative group">
                      <div className="flex items-center">
                        <span className={`relative z-10 ${location.startsWith("/genre") ? "text-foreground" : "text-muted-foreground"}`}>
                          Browse
                        </span>
                        <ChevronDown className={`ml-1 h-3 w-3 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''} opacity-70 group-hover:opacity-100`} />
                      </div>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 animate-in slide-in-from-top-5 fade-in-50">
                    <div className="p-2">
                      <div className="flex items-center mb-1">
                        <Film className="h-4 w-4 mr-2 text-red-500" />
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Movies</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-red-500 transition-colors">
                          <Link href="/genre/movie/action">Action</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-red-500 transition-colors">
                          <Link href="/genre/movie/comedy">Comedy</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-red-500 transition-colors">
                          <Link href="/genre/movie/drama">Drama</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-red-500 transition-colors">
                          <Link href="/genre/movie/horror">Horror</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-red-500 transition-colors">
                          <Link href="/genre/movie/scifi">Sci-Fi</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-red-500 transition-colors">
                          <Link href="/genre/movie/thriller">Thriller</Link>
                        </DropdownMenuItem>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <div className="flex items-center mb-1">
                        <Tv className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-xs font-semibold uppercase text-muted-foreground">TV Shows</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-blue-500 transition-colors">
                          <Link href="/genre/tv/action">Action</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-blue-500 transition-colors">
                          <Link href="/genre/tv/comedy">Comedy</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-blue-500 transition-colors">
                          <Link href="/genre/tv/drama">Drama</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-blue-500 transition-colors">
                          <Link href="/genre/tv/crime">Crime</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-blue-500 transition-colors">
                          <Link href="/genre/tv/documentary">Documentary</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-blue-500 transition-colors">
                          <Link href="/genre/tv/anime">Anime</Link>
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavigationMenuItem>
              
              {/* My List (authenticated users only) */}
              {isAuthenticated && (
                <NavigationMenuItem>
                  <Link href="/my-list">
                    <NavigationMenuLink
                      className={`px-4 py-2 text-sm font-medium relative overflow-hidden group transition-colors duration-300
                        ${location === "/my-list" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <span className="relative z-10">My List</span>
                      {location === "/my-list" && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></span>
                      )}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        {/* Right Side Elements */}
        <div className="flex items-center space-x-4">
          {/* Search Input & Button */}
          <div className="relative">
            {searchActive ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Titles, people, genres"
                    className="w-56 pl-8 pr-3 py-1.5 bg-black/50 border border-gray-700 rounded-full text-sm focus:outline-none focus:ring-1 focus:border-red-600 focus:ring-red-600 transition-all animate-in fade-in-0 slide-in-from-right-5"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  
                  {/* Search Suggestions */}
                  <SearchSuggestions 
                    query={searchQuery}
                    onItemClick={() => {
                      setSearchActive(false);
                      setSearchQuery('');
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={toggleSearch}
                  className="ml-1 hover:bg-gray-800/50 transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4 hover:text-red-500 transition-colors" />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                onClick={toggleSearch}
                className="rounded-full hover:bg-gray-800/50 transition-transform hover:scale-110 duration-200"
              >
                <SearchIcon className="h-5 w-5 hover:text-red-500 transition-colors" />
              </Button>
            )}
          </div>
          
          {/* Notifications (authenticated users only) */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="rounded-full hover:bg-gray-800/50 transition-transform hover:scale-110 duration-200 relative"
            >
              <Bell className="h-5 w-5 hover:text-red-500 transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            </Button>
          )}
          
          {/* User Menu or Sign In Button */}
          {isAuthenticated ? (
            <DropdownMenu onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-800/50 transition-colors p-1 rounded-full">
                  <Avatar className="h-8 w-8 border-2 border-transparent hover:border-red-600 transition-colors">
                    <AvatarImage 
                      src={user?.profileImageUrl || ""} 
                      alt={user?.firstName || "User"} 
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-800 text-red-500">{user?.firstName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-48 animate-in slide-in-from-top-5 fade-in-50">
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-red-500 transition-colors">
                  <Link href="/profile" className="flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-red-500 transition-colors">
                  <Link href="/my-list" className="flex items-center">
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      <path d="m9 14 2 2 4-4"></path>
                    </svg>
                    My List
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-red-500 transition-colors">
                  <Link href="/settings" className="flex items-center">
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Settings
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="hover:bg-gray-800/50 hover:text-red-500 transition-colors">
                  <Link href="/quiz" className="flex items-center">
                    <div className="mr-2 relative">
                      <Film className="h-4 w-4" />
                      <Tv className="h-3 w-3 absolute -right-1 -bottom-1 text-blue-500" />
                    </div>
                    Retake Quiz
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }} 
                  className="hover:bg-gray-800/50 text-red-500 hover:text-red-400 transition-colors flex items-center"
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <NavAuthButton />
          )}
        </div>
      </div>
      
      {/* Bottom red glow line - appears stronger when scrolled */}
      <div className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}></div>
    </nav>
  );
};

export default Navbar;
