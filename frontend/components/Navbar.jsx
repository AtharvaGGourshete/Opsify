"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import SignIn from "@/components/auth/sign-in";
import SignOut from "./auth/sign-out";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [navbarTheme, setNavbarTheme] = useState("teal");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false); // Added state for controlling the dialog
  const { data: session } = useSession();

  useEffect(() => {
    const sections = document.querySelectorAll(
      "[data-navbar-theme]"
    );

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        if (visibleSections.length > 0) {
          const theme =
            visibleSections[0].target.dataset.navbarTheme;

          setNavbarTheme(theme);
        }
      },
      {
        threshold: [0.15, 0.3, 0.5, 0.7],
        rootMargin: "-64px 0px -35% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const navbarThemes = {
    teal: {
      background: "bg-[#58a4b0]",
      text: "text-black",
      hover: "hover:bg-black/10",
    },

    light: {
      background: "bg-[#cdedf6]",
      text: "text-black",
      hover: "hover:bg-black/10",
    },

    white: {
      background: "bg-white",
      text: "text-black",
      hover: "hover:bg-black/5",
    },
  };

  const currentTheme =
    navbarThemes[navbarTheme] || navbarThemes.teal;

  if (!session?.user) {
    return (
      <header
        className={`sticky top-0 z-50 w-full ${currentTheme.background} ${currentTheme.text} border-b border-black/5 backdrop-blur-xl transition-colors duration-500`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          {/* Logo */}
          <div className="flex w-1/4 items-center justify-start">
            <Link href="/" className="flex items-center space-x-2 text-black">
              <span className="text-3xl font-bold tracking-tight">Opsify</span>
            </Link>
          </div>


          {/* Sign In */}
          <div className="flex w-1/4 items-center justify-end">
            <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                  Sign In
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign in to Opsify</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <span className="cursor-pointer">Cancel</span>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <SignIn />
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full ${currentTheme.background} ${currentTheme.text} border-b border-black/5 backdrop-blur-xl transition-colors duration-500`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <div className="flex w-1/4 items-center justify-start">
          <Link href="/" className="flex items-center space-x-2 text-black">
            <span className="text-3xl font-bold tracking-tight">Opsify</span>
          </Link>
        </div>

        {/* Profile */}
        <div className="hidden w-1/4 items-center justify-end md:flex">
          <div className="relative">
            {/* Dropdown Trigger */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gray-100 transition"
            >
              {session.user.image ? (
                <img
                  src={session.user.image}
                  className="h-full w-full cursor-pointer object-cover"
                  alt="Profile"
                />
              ) : (
                <User className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md border border-gray-200 bg-white px-1 py-1 shadow-lg ring-1 ring-black ring-opacity-5 justify-center">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm transition-colors flex items-center gap-1 rounded-md text-black hover:bg-[#58a4b0] cursor-pointer"
                >
                  <User size={15} />Profile
                </Link>
                <div
                  className="block cursor-pointer px-4 py-2 text-sm text-gray-700 transition-colors rounded-md hover:bg-red-500"
                  onClick={() => setDropdownOpen(false)}
                >
                  <SignOut />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-black/70 transition hover:bg-black/10 hover:text-black focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="space-y-3 border-b border-white/10 bg-[#fafafa] px-4 pb-6 pt-2 md:hidden">
          <Link
            href="/dashboard"
            className="block rounded-md px-3 py-2 text-base font-medium text-black transition hover:bg-black/5"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            href="/profile"
            className="block rounded-md px-3 py-2 text-base font-medium text-black transition hover:bg-black/5"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>

          <Link
            href="/aws-setup"
            className="block rounded-md px-3 py-2 text-base font-medium text-black/70 transition hover:bg-black/5 hover:text-black"
            onClick={() => setIsOpen(false)}
          >
            Launch Cloudformation
          </Link>

          <div className="border-t border-black/10 pt-3 px-3">
            <SignOut />
          </div>
        </div>
      )}
    </header>
  );
}