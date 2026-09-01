"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignOutToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("signedOut") === "true") {
      toast.success("Signed out successfully.", {
        duration: 4000,
      });

      router.replace("/");
    }
  }, [searchParams, router]);

  return null;
}
