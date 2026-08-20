"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Menu, X, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { auth } from "@/auth";
import SignIn from "@/components/auth/sign-in";
import SignOut from "./auth/sign-out";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  //   const session = await auth();

  if (!session?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <SignIn />
        </div>
      </main>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Left: Brand Logo (Fixed width section) */}
        <div className="flex items-center justify-start w-1/4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight">Opsify</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (Centered perfectly) */}
        <nav className="hidden md:flex items-center justify-center gap-8 text-sm font-medium text-muted-foreground w-1/2">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/aws-setup"
            className="transition-colors hover:text-foreground text-foreground" 
          >
            Launch Cloudformation
          </Link>
        </nav>

        {/* Right Side Actions / Profile Dropdown (Fixed width section, aligned right) */}
        <div className="hidden md:flex items-center justify-end w-1/4">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-1"
            >
              <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex items-center justify-center font-semibold text-sm text-black">
                {session.user.name || "User"}
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-full w-full object-cover cursor-pointer"
                  />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground " />
                )}
              </div>
              <SignOut />
            </button>

            
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/dashboard"
            className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/aws-setup"
            className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => setIsOpen(false)}
          >
            Launch Cloudformation
          </Link>
          <div className="pt-2 border-t border-border">
            <SignOut />
          </div>
        </div>
      )}
    </header>
  );
}
