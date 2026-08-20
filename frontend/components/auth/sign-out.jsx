"use client";

import { signOut } from "next-auth/react";

export default function SignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600 cursor-pointer"
    >
      Logout
    </button>
  );
}