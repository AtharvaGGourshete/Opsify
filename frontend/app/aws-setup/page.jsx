"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

function CloudIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
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

function InfoIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
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

function CreationItem({ title, description }) {
  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-white">
        <CheckIcon />
      </div>

      <div>
        <p className="text-sm font-semibold text-black">{title}</p>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
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
        setError(
          "GitHub user ID is missing from the active session. Sign out and sign in again with GitHub."
        );
        setLoading(false);
        return;
      }

      const storedRepository = localStorage.getItem(
        "opsify_selected_repository"
      );

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

      if (!repository?.owner?.login || !repository?.name) {
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

        const profileResponse = await fetch(
          `${apiUrl.replace(/\/$/, "")}/api/auth/users/${github_user_id}`,
          {
            cache: "no-store",
          }
        );

        const profileData = await profileResponse.json();

        console.log("Existing profile:", profileData);

        if (
          profileResponse.ok &&
          profileData?.profile?.status === "connected"
        ) {
          const profile = profileData.profile;

          setConnectionId(profile.connection_id || "");
          setStackName(profile.bootstrap_stack_name || "");
          setLaunchUrl("");
          setLoading(false);

          return;
        }

        console.log("Creating or reusing AWS connection...");

        const response = await fetch(
          `${apiUrl.replace(/\/$/, "")}/api/aws/connections`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              github_user_id: github_user_id,
              github_owner: repository.owner.login,
              github_repository: repository.name,
              github_branch: repository.default_branch || "main",
            }),
          }
        );

        const data = await response.json();

        console.log("AWS connection response:", data);

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to create AWS connection."
          );
        }

        if (data.status === "connected") {
          setConnectionId(data.connectionId || "");
          setStackName(data.stackName || "");
          setLaunchUrl("");
          setLoading(false);

          return;
        }

        if (data.alreadyConnected) {
          console.log(
            "AWS account is already connected:",
            data.connection
          );

          setConnectionId(data.connectionId || "");
          setStackName(data.stackName || "");
          setLaunchUrl("");

          return;
        }

        if (!data.launchUrl) {
          throw new Error(
            "AWS connection was created, but no CloudFormation launch URL was returned."
          );
        }

        setLaunchUrl(data.launchUrl);
        setConnectionId(data.connectionId || "");
        setStackName(data.stackName || "");
      } catch (err) {
        console.error("AWS connection preparation failed:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to prepare AWS connection."
        );
      } finally {
        setLoading(false);
      }
    }

    prepareAWSConnection();
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white p-6 text-black">
        <div className="flex flex-col items-center gap-5 text-center">

          <div>
            <h1 className="text-xl font-black tracking-tight">
              Preparing Connection
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Checking your GitHub and AWS configuration...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.22)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/10">
            <GithubIcon />
          </div>

          <h1 className="mt-5 text-2xl font-black tracking-tight text-black">
            Authentication Required
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Sign in with GitHub before connecting your AWS account to Opsify.
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-600">
              Use the Sign In option in the navigation bar to continue.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white px-6 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-4 border-b border-zinc-200 bg-zinc-50 p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                <InfoIcon />
              </div>

              <div>
                <h1 className="text-xl font-black text-black">
                  AWS Connection Failed
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                  We couldn't initialize your setup.
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-800">
                  {error}
                </p>
              </div>

              <p className="mt-4 text-sm leading-6 text-zinc-500">
                Please check your backend and frontend environment
                configuration, then reload this page.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#cdedf6] relative min-h-screen overflow-hidden px-4 py-10 text-black sm:px-6 lg:px-8">

      <div className=" relative mx-auto w-full max-w-6xl space-y-8">
        {/* Header */}
        <header>
          <div className="flex items-center gap-4">

            <div>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-black sm:text-4xl">
                AWS Account Connection
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Securely connect your GitHub repository to AWS for automated
                deployments.
              </p>
            </div>
          </div>
        </header>

        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.22)]">
          {/* Step 1 */}
          <section className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center text-md font-black text-black">
                01.
              </div>

              <h2 className="text-lg font-black tracking-tight text-black">
                GitHub Configuration
              </h2>
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-black shadow-sm">
                  <GithubIcon />
                </div>

                <div>
                  <Link href={selectedRepository.full_name}>
                    <p className="mt-1 text-sm font-bold text-black hover:underline">
                      {selectedRepository
                        ? selectedRepository.full_name
                        : "Not configured"}
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-zinc-200" />

          {/* Step 2 */}
          <section className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center text-md font-black text-black">
                02
              </div>

              <h2 className="text-lg font-black tracking-tight text-black">
                Resources to Create
              </h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <CreationItem
                title="Deployment IAM role"
                description="Dedicated role for Opsify deployments."
              />

              <CreationItem
                title="GitHub OIDC trust"
                description="Uses the existing GitHub Actions OIDC provider."
              />

              <CreationItem
                title="SAM deployment permissions"
                description="Permissions required for application deployment."
              />

              <CreationItem
                title="Connection registration"
                description="Automatically registers the AWS connection with Opsify."
              />
            </div>
          </section>

          {/* Step 3 */}
          {(connectionId || stackName) && (
            <>
              <div className="border-t border-zinc-200" />

              <section className="bg-zinc-50/70 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center text-md font-black text-black">
                    03
                  </div>

                  <h2 className="text-lg font-black tracking-tight text-black">
                    Connection Prepared
                  </h2>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {connectionId && (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-bold text-black">
                        Connection ID
                      </p>

                      <p className="mt-2 break-all font-mono text-sm text-black">
                        {connectionId}
                      </p>
                    </div>
                  )}

                  {stackName && (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-bold text-black">
                        Bootstrap Stack
                      </p>

                      <p className="mt-2 break-all font-mono text-sm text-black">
                        {stackName}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          <div className="border-t border-zinc-200" />

          {/* Action */}
          <section className="flex flex-col items-center justify-center bg-zinc-50/70 p-6 sm:p-8">
            {launchUrl ? (
              <div className="w-full max-w-md text-center">
                <a
                  href={launchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-6 py-4 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all duration-300 hover:bg-zinc-800 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >

                  <span>Launch AWS CloudFormation</span>

                  <ArrowIcon />
                </a>

                <p className="mt-4 flex justify-center gap-2 text-xs text-black bg-yellow-50/70 p-3 rounded-lg border border-yellow-200  ">
                  <InfoIcon className="h-4 w-4" />

                  You'll be redirected to AWS to securely review and create
                  the stack. Close the console once the stack is created to return here and continue the setup.
                </p>
              </div>
            ) : (
              <div className="w-full max-w-md space-y-4 text-center">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-bold text-black shadow-sm">
                  AWS account is successfully connected.
                </div>

                <a
                  href="/deploy/configurations"
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-6 py-4 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all duration-300 hover:bg-zinc-800 hover:shadow-xl"
                >
                  <span>Go to Deployment Configuration</span>

                  <ArrowIcon />
                </a>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}