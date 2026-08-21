import { auth } from "@/auth";

const githubConfig = {
  owner: process.env.NEXT_PUBLIC_GITHUB_OWNER,
  ownerId: process.env.NEXT_PUBLIC_GITHUB_OWNER_ID,
  repository: process.env.NEXT_PUBLIC_GITHUB_REPOSITORY,
  repositoryId: process.env.NEXT_PUBLIC_GITHUB_REPOSITORY_ID,
  branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH,
};

function getCloudFormationLaunchUrl(githubUserId) {
  const templateURL = process.env.NEXT_PUBLIC_BOOTSTRAP_URL;
  const callbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/aws-details`;

  if (!templateURL) {
    throw new Error("NEXT_PUBLIC_BOOTSTRAP_URL is not configured");
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  if (!githubUserId) {
    throw new Error("GitHub user ID is not available");
  }

  const params = new URLSearchParams({
    templateURL,
    stackName: "OpsifyBootstrapTestDemo",

    param_GitHubOwner: githubConfig.owner,
    param_GitHubOwnerId: githubConfig.ownerId,
    param_GitHubRepository: githubConfig.repository,
    param_GitHubRepositoryId: githubConfig.repositoryId,
    param_GitHubBranch: githubConfig.branch,

    param_GitHubUserId: githubUserId,
    param_OpsifyCallbackUrl: callbackUrl,
  });

  return `https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?${params.toString()}`;
}

export default async function AWSSetupPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fafafa] px-6 py-12 text-black">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-zinc-200/40 blur-3xl" />
        </div>

        <div className="relative w-full max-w-lg rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-[0_25px_80px_-35px_rgba(0,0,0,0.2)] md:p-10">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-lg">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9H17.5a4.5 4.5 0 1 1 0 9Z" />
            </svg>
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
            Opsify
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">
            Authentication required
          </h1>

          <p className="mt-4 text-base leading-7 text-zinc-500">
            Sign in with GitHub before connecting your AWS account to Opsify.
          </p>

        </div>
      </main>
    );
  }

  const githubUserId = session.user.githubId;

  if (!githubUserId) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fafafa] px-6 py-12 text-black">

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-zinc-200/40 blur-3xl" />
        </div>

        <div className="relative w-full max-w-lg rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-[0_25px_80px_-35px_rgba(0,0,0,0.2)] md:p-10">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3 2.8 20h18.4L12 3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
            Opsify / AWS
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">
            GitHub account ID missing
          </h1>

          <p className="mt-4 text-base leading-7 text-zinc-500">
            We could not determine your GitHub user ID. Sign out and sign in
            again with GitHub to continue.
          </p>

        </div>
      </main>
    );
  }

  const launchUrl = getCloudFormationLaunchUrl(githubUserId);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fafafa] px-5 py-10 text-black md:px-8 md:py-7">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-zinc-200/50 blur-3xl" />

        <div className="absolute bottom-[-250px] right-[-150px] h-[500px] w-[500px] rounded-full bg-zinc-100 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">


        {/* =================================================
            MAIN CARD
        ================================================= */}

        <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_30px_100px_-40px_rgba(0,0,0,0.25)]">

          {/* =================================================
              HERO
          ================================================= */}

          <div className="relative overflow-hidden bg-zinc-950 px-7 py-9 text-white md:px-10 md:py-11">

            <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-white/[0.05] blur-3xl" />

            <div className="relative">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">

                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9H17.5a4.5 4.5 0 1 1 0 9Z" />
                  </svg>

                </div>

                <div>

                  <p className="mt-0.5 text-sm font-semibold text-zinc-300">
                    AWS account connection
                  </p>

                </div>

              </div>

              <h1 className="mt-8 max-w-2xl text-4xl font-black tracking-[-0.04em] md:text-5xl">
                Connect your AWS account
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                Deploy faster and safer. 
              </p>

            </div>

          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="p-7 md:p-10">

            {/* Repository */}
            <section>

              <div className="mb-5 flex items-center gap-3">

                <StepNumber number="01" />

                <div>

                  <h2 className="mt-0.5 text-xl font-black tracking-tight text-zinc-950">
                    GitHub configuration
                  </h2>
                </div>

              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 md:p-6">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                      <GithubIcon />
                    </div>

                    <div className="min-w-0">

                      <p className="text-zinc-400">
                        Repository
                      </p>

                      <p className="mt-1 truncate font-mono text-sm font-bold text-zinc-900">
                        {githubConfig.owner}/{githubConfig.repository}
                      </p>

                    </div>

                  </div>

                  <div className="shrink-0 rounded-xl border border-zinc-200 bg-white px-4 py-3">

                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Branch
                    </p>

                    <p className="mt-1 font-mono text-xs font-semibold text-zinc-800">
                      {githubConfig.branch}
                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* Divider */}
            <div className="my-9 border-t border-zinc-200" />

            {/* What will be created */}
            <section>

              <div className="mb-5 flex items-center gap-3">

                <StepNumber number="02" />

                <div>

                  <h2 className="mt-0.5 text-xl font-black tracking-tight text-zinc-950">
                    What will be created?
                  </h2>

                </div>

              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                <CreationItem
                  title="Deployment IAM role"
                  description="Dedicated role for Opsify deployments."
                />

                <CreationItem
                  title="GitHub OIDC trust"
                  description="Secure identity federation with GitHub."
                />

                <CreationItem
                  title="SAM deployment permissions"
                  description="Permissions required for application deployment."
                />

                <CreationItem
                  title="Connection registration"
                  description="Automatically registers the AWS connection."
                />

              </div>

            </section>

            {/* CTA */}
            <div className="mt-8">

              <a
                href={launchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-6 py-4 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-zinc-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >

                <span>
                  Launch AWS CloudFormation
                </span>

                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m13 5 7 7-7 7" />
                </svg>

              </a>

              <div className="mt-4 flex items-start justify-center gap-2 px-4">

                <svg
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>

                <p className="max-w-xl text-center text-xs leading-5 text-zinc-400">
                  You&apos;ll be redirected to AWS to review and create the
                  CloudFormation stack. Once created, Opsify will automatically
                  register the AWS connection.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Bottom note */}
        <p className="mt-6 text-center text-[11px] font-medium text-zinc-400">
          Opsify securely connects your GitHub deployment workflow to AWS.
        </p>

      </div>

    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function StepNumber({ number }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black text-[10px] font-black text-white">
      {number}
    </div>
  );
}

function SecurityBadge({ text }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold text-zinc-300">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      {text}
    </div>
  );
}

function CreationItem({ title, description }) {
  return (
    <div className="group rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition hover:border-zinc-300 hover:bg-white hover:shadow-sm">

      <div className="flex gap-4">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-black shadow-sm ring-1 ring-zinc-200">

          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>

        </div>

        <div>

          <p className="text-sm font-bold text-zinc-950">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.25c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6-.01c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
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
  );
}