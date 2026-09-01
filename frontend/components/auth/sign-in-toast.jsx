"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function SignInToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("signedIn") === "true") {
      toast.success("Signed in successfully.", {
        duration: 4000,
      });

      router.replace("/");
    }
  }, [searchParams, router]);

  return null;
}