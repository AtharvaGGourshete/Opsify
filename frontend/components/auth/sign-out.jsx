"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-1 rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600 cursor-pointer"
    >
      <LogOut size={15}/>
      Logout
    </button>
  );
}