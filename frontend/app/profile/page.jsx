"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { getUserProfile } from "@/services/authService";

/* =========================================================
   ICONS
========================================================= */

const icons = {
  github: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.25c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6-.01c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  ),

  cloud: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9H17.5a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  ),

  user: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),

  shield: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),

  server: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <path d="M7 7h.01M7 17h.01" />
    </svg>
  ),

  arrow: (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  ),
};

/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({ label, value, hint, mono = false }) {
  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:border-zinc-300 hover:shadow-md hover:shadow-black/[0.03]">

      <div className="flex items-start justify-between gap-4">

        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          {label}
        </p>

        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-200 transition-colors group-hover:bg-black" />

      </div>

      <p
        className={`mt-3 break-words text-[15px] font-semibold leading-6 text-zinc-950 ${
          mono ? "font-mono text-[13px]" : ""
        }`}
      >
        {value || "Not available"}
      </p>

      {hint ? (
        <p className="mt-2.5 text-xs leading-5 text-zinc-500">
          {hint}
        </p>
      ) : null}

    </div>
  );
}

/* =========================================================
   STATUS CARD
========================================================= */

function StatusCard({ title, description, active, loading }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            loading
              ? "bg-zinc-100 text-zinc-500"
              : active
                ? "bg-emerald-50 text-emerald-600"
                : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {icons.shield}
        </div>

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <p className="text-sm font-bold text-zinc-950">
              {title}
            </p>

            <span
              className={`h-1.5 w-1.5 rounded-full ${
                loading
                  ? "bg-zinc-400"
                  : active
                    ? "bg-emerald-500"
                    : "bg-zinc-300"
              }`}
            />

          </div>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   PROFILE PAGE
========================================================= */

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const [savedProfile, setSavedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (status !== "authenticated") {
        setLoading(false);
        return;
      }

      if (!session?.user?.githubId) {
        setError(
          "GitHub user ID is missing from the active session."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getUserProfile(
          session.user.githubId
        );

        setSavedProfile(data.profile);
      } catch (fetchError) {
        if (fetchError.message !== "User profile not found") {
          setError(fetchError.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [session, status]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-white px-5 py-10 text-black md:px-8">

        <div className="mx-auto max-w-6xl">

          <div className="animate-pulse space-y-6">

            <div className="h-5 w-24 rounded bg-zinc-100" />

            <div className="h-12 w-64 rounded-lg bg-zinc-100" />

            <div className="h-5 w-96 max-w-full rounded bg-zinc-100" />

            <div className="mt-10 h-64 rounded-3xl bg-zinc-100" />

          </div>

        </div>

      </main>
    );
  }

  /* =======================================================
     NOT AUTHENTICATED
  ======================================================= */

  if (!session?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-black">

        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white">
            {icons.user}
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight">
            Sign in required
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Authenticate with GitHub to access your Opsify profile.
          </p>

        </div>

      </main>
    );
  }

  const user = session.user;

  const isAwsConnected =
    savedProfile?.status === "connected";

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-black md:px-8 md:py-14">

      <div className="mx-auto max-w-6xl">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <header className="mb-10">

          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400">
            Account
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <h1 className="text-4xl font-black tracking-[-0.04em] text-zinc-950 sm:text-5xl">
                Profile
              </h1>

            </div>

            <div
              className={`flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold ${
                isAwsConnected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isAwsConnected
                    ? "bg-emerald-500"
                    : "bg-zinc-400"
                }`}
              />

              {isAwsConnected
                ? "AWS Connected"
                : "AWS Not Connected"}
            </div>

          </div>

        </header>

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-950 text-white shadow-[0_25px_70px_-35px_rgba(0,0,0,0.35)]">

          <div className="relative overflow-hidden px-7 py-8 md:px-10 md:py-10">

            {/* Decorative background */}
            <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-white/[0.05] blur-3xl" />

            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

              {/* Identity */}
              <div className="flex items-center gap-5">

                {user.image ? (
                  <Image
                    src={user.image}
                    alt={
                      user.name ||
                      "GitHub profile image"
                    }
                    width={88}
                    height={88}
                    className="h-[88px] w-[88px] rounded-2xl border border-white/10 object-cover shadow-xl"
                  />
                ) : (
                  <div className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl font-black">
                    {(user.name || "U")
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">

                  <div className="mb-2 flex items-center gap-2">

                  </div>

                  <h2 className="truncate text-2xl font-black tracking-tight sm:text-3xl">
                    {user.name || "Opsify User"}
                  </h2>

                  <p className="mt-1.5 truncate text-sm text-zinc-400 sm:text-base">
                    {savedProfile?.github_username
                      ? `@${savedProfile.github_username}`
                      : user.email ||
                        "No public GitHub email available"}
                  </p>

                </div>

              </div>

              

            </div>

          </div>

          {/* Quick metrics */}
          <div className="grid border-t border-white/10 grid-cols-3">

            <QuickMetric
              label="GitHub ID"
              value={user.githubId || "—"}
            />

            <QuickMetric
              label="AWS Status"
              value={
                savedProfile?.status ||
                "Authenticated"
              }
            />

            <QuickMetric
              label="Region"
              value={
                savedProfile?.aws_region ||
                "Not configured"
              }
            />

          </div>

        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

          {/* LEFT */}
          <div className="space-y-6">

            {/* GitHub */}
            <Card className="border-zinc-200 bg-white py-0 shadow-sm">

              <CardContent className="p-7 md:p-8">

                <SectionHeader
                  title="GitHub information"
                  icon={icons.github}
                />

                <div className="mt-7 grid gap-4 md:grid-cols-2">

                  <DetailCard
                    label="GitHub User ID"
                    value={user.githubId}
                    mono
                  />

                  <DetailCard
                    label="GitHub Username"
                    value={
                      savedProfile?.github_username ||
                      user.name
                    }
                  />

                  <DetailCard
                    label="Email Address"
                    value={
                      savedProfile?.github_email ||
                      user.email
                    }
                  />

                  <DetailCard
                    label="Database ID"
                    value={savedProfile?.id}
                    mono
                  />

                </div>

              </CardContent>

            </Card>

            {/* AWS */}
            <Card className="border-zinc-200 bg-white py-0 shadow-sm">

              <CardContent className="p-7 md:p-8">

                <SectionHeader
                  title="AWS connection"
                  icon={icons.cloud}
                  action={
                    isAwsConnected ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        Connected
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-600">
                        Not configured
                      </span>
                    )
                  }
                />

                <div className="mt-7 grid gap-4 md:grid-cols-2">

                  <DetailCard
                    label="AWS Account ID"
                    value={
                      savedProfile?.aws_account_id
                    }
                    mono
                  />

                  <DetailCard
                    label="AWS Region"
                    value={
                      savedProfile?.aws_region
                    }
                    mono
                  />

                  <DetailCard
                    label="Role Name"
                    value={
                      savedProfile?.role_name
                    }
                  />

                  <DetailCard
                    label="Connection Status"
                    value={
                      savedProfile?.status
                    }
                  />

                  <div className="md:col-span-2">

                    <DetailCard
                      label="Role ARN"
                      value={
                        savedProfile?.role_arn
                      }
                      mono
                    />

                  </div>

                  <div className="md:col-span-2">

                    <DetailCard
                      label="Bootstrap Stack"
                      value={
                        savedProfile?.bootstrap_stack_name
                      }
                    />

                  </div>

                </div>

              </CardContent>

            </Card>

          </div>

          {/* RIGHT */}
          <aside className="space-y-6">

            {/* Health */}
            <Card className="border-zinc-200 bg-white py-0 shadow-sm">

              <CardContent className="p-7">

                <SectionHeader
                  title="Connection health"
                  icon={icons.shield}
                />

                <div className="mt-7 space-y-3">

                  <StatusCard
                    title="GitHub session"
                    description={
                      status === "authenticated"
                        ? "Your GitHub authentication is active."
                        : "Authentication unavailable."
                    }
                    active={
                      status === "authenticated"
                    }
                    loading={false}
                  />

                  <StatusCard
                    title="Backend profile"
                    description={
                      loading
                        ? "Fetching saved account details."
                        : savedProfile
                          ? "Profile data loaded successfully."
                          : "No persisted profile found."
                    }
                    active={!!savedProfile}
                    loading={loading}
                  />

                  <StatusCard
                    title="AWS connection"
                    description={
                      isAwsConnected
                        ? "Opsify has an active AWS connection."
                        : "No active AWS connection detected."
                    }
                    active={isAwsConnected}
                    loading={false}
                  />

                </div>

              </CardContent>

            </Card>

            

          </aside>

        </div>


      </div>
    </main>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  eyebrow,
  title,
  icon,
  action,
}) {
  return (
    <div className="flex items-end justify-between gap-5">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
          {icon}
        </div>

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-950 sm:text-2xl">
            {title}
          </h2>

        </div>

      </div>

      {action}

    </div>
  );
}

/* =========================================================
   QUICK METRIC
========================================================= */

function QuickMetric({ label, value }) {
  return (
    <div className="px-6 py-5 md:px-8">

      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-bold text-white">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   DARK DETAIL
========================================================= */

function DarkDetail({ label, value }) {
  return (
    <div className="border-b border-white/10 pb-3 last:border-0 last:pb-0">

      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-semibold text-zinc-200">
        {value || "Not available"}
      </p>

    </div>
  );
}