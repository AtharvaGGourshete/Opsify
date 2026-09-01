"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SignOut() {
  return (
    <button
      onClick={() =>
        signOut({
          callbackUrl: "/?signedOut=true",
        })
      }
      className="flex items-center gap-1 rounded-md text-black cursor-pointer w-full"
    >
      <LogOut size={15} />
      Logout
    </button>
  );
}