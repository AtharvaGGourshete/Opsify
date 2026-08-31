"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  useSession,
} from "next-auth/react";

import {
  saveGithubUser,
} from "@/services/authService";

export default function SyncGithubUser() {
  const {
    data: session,
    status,
  } = useSession();

  const syncedGithubId =
    useRef(null);

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !session?.user
    ) {
      return;
    }

    const github_user_id =
      session.user.githubId;

    if (!github_user_id) {
      console.error(
        "GitHub sync failed: githubId is missing from session"
      );

      return;
    }

    /*
     * Prevent duplicate synchronization.
     */
    if (
      syncedGithubId.current ===
      String(github_user_id)
    ) {
      return;
    }

    const syncUser = async () => {
      try {
        const githubData = {
          github_user_id:
            String(github_user_id),

          github_username:
            session.user.githubUsername ||
            session.user.name ||
            null,

          github_email:
            session.user.email ||
            null,
        };

        console.log(
          "Synchronizing GitHub user:",
          githubData
        );

        /*
         * Mark as synced only after
         * successful API response.
         */
        const result =
          await saveGithubUser(
            githubData
          );

        syncedGithubId.current =
          String(github_user_id);

        console.log(
          "GitHub user synced successfully:",
          result
        );

      } catch (error) {
        console.error(
          "GitHub sync failed:",
          error
        );

        /*
         * Leave syncedGithubId unchanged
         * so another attempt is possible.
         */
      }
    };

    syncUser();

  }, [session, status]);

  return null;
}