"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { getUserProfile } from "@/services/authService";

const icons = {
  github: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
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

  settings: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.9 1.9-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20h-2.68v-.08a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.9-1.9.06-.06A1.7 1.7 0 0 0 7.4 15a1.7 1.7 0 0 0-1.56-1.04H5.75v-2.68h.09A1.7 1.7 0 0 0 7.4 10.24a1.7 1.7 0 0 0-.34-1.88L7 8.3l1.9-1.9.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.04-1.56V5.15h2.68v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.9 1.9-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04h.09v2.68h-.09A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  ),
};

function DetailCard({ label, value, hint, mono = false }) {
  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md hover:shadow-black/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          {label}
        </p>

        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-200 transition-colors group-hover:bg-[#58a4b0]" />
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
function StatusCard({ title, description, active, loading }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md hover:shadow-black/[0.03]">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
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

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#cdedf6] px-5 py-10 text-black md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-24 rounded bg-white/70" />
            <div className="h-14 w-64 rounded-xl bg-white/70" />
            <div className="h-5 w-96 max-w-full rounded bg-white/70" />
            <div className="mt-10 h-72 rounded-[2rem] bg-white/70" />
          </div>
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#cdedf6] px-6 text-black">

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div className="relative w-full max-w-md rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-[0_25px_70px_-35px_rgba(0,0,0,0.3)]">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white">
            {icons.user}
          </div>

          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
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
    <main className="relative min-h-screen overflow-hidden bg-[#cdedf6]/70 px-5 py-10 text-black md:px-8 md:py-14">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10">

        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-black/[0.025] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

      </div>

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <header className="mb-14">

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">

            <div className="max-w-4xl">
              <h1 className="text-5xl leading-[0.92] tracking-[-0.06em] text-[#58a4b0] sm:text-6xl md:text-7xl">
                <span className="text-[#58a4b0]">
                 Profile.
                </span>
              </h1>
            </div>

            <div
              className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold ${
                isAwsConnected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-zinc-200 bg-white text-zinc-600"
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

        <section className="overflow-hidden rounded-[2rem] bg-[#58a4b0] text-white shadow-[0_25px_70px_-35px_rgba(0,0,0,0.45)]">

          <div className="relative overflow-hidden px-7 py-8 md:px-10 md:py-10">
            <div className="pointer-events-none absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-white/[0.025] blur-3xl" />

            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

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
                    className="h-[88px] w-[88px] rounded-full border border-black/20 object-cover shadow-2xl"
                  />
                ) : (
                  <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border border-black/20 bg-white/10 text-3xl font-black">
                    {(user.name || "U")
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">

                  <h2 className="truncate text-2xl font-black tracking-tight sm:text-3xl">
                    {user.name || "Opsify User"}
                  </h2>

                  <p className="mt-1.5 truncate text-sm text-white sm:text-base">
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

          <div className="grid grid-cols-1 border-t border-white/10 sm:grid-cols-3">

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
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="mt-12 grid gap-7 lg:grid-cols-[1.35fr_0.65fr]">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-7">

            {/* =================================================
                GITHUB
            ================================================= */}

            <section>

              <SectionHeading
                title="GitHub information"
                icon={icons.github}
              />

              <Card className="border-zinc-200 bg-white py-0 shadow-sm">

                <CardContent className="p-7 md:p-8">

                  <div className="grid gap-4 md:grid-cols-2">

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

            </section>

            {/* =================================================
                AWS
            ================================================= */}

            <section>

              <SectionHeading
                eyebrow="Infrastructure"
                title="AWS connection"
                number="02"
                icon={icons.cloud}
                action={
                  isAwsConnected ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      Connected
                    </span>
                  ) : (
                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-600">
                      Not configured
                    </span>
                  )
                }
              />

              <Card className="border-zinc-200 bg-white py-0 shadow-sm">

                <CardContent className="p-7 md:p-8">

                  <div className="grid gap-4 md:grid-cols-2">

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

            </section>

          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <aside>

            <section>

              <SectionHeading
                eyebrow="System"
                title="Connection health"
                number="03"
                icon={icons.shield}
              />

              <Card className="border-zinc-200 bg-white py-0 shadow-sm">

                <CardContent className="p-7">

                  <div className="space-y-3">

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

            </section>

            {/* System note */}

            <div className="mt-7 rounded-2xl border border-black/10 bg-[#58a4b0]/20 p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                  {icons.server}
                </div>

                <div>

                  <p className="text-sm font-bold text-black">
                    Opsify infrastructure
                  </p>

                  <p className="mt-2 text-xs leading-5 text-zinc-700">
                    Your AWS connection is used by Opsify when
                    preparing and executing deployment workflows.
                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>

        {/* =================================================
            FOOTER SPACE
        ================================================= */}

        <div className="h-10" />

      </div>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  number,
  icon,
  action,
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-5">

      <div className="flex items-center gap-3">
        <div>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-black sm:text-3xl">
            {title}
          </h2>

        </div>

      </div>

      {action}

    </div>
  );
}
function QuickMetric({ label, value }) {
  return (
    <div className="border-b border-white/10 px-6 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 md:px-8">

      <p className="text-lg font-extrabold tracking-tighter text-white">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-bold text-white">
        {value}
      </p>

    </div>
  );
}