"use client";

import React, { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { data: session } = useSession();

  return (
    <header
      className="
        sticky
        top-0
        z-50
        w-full
        bg-[#58a4b0]
        text-black
        backdrop-blur-2xl
        backdrop-saturate-150
        transition-all
        duration-300
      "
    >
      {/* Glass highlight */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          bg-gradient-to-b
          from-white/20
          via-white/5
          to-transparent
        "
      />

      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex w-1/4 items-center justify-start">
          <Link
            href="/"
            className="group flex items-center"
          >
            <span className="text-3xl font-bold tracking-tight text-black transition-opacity group-hover:opacity-70">
              Opsify
            </span>
          </Link>
        </div>
        {!session?.user ? (
          <div className="flex w-1/4 items-center justify-end">
            <AlertDialog
              open={showAuthDialog}
              onOpenChange={setShowAuthDialog}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="
                    cursor-pointer
                    rounded-xl
                    border-black/15
                    bg-white/30
                    font-semibold
                    text-black
                    shadow-sm
                    backdrop-blur-xl
                    transition-all
                    hover:border-black/20
                    hover:bg-white/50
                  "
                >
                  Sign In
                </Button>

              </AlertDialogTrigger>

              <AlertDialogContent>

                <AlertDialogHeader>

                  <AlertDialogTitle>
                    Sign in to Opsify
                  </AlertDialogTitle>

                </AlertDialogHeader>

                <AlertDialogFooter>

                  <AlertDialogCancel>
                    <span className="cursor-pointer">
                      Cancel
                    </span>
                  </AlertDialogCancel>

                  <AlertDialogAction asChild>
                    <SignIn />
                  </AlertDialogAction>

                </AlertDialogFooter>

              </AlertDialogContent>

            </AlertDialog>

          </div>

        ) : (

          <div className="hidden w-1/4 items-center justify-end md:flex">

            <div className="relative">

              {/* =================================================
                  PROFILE BUTTON
              ================================================= */}

              <button
                onClick={() =>
                  setDropdownOpen(!dropdownOpen)
                }
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border
                  border-white/50
                  bg-white/25
                  shadow-lg
                  backdrop-blur-xl
                  transition-all
                  duration-200
                  hover:scale-105
                  hover:bg-white/40
                "
              >

                {session.user.image ? (

                  <img
                    src={session.user.image}
                    className="h-full w-full cursor-pointer object-cover"
                    alt="Profile"
                  />

                ) : (

                  <User className="h-5 w-5 text-black" />

                )}

              </button>

              {/* =================================================
                  DROPDOWN
              ================================================= */}

              {dropdownOpen && (

                <div
                  className="
                    absolute
                    right-0
                    mt-3
                    w-52
                    origin-top-right
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/60
                    bg-white/70
                    p-1.5
                    shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]
                    backdrop-blur-2xl
                    backdrop-saturate-150
                  "
                >

                  <Link
                    href="/profile"
                    onClick={() =>
                      setDropdownOpen(false)
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      text-black
                      transition-colors
                      hover:bg-[#58a4b0]/30
                    "
                  >
                    <User size={15} />
                    Profile
                  </Link>

                  <div
                    className="
                      mt-1
                      flex
                      cursor-pointer
                      items-center
                      rounded-xl
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      text-zinc-700
                      transition-colors
                      hover:bg-red-500
                      hover:text-red-600
                    "
                    onClick={() =>
                      setDropdownOpen(false)
                    }
                  >
                    <SignOut />
                  </div>

                </div>

              )}

            </div>

          </div>

        )}

        {/* =====================================================
            MOBILE MENU BUTTON
        ===================================================== */}

        {session?.user && (

          <div className="flex md:hidden">

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="
                inline-flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-white/40
                bg-white/20
                text-black/80
                shadow-sm
                backdrop-blur-xl
                transition-all
                hover:bg-white/35
                hover:text-black
                focus:outline-none
              "
            >

              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}

            </button>

          </div>

        )}

      </div>

      {/* =======================================================
          MOBILE NAVIGATION
      ======================================================= */}

      {isOpen && session?.user && (

        <div
          className="
            border-t
            border-white/30
            bg-white/35
            px-4
            pb-6
            pt-3
            shadow-[0_20px_40px_-30px_rgba(0,0,0,0.3)]
            backdrop-blur-2xl
            backdrop-saturate-150
            md:hidden
          "
        >

          <div className="space-y-1.5">

            <Link
              href="/dashboard"
              className="
                block
                rounded-xl
                px-4
                py-3
                text-sm
                font-semibold
                text-black
                transition
                hover:bg-white/40
              "
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>

            <Link
              href="/profile"
              className="
                block
                rounded-xl
                px-4
                py-3
                text-sm
                font-semibold
                text-black
                transition
                hover:bg-white/40
              "
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>

            <Link
              href="/aws-setup"
              className="
                block
                rounded-xl
                px-4
                py-3
                text-sm
                font-semibold
                text-black/70
                transition
                hover:bg-white/40
                hover:text-black
              "
              onClick={() => setIsOpen(false)}
            >
              Launch Cloudformation
            </Link>

          </div>

          <div className="mt-3 border-t border-black/10 px-3 pt-4">
            <SignOut />
          </div>

        </div>

      )}

    </header>
  );
}