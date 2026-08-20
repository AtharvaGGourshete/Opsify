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

    // Existing CloudFormation parameters
    param_GitHubOwner: githubConfig.owner,
    param_GitHubOwnerId: githubConfig.ownerId,
    param_GitHubRepository: githubConfig.repository,
    param_GitHubRepositoryId: githubConfig.repositoryId,
    param_GitHubBranch: githubConfig.branch,

    // New parameters
    param_GitHubUserId: githubUserId,
    param_OpsifyCallbackUrl: callbackUrl,
  });

  return `https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?${params.toString()}`;
}

export default async function AWSSetupPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 flex items-center justify-center">
        <div className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-xl shadow-slate-200/60 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Authentication Required
          </h1>

          <p className="mt-3 text-slate-500">
            Please sign in with GitHub before connecting AWS.
          </p>
        </div>
      </main>
    );
  }

  const githubUserId = session.user.githubId;

  if (!githubUserId) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 flex items-center justify-center">
        <div className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-xl shadow-slate-200/60 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            GitHub Account ID Missing
          </h1>

          <p className="mt-3 text-slate-500">
            We could not determine your GitHub user ID. Please sign out and
            sign in again with GitHub.
          </p>
        </div>
      </main>
    );
  }

  const launchUrl = getCloudFormationLaunchUrl(githubUserId);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-xl shadow-slate-200/60">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-xl text-white">
            ☁
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900">
            Connect AWS
          </h1>

          <p className="leading-7 text-slate-500">
            Set up Opsify&apos;s AWS deployment role. This creates the IAM role
            that GitHub Actions will use to deploy your application securely
            through GitHub OIDC.
          </p>
        </div>

        {/* GitHub Repository */}
        <div className="mb-7 rounded-xl bg-slate-100 p-5">
          <p className="mb-2 text-sm font-semibold text-slate-900">
            GitHub Repository
          </p>

          <p className="font-mono text-sm text-slate-600">
            {githubConfig.owner}/{githubConfig.repository}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Branch:{" "}
            <span className="font-medium text-slate-700">
              {githubConfig.branch}
            </span>
          </p>
        </div>

        {/* What will be created */}
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            What will be created?
          </h2>

          <ul className="space-y-3 text-sm leading-6 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
              <span>Opsify deployment IAM role</span>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
              <span>GitHub OIDC trust relationship</span>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
              <span>Permissions required for SAM deployment</span>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
              <span>Automatic AWS connection registration</span>
            </li>
          </ul>
        </div>

        {/* Launch button */}
        <a
          href={launchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl bg-slate-900 px-5 py-3.5 text-center font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Launch AWS CloudFormation →
        </a>

        {/* Footer */}
        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          You&apos;ll be redirected to AWS to review and create the stack.
          Once the stack is created, Opsify will automatically register the
          AWS connection.
        </p>
      </div>
    </main>
  );
}