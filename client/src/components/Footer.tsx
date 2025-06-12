import React from "react";
import { Link } from "wouter";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Music, 
  ExternalLink
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-black/80 backdrop-blur-sm border-t border-gray-800 mt-20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and info section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <img src="/logo.svg" alt="YMovies Logo" className="h-8 w-8 mr-2" />
              <span className="text-red-600 font-bold text-2xl font-['Schkorycza_Regular']">YMovies</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              Discover and enjoy your next favorite movie with personalized recommendations.
            </p>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-red-500 transition-colors duration-200">Home</Link>
              </li>
              <li>
                <Link href="/tv" className="hover:text-red-500 transition-colors duration-200">TV Shows</Link>
              </li>
              <li>
                <Link href="/my-list" className="hover:text-red-500 transition-colors duration-200">My List</Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-red-500 transition-colors duration-200">Search</Link>
              </li>
            </ul>
          </div>
          
          {/* Developer info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Developer</h3>
            <div className="text-gray-400">
              <p className="mb-2">Created by <a href="https://yerradouani.com" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 transition-colors inline-flex items-center">
                Yassine Erradouani <ExternalLink className="ml-1 h-3 w-3" />
              </a></p>
              <div className="flex space-x-4 mt-4">
                <a 
                  href="https://github.com/yassnemo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/yassine-erradouani/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href="https://x.com/erradouanii"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="https://soundcloud.com/yassine-erradouani"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="SoundCloud"
                >
                  <Music className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Newsletter/Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">About</h3>
            <p className="text-gray-400 text-sm max-w-xs">
              YMovies is a Netflix-style streaming platform with intelligent movie 
              recommendations powered by advanced AI algorithms.
            </p>
          </div>
        </div>
        
        {/* Bottom bar with copyright */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {currentYear} YMovies. All rights reserved.</p>
          <div className="flex mt-4 md:mt-0">
            <span className="relative pr-6 mr-6 after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:h-3 after:w-px after:bg-gray-700">
              <Link href="/privacy" className="hover:text-red-500 transition-colors duration-200">Privacy</Link>
            </span>
            <Link href="/terms" className="hover:text-red-500 transition-colors duration-200">Terms</Link>
          </div>
        </div>
        
        {/* Bottom red glow line */}
        <div className="mt-8 h-[1px] w-full bg-gradient-to-r from-transparent via-red-600/50 to-transparent"></div>
      </div>
    </footer>
  );
};

export default Footer;
