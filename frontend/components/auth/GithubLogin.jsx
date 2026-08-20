"use client";

import { signIn } from "next-auth/react";

export default function GithubLogin() {
  const handleLogin = async () => {
    await signIn("github", {
      callbackUrl: "/dashboard",
    });
  };

  return (
    <button onClick={handleLogin}>
      Continue with GitHub
    </button>
  );
}