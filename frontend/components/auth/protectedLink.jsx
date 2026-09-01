"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function ProtectedLink({
  href,
  children,
  className = "",
  onClick,
}) {
  const { status } = useSession();

  const handleClick = (event) => {
    if (status !== "authenticated") {
      event.preventDefault();

      toast.warning("Please sign in to Opsify.");

      return;
    }

    onClick?.(event);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  );
}