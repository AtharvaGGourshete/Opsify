"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { saveGithubUser } from "@/services/authService";

export default function SyncGithubUser() {
  const { data: session, status } = useSession();

  const synced = useRef(false);

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !session?.user ||
      synced.current
    ) {
      return;
    }

    const syncUser = async () => {
      try {
        synced.current = true;

        const githubData = {
          github_user_id: session.user.githubId,
          github_username: session.user.name,
          github_email: session.user.email,
        };

        const result = await saveGithubUser(githubData);

        console.log("GitHub user synced:", result);
      } catch (error) {
        console.error("GitHub sync failed:", error);

        synced.current = false;
      }
    };

    syncUser();
  }, [session, status]);

  return null;
}