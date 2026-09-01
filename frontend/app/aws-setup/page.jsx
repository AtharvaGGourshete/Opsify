"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const githubConfig = {
  owner: process.env.NEXT_PUBLIC_GITHUB_OWNER,
  repository: process.env.NEXT_PUBLIC_GITHUB_REPOSITORY,
  branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH || "main",
};

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.25c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6-.01c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9H17.5a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function StepNumber({ number }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/50 bg-[#58a4b0]/25 text-[10px] font-black text-black shadow-sm backdrop-blur-xl">
      {number}
    </div>
  );
}

function CreationItem({ title, description }) {
  return (
    <div
      className="group rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-md"
    >
      <div className="flex gap-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-[#58a4b0]/20 text-black shadow-sm backdrop-blur-xl"
        >
          <CheckIcon />
        </div>

        <div>
          <p className="text-sm font-bold text-black">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-black/55">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AWSSetupPage() {
  const { data: session, status } = useSession();

  const [launchUrl, setLaunchUrl] = useState("");
  const [connectionId, setConnectionId] = useState("");
  const [stackName, setStackName] = useState("");
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function prepareAWSConnection() {
      if (status !== "authenticated") {
        return;
      }

      const github_user_id = session?.user?.githubId;



      if (!github_user_id) {
        setError("GitHub user ID is missing from the active session. Sign out and sign in again with GitHub.");

        setLoading(false);
        return;
      }

      const storedRepository =
        localStorage.getItem("opsify_selected_repository");

      if (!storedRepository) {
        setError(
          "No GitHub repository has been selected. Go to Deploy and select a repository first."
        );
        setLoading(false);
        return;
      }

      let repository;

      try {
        repository = JSON.parse(storedRepository);
      } catch {
        localStorage.removeItem("opsify_selected_repository");

        setError(
          "The selected GitHub repository could not be loaded. Please select it again."
        );
        setLoading(false);
        return;
      }

      if (
        !repository?.owner?.login ||
        !repository?.name
      ) {
        setError(
          "The selected GitHub repository information is incomplete. Please select the repository again."
        );
        setLoading(false);
        return;
      }

      setSelectedRepository(repository);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      try {
        setLoading(true);
        setError("");
        console.log("Checking existing AWS connection...");

        const profileResponse = await fetch(`${apiUrl.replace(/\/$/, "")}/api/auth/users/${github_user_id}`,
          {
            cache: "no-store",
          }
        );

        const profileData = await profileResponse.json();

        console.log("Existing profile:", profileData);
        if (profileResponse.ok && profileData?.profile?.status === "connected") {
          const profile = profileData.profile;
          setConnectionId(profile.connection_id || "");
          setStackName(profile.bootstrap_stack_name || "");
          setLaunchUrl("");
          setLoading(false);
          return;
        }

        console.log("Creating or reusing AWS connection...");

        const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/aws/connections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            github_user_id: github_user_id,

            github_owner:
              repository.owner.login,

            github_repository:
              repository.name,

            github_branch:
              repository.default_branch || "main",
          }),
        });

        const data = await response.json();
        console.log("AWS connection response:", data);
        if (!response.ok) throw new Error(data.message || "Failed to create AWS connection.");
        if (data.status === "connected") {
          setConnectionId(data.connectionId || "");
          setStackName(data.stackName || "");
          setLaunchUrl("");
          setLoading(false);
          return;
        }
        if (data.alreadyConnected) {
          console.log("AWS account is already connected:", data.connection);
          setConnectionId(data.connectionId || "");
          setStackName(data.stackName || "");
          setLaunchUrl("");
          return;
        }

        if (!data.launchUrl) throw new Error("AWS connection was created, but no CloudFormation launch URL was returned.");
        setLaunchUrl(data.launchUrl);
        setConnectionId(data.connectionId || "");
        setStackName(data.stackName || "");
      } catch (err) {
        console.error("AWS connection preparation failed:", err);
        setError(err instanceof Error ? err.message : "Failed to prepare AWS connection.");
      } finally {
        setLoading(false);
      }
    }

    prepareAWSConnection();
  }, [status, session]);

  if (status === "loading") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#cdedf6] px-6 py-12 text-black">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-white/40 blur-3xl" />
          <div className="absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-[#58a4b0]/20 blur-3xl" />
        </div>

        <div className="relative w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/50 p-10 text-center shadow-[0_30px_100px_-40px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/50 bg-[#58a4b0]/30 text-black shadow-sm backdrop-blur-xl">
            <CloudIcon />
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-black/40">
            Opsify
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-black">
            Loading
          </h1>

          <p className="mt-4 text-sm leading-6 text-black/50">
            Checking your GitHub authentication.
          </p>
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#cdedf6] px-6 py-12 text-black">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-white/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-[450px] w-[450px] rounded-full bg-[#58a4b0]/20 blur-3xl" />
        </div>

        <div className="relative w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/50 p-8 shadow-[0_30px_100px_-40px_rgba(0,0,0,0.25)] backdrop-blur-2xl md:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/50 bg-black text-white shadow-lg">
            <GithubIcon />
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-black/40">
            Opsify
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-black md:text-4xl">
            Authentication required
          </h1>

          <p className="mt-4 text-base leading-7 text-black/55">
            Sign in with GitHub before connecting your AWS account to Opsify.
          </p>

          <div className="mt-7 rounded-2xl border border-white/60 bg-white/35 p-4 backdrop-blur-xl">
            <p className="text-sm font-medium text-black/60">
              Use the Sign In option in the navigation bar to continue.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#cdedf6] px-5 py-10 text-black md:px-8 md:py-7">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-white/40 blur-3xl" />
          <div className="absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-[#58a4b0]/20 blur-3xl" />
        </div>
        <div className="relative mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">

          <div className="w-full rounded-[2rem] border border-red-200/70 bg-white/55 p-8 shadow-[0_30px_100px_-40px_rgba(0,0,0,0.25)] backdrop-blur-2xl md:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200/70 bg-red-50/70 text-red-600 backdrop-blur-xl">
              <InfoIcon />
            </div>

            <p className="mt-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-black/40">
              Opsify / AWS
            </p>

            <h1 className="mt-2 text-center text-3xl font-black tracking-tight text-black md:text-4xl">
              AWS connection failed
            </h1>

            <div className="mt-6 rounded-2xl border border-red-200/70 bg-red-50/70 p-5 backdrop-blur-xl">
              <p className="text-sm leading-6 text-red-700">
                {error}
              </p>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-black/40">
              Check your backend and frontend environment configuration,
              then reload this page.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#cdedf6] px-5 py-10 text-black md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-white/40 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#58a4b0]/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/45 shadow-[0_30px_100px_-40px_rgba(0,0,0,0.25)] backdrop-blur-2xl backdrop-saturate-150">

          <div className="relative overflow-hidden bg-[#58a4b0]/85 px-7 py-9 text-black backdrop-blur-xl md:px-10 md:py-11">

            <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-white/15 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/50 bg-white/20 text-black shadow-sm backdrop-blur-xl">
                  <CloudIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black/70">AWS account connection</p>
                </div>
              </div>

              <h1 className="mt-8 max-w-2xl text-4xl font-black tracking-[-0.04em] text-black md:text-5xl">Connect your AWS account</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white md:text-base">Deploy faster and safer.</p>
            </div>

          </div>
          <div className="bg-white/25 p-7 backdrop-blur-xl md:p-10">

            <section>
              <div className="mb-5 flex items-center gap-3">
                <StepNumber number="01" />
                <div>
                  <h2 className="mt-0.5 text-xl font-black tracking-tight text-black">GitHub configuration</h2>
                </div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/45 p-5 shadow-sm backdrop-blur-xl md:p-6">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/40 bg-black/90 text-white shadow-sm">
                      <GithubIcon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-black/40">Repository</p>
                      <p className="mt-1 truncate font-mono text-sm font-bold text-black">
                        {selectedRepository
                          ? selectedRepository.full_name
                          : "Not configured"}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 rounded-xl border border-white/70 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-xl">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Branch</p>
                    <p className="mt-1 font-mono text-xs font-semibold text-black/70">{selectedRepository?.default_branch || "main"}</p>
                  </div>
                </div>

              </div>

            </section>
            <div className="my-9 border-t border-black/10" />
            <section>
              <div className="mb-5 flex items-center gap-3">
                <StepNumber number="02" />
                <div>
                  <h2 className="mt-0.5 text-xl font-black tracking-tight text-black">What will be created?</h2>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <CreationItem title="Deployment IAM role" description="Dedicated role for Opsify deployments." />
                <CreationItem title="GitHub OIDC trust" description="Uses the existing GitHub Actions OIDC provider." />
                <CreationItem title="SAM deployment permissions" description="Permissions required for application deployment." />
                <CreationItem title="Connection registration" description="Automatically registers the AWS connection with Opsify." />
              </div>

            </section>
            {(connectionId || stackName) && (
              <>
                <div className="my-9 border-t border-black/10" />
                <section>
                  <div className="mb-5 flex items-center gap-3">
                    <StepNumber number="03" />
                    <div>
                      <h2 className="mt-0.5 text-xl font-black tracking-tight text-black">Connection prepared</h2>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {connectionId && (
                      <div className="rounded-2xl border border-white/70 bg-white/45 p-5 shadow-sm backdrop-blur-xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Connection ID</p>
                        <p className="mt-2 break-all font-mono text-xs font-semibold text-black/70">{connectionId}</p>
                      </div>
                    )}
                    {stackName && (
                      <div className="rounded-2xl border border-white/70 bg-white/45 p-5 shadow-sm backdrop-blur-xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Bootstrap Stack</p>
                        <p className="mt-2 break-all font-mono text-xs font-semibold text-black/70">{stackName}</p>
                      </div>
                    )}
                  </div>

                </section>
              </>
            )}
            <div className="mt-8">

              {launchUrl ? (
                <a
                  href={launchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-6 py-4 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all duration-300 hover:bg-black/85 hover:shadow-xl"
                >
                  <span>Launch AWS CloudFormation</span>
                  <ArrowIcon />
                </a>
              ) : (
                <div className="space-y-3">
                  <div className="flex w-full items-center justify-center rounded-2xl border border-white/60 bg-white/50 px-6 py-4 text-sm font-bold text-black/60 shadow-sm backdrop-blur-xl">
                    AWS account already connected
                  </div>

                  <a
                    href="/deploy/configurations"
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-6 py-4 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all duration-300 hover:bg-black/85 hover:shadow-xl"
                  >
                    <span>Go to deployment configuration</span>
                    <ArrowIcon />
                  </a>
                </div>
              )}
              <div className="mt-4 flex items-start justify-center gap-2 px-4">
                <div className="mt-0.5 text-black/40">
                  <InfoIcon />
                </div>
                <p className="max-w-xl text-center text-xs leading-5 text-black/40">
                  You&apos;ll be redirected to AWS to review and create the
                  CloudFormation stack. Once created, Opsify will automatically
                  register the AWS connection.
                </p>
              </div>

            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-[11px] font-medium text-black/40">
          Opsify securely connects your GitHub deployment workflow to AWS.
        </p>
      </div>
    </main>
  );
}