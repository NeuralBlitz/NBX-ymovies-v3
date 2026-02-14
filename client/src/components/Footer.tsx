import React from "react";
import { Link } from "wouter";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 border-t border-gray-800 bg-black relative z-10 mt-20">
      <div className="container mx-auto">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
          {/* About */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">About</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Stream movies and TV shows in high definition. Discover personalized recommendations tailored to your taste.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Browse</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/home" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/movies" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/tv" className="text-gray-400 hover:text-white transition-colors text-sm">
                  TV Shows
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Genres</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/genre/movie/action" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Action
                </Link>
              </li>
              <li>
                <Link href="/genre/movie/comedy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Comedy
                </Link>
              </li>
              <li>
                <Link href="/genre/movie/drama" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Drama
                </Link>
              </li>
              <li>
                <Link href="/genre/movie/horror" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Horror
                </Link>
              </li>
              <li>
                <Link href="/genre/movie/scifi" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Sci-Fi
                </Link>
              </li>
              <li>
                <Link href="/genre/movie/thriller" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Thriller
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Account</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/signin" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/my-list" className="text-gray-400 hover:text-white transition-colors text-sm">
                  My List
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider + legal */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">&copy; {currentYear} YMovies. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors text-xs">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-white transition-colors text-xs">
                Terms
              </Link>
              <a
                href="https://github.com/yassnemo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors text-xs"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
