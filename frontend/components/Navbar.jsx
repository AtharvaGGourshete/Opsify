"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import SignIn from "@/components/auth/sign-in";
import SignOut from "./auth/sign-out";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <SignIn />
        </div>
      </main>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black text-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">

        {/* Logo */}
        <div className="flex w-1/4 items-center justify-start">
          <Link
            href="/"
            className="flex items-center space-x-2 text-white"
          >
            <span className="text-xl font-bold tracking-tight">
              Opsify
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden w-1/2 items-center justify-center gap-8 text-sm font-medium md:flex">
          <Link
            href="/dashboard"
            className="text-white transition-colors hover:text-white/60"
          >
            Dashboard
          </Link>

          <Link
            href="/aws-setup"
            className="text-white transition-colors hover:text-white/60"
          >
            Launch Cloudformation
          </Link>
        </nav>

        {/* Profile */}
        <div className="hidden w-1/4 items-center justify-end md:flex">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-full p-1 text-white transition focus:outline-none"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-full w-full cursor-pointer object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-white/70" />
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
            className="inline-flex items-center justify-center rounded-md p-2 text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="space-y-3 border-b border-white/10 bg-black px-4 pb-6 pt-2 md:hidden">

          <Link
            href="/dashboard"
            className="block rounded-md px-3 py-2 text-base font-medium text-white transition hover:bg-white/10"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            href="/aws-setup"
            className="block rounded-md px-3 py-2 text-base font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            Launch Cloudformation
          </Link>

          <div className="border-t border-white/10 pt-3">
            <SignOut />
          </div>
        </div>
      )}
    </header>
  );
}