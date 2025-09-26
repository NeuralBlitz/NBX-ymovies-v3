import React, { useState } from "react";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <footer
      className="py-16 px-4 border-t border-gray-800 bg-black relative z-10 mt-20"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="max-w-8xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-8 gap-8 mb-12">
          {/* About Section (always expanded) */}
          <div className="col-span-2 lg:col-span-2">
            <h3 className="font-bold text-white text-lg mb-4">About Us</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Experience limitless entertainment with YMovies! Stream blockbuster movies and binge-worthy TV shows in
              seamless high-definition. Enjoy a user-friendly interface for your ultimate viewing pleasure.
            </p>
          </div>

          {/* Spacer for equal padding */}
          <div className="lg:col-span-1 hidden lg:block"></div>

          {/* Browse Section */}
          <div className="lg:col-span-1">
            <button
              type="button"
              onClick={() => toggleSection("browse")}
              className="w-full flex items-center justify-start gap-2 md:cursor-default md:pointer-events-none"
              aria-expanded={!!openSections["browse"]}
              aria-controls="footer-browse"
            >
              <h3 className="font-bold text-white text-lg">Browse</h3>
              <ChevronDown
                className={`h-5 w-5 transition-transform md:hidden ${openSections["browse"] ? "rotate-180" : ""}`}
              />
            </button>
            <div id="footer-browse" className={`${openSections["browse"] ? "mt-4 block" : "hidden"} md:block`}>
              <ul className="space-y-3">
                <li>
                  <Link href="/home" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/movies" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link href="/tv" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    TV Shows
                  </Link>
                </li>
                <li>
                  <Link href="/popular" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Popular
                  </Link>
                </li>
                <li>
                  <Link href="/top-rated" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Top Rated
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Genres Section */}
          <div className="lg:col-span-1">
            <button
              type="button"
              onClick={() => toggleSection("genres")}
              className="w-full flex items-center justify-start gap-2 md:cursor-default md:pointer-events-none"
              aria-expanded={!!openSections["genres"]}
              aria-controls="footer-genres"
            >
              <h3 className="font-bold text-white text-lg">Genres</h3>
              <ChevronDown
                className={`h-5 w-5 transition-transform md:hidden ${openSections["genres"] ? "rotate-180" : ""}`}
              />
            </button>
            <div id="footer-genres" className={`${openSections["genres"] ? "mt-4 block" : "hidden"} md:block`}>
              <ul className="space-y-3">
                <li>
                  <Link href="/genre/action" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Action
                  </Link>
                </li>
                <li>
                  <Link href="/genre/comedy" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Comedy
                  </Link>
                </li>
                <li>
                  <Link href="/genre/drama" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Drama
                  </Link>
                </li>
                <li>
                  <Link href="/genre/horror" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Horror
                  </Link>
                </li>
                <li>
                  <Link href="/genre/romance" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Romance
                  </Link>
                </li>
                <li>
                  <Link
                    href="/genre/documentary"
                    className="text-gray-400 hover:text-red-600 transition-colors text-sm"
                  >
                    Documentary
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Franchises Section */}
          <div className="lg:col-span-1">
            <button
              type="button"
              onClick={() => toggleSection("franchises")}
              className="w-full flex items-center justify-start gap-2 md:cursor-default md:pointer-events-none"
              aria-expanded={!!openSections["franchises"]}
              aria-controls="footer-franchises"
            >
              <h3 className="font-bold text-white text-lg">Franchises</h3>
              <ChevronDown
                className={`h-5 w-5 transition-transform md:hidden ${openSections["franchises"] ? "rotate-180" : ""}`}
              />
            </button>
            <div
              id="footer-franchises"
              className={`${openSections["franchises"] ? "mt-4 block" : "hidden"} md:block`}
            >
              <ul className="space-y-3">
                <li>
                  <Link href="/franchise/marvel" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Marvel
                  </Link>
                </li>
                <li>
                  <Link href="/franchise/dc" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    DC
                  </Link>
                </li>
                <li>
                  <Link href="/franchise/cw" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    CW
                  </Link>
                </li>
                <li>
                  <Link href="/franchise/anime" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Anime
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* User Section */}
          <div className="lg:col-span-1">
            <button
              type="button"
              onClick={() => toggleSection("user")}
              className="w-full flex items-center justify-start gap-2 md:cursor-default md:pointer-events-none"
              aria-expanded={!!openSections["user"]}
              aria-controls="footer-user"
            >
              <h3 className="font-bold text-white text-lg">User</h3>
              <ChevronDown
                className={`h-5 w-5 transition-transform md:hidden ${openSections["user"] ? "rotate-180" : ""}`}
              />
            </button>
            <div id="footer-user" className={`${openSections["user"] ? "mt-4 block" : "hidden"} md:block`}>
              <ul className="space-y-3">
                <li>
                  <Link href="/signin" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link href="/watchlist" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Watchlist
                  </Link>
                </li>
                <li>
                  <Link href="/watch-history" className="text-gray-400 hover:text-red-600 transition-colors text-sm">
                    Watch History
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Follow Us Section (with website link added) */}
          <div className="lg:col-span-1">
            <button
              type="button"
              onClick={() => toggleSection("follow")}
              className="w-full flex items-center justify-start gap-2 md:cursor-default md:pointer-events-none"
              aria-expanded={!!openSections["follow"]}
              aria-controls="footer-follow"
            >
              <h3 className="font-bold text-white text-lg">Follow Us</h3>
              <ChevronDown
                className={`h-5 w-5 transition-transform md:hidden ${openSections["follow"] ? "rotate-180" : ""}`}
              />
            </button>
            <div id="footer-follow" className={`${openSections["follow"] ? "mt-4 block" : "hidden"} md:block`}>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://yerradouani.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-600 transition-colors text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm7.938 9h-3.167a15.91 15.91 0 0 0-1.2-5.103A8.027 8.027 0 0 1 19.938 11zM12 4c1.66 0 3.186 2.074 3.87 5H8.13C8.814 6.074 10.34 4 12 4zM7.429 13h9.142c-.272 2.03-1.054 3.86-2.15 5.103A7.957 7.957 0 0 1 12 20a7.957 7.957 0 0 1-2.421-1.897C8.483 16.86 7.701 15.03 7.429 13zM8.229 6.897A15.91 15.91 0 0 0 7.029 12H3.062a8.027 8.027 0 0 1 5.167-5.103zM3.062 13h3.167c.272 2.03 1.054 3.86 2.15 5.103A8.027 8.027 0 0 1 3.062 13zM15.771 6.897A15.91 15.91 0 0 1 16.971 12h3.967a8.027 8.027 0 0 0-5.167-5.103z" />
                    </svg>
                    Website
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/yassnemo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-600 transition-colors text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com/yassnemo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-600 transition-colors text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com/in/yassnemo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-600 transition-colors text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com/yassnemo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-600 transition-colors text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.59-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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
            <Link href="/about" className="text-gray-400 hover:text-red-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-red-600 transition-colors">
              Contact Us
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-red-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-red-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/dmca" className="text-gray-400 hover:text-red-600 transition-colors">
              DMCA
            </Link>
          </div>

          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <p className="text-gray-500 text-sm">&copy; {currentYear} YMovies. All rights reserved.</p>
              <div className="flex items-center">
                <div className="hidden sm:block w-px h-4 bg-gray-600 mx-2"></div>
                <a href="/humans.txt" className="text-gray-500 text-sm font-semibold relative group inline-block">
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
  );
};

export default Footer;
