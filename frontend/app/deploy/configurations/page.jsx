"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ConfigurationsPage() {
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [awsProfile, setAwsProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [error, setError] = useState("");

  const [deploymentMode, setDeploymentMode] = useState(null);

  // Future LLM state
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [manualPlan, setManualPlan] = useState(null);

  // Future auto deployment state
  const [autoDeploying, setAutoDeploying] = useState(false);
  const [autoDeploymentStarted, setAutoDeploymentStarted] =
    useState(false);

  useEffect(() => {
    async function loadConfiguration() {
      try {
        setLoading(true);
        setError("");

        /*
         * ---------------------------------------------------------
         * STEP 1
         * Load repository selected on /deploy
         * ---------------------------------------------------------
         */

        const storedRepository = localStorage.getItem(
          "opsify_selected_repository"
        );

        if (!storedRepository) {
          setError(
            "No GitHub repository has been selected. Go to Deploy and select a repository first."
          );
          setLoading(false);
          setAnalysisLoading(false);
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
          setAnalysisLoading(false);
          return;
        }

        if (!repository?.full_name || !repository?.html_url) {
          setError(
            "The selected GitHub repository information is incomplete. Please select it again."
          );
          setLoading(false);
          setAnalysisLoading(false);
          return;
        }

        setSelectedRepository(repository);

        /*
         * ---------------------------------------------------------
         * STEP 2
         * Get GitHub user ID from the existing NextAuth session
         * ---------------------------------------------------------
         */

        const sessionResponse = await fetch("/api/auth/session", {
          cache: "no-store",
        });

        const sessionData = await sessionResponse.json();

        const githubUserId = sessionData?.user?.githubId;

        if (!githubUserId) {
          setError(
            "Your GitHub session could not be identified. Sign out and sign in again."
          );
          setLoading(false);
          setAnalysisLoading(false);
          return;
        }

        /*
         * ---------------------------------------------------------
         * STEP 3
         * Load latest repository analysis
         * ---------------------------------------------------------
         */

        setAnalysisLoading(true);

        const analysisResponse = await fetch(
          `${API_URL.replace(
            /\/$/,
            ""
          )}/api/repositories/latest?github_user_id=${encodeURIComponent(
            githubUserId
          )}`,
          {
            cache: "no-store",
          }
        );

        if (analysisResponse.status === 404) {
          setAnalysis(null);
        } else {
          const analysisData = await analysisResponse.json();

          if (!analysisResponse.ok) {
            throw new Error(
              analysisData.message ||
              analysisData.error ||
              "Failed to load repository analysis."
            );
          }

          setAnalysis(analysisData);
        }

        /*
         * ---------------------------------------------------------
         * STEP 4
         * Load AWS connection/profile
         * ---------------------------------------------------------
         */

        const profileResponse = await fetch(
          `${API_URL.replace(
            /\/$/,
            ""
          )}/api/users/${githubUserId}`,
          {
            cache: "no-store",
          }
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();

          if (profileData?.profile) {
            setAwsProfile(profileData.profile);
          }
        }
      } catch (err) {
        console.error(
          "Failed to load deployment configuration:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load deployment configuration."
        );
      } finally {
        setLoading(false);
        setAnalysisLoading(false);
      }
    }

    loadConfiguration();
  }, []);

  /*
   * -------------------------------------------------------------
   * REPOSITORY ANALYSIS DATA
   * -------------------------------------------------------------
   */

  const profile = analysis?.profile || null;

  const context = analysis?.context || null;

  const repositoryFromAnalysis =
    profile?.repository || null;

  const detectedFramework =
    profile?.framework ||
    profile?.stack?.framework ||
    profile?.technology ||
    null;

  const detectedRuntime =
    profile?.runtime ||
    profile?.stack?.runtime ||
    profile?.language ||
    null;

  const detectedPackageManager =
    profile?.package_manager ||
    profile?.packageManager ||
    profile?.stack?.package_manager ||
    null;

  const detectedDependencies =
    profile?.dependencies ||
    profile?.stack?.dependencies ||
    [];

  /*
   * -------------------------------------------------------------
   * MANUAL DEPLOYMENT — DUMMY LLM RESPONSE
   *
   * This object represents the structure that the future LLM
   * endpoint should return.
   *
   * Later this will be replaced with:
   *
   * POST /api/deployment/analyze
   *
   * -------------------------------------------------------------
   */

  const generateDummyManualPlan = () => {
    return {
      generatedBy: "Opsify AI",
      status: "preview",

      architecture: [
        {
          name: "Amazon ECS / Fargate",
          category: "Compute",
          purpose:
            "Run the application as a managed container workload.",

          configuration: {
            clusterName: `${selectedRepository?.name || "opsify"}-cluster`,
            serviceName: `${selectedRepository?.name || "opsify"}-service`,
            launchType: "FARGATE",
            cpu: "0.5 vCPU",
            memory: "1 GB",
            desiredTasks: "1",
            containerPort: "3000",
            protocol: "HTTP",
          },
        },

        {
          name: "Application Load Balancer",
          category: "Networking",
          purpose:
            "Expose the application through a public HTTP/HTTPS endpoint.",

          configuration: {
            scheme: "Internet-facing",
            listener: "HTTP : 80",
            targetType: "IP",
            healthCheckPath: "/",
            healthCheckProtocol: "HTTP",
            targetPort: "3000",
          },
        },

        {
          name: "Amazon ECR",
          category: "Container Registry",
          purpose:
            "Store the Docker image used by the ECS task.",

          configuration: {
            repositoryName:
              selectedRepository?.name || "opsify-app",
            imageTag: "latest",
            imageFormat: "Docker",
            scanOnPush: true,
          },
        },
      ],

      environmentVariables: [
        {
          key: "NODE_ENV",
          value: "production",
        },
        {
          key: "PORT",
          value: "3000",
        },
      ],

      guide: [
        {
          step: 1,
          title: "Create an Amazon ECR repository",
          description:
            "Create a private ECR repository where the application's Docker image will be stored.",
          instructions: [
            "Open Amazon ECR in the AWS Console.",
            "Choose Private repositories.",
            `Create a repository named "${selectedRepository?.name || "opsify-app"
            }".`,
            "Enable image scanning on push.",
            "Create the repository.",
          ],
        },

        {
          step: 2,
          title: "Build and push the Docker image",
          description:
            "Build the repository into a Docker image and push it to ECR.",
          instructions: [
            "Make sure the repository contains a valid Dockerfile.",
            "Authenticate Docker with Amazon ECR.",
            "Build the application image.",
            "Tag the image with the ECR repository URI.",
            "Push the image to ECR.",
          ],
        },

        {
          step: 3,
          title: "Create an ECS cluster",
          description:
            "Create the compute environment that will run the application.",
          instructions: [
            "Open Amazon ECS.",
            "Choose Clusters.",
            "Create a new cluster.",
            "Select the AWS Fargate / serverless option.",
            `Name the cluster "${selectedRepository?.name || "opsify"
            }-cluster".`,
            "Create the cluster.",
          ],
        },

        {
          step: 4,
          title: "Create an ECS task definition",
          description:
            "Define the CPU, memory, container image and port used by the application.",
          instructions: [
            "Create a new task definition.",
            "Select Fargate as the launch type.",
            "Set CPU to 0.5 vCPU.",
            "Set memory to 1 GB.",
            `Use the ECR image from the "${selectedRepository?.name || "opsify-app"
            }" repository.`,
            "Expose container port 3000.",
            "Add the required environment variables.",
          ],
        },

        {
          step: 5,
          title: "Create an Application Load Balancer",
          description:
            "Route incoming HTTP traffic to the ECS service.",
          instructions: [
            "Create an internet-facing Application Load Balancer.",
            "Create a target group using IP targets.",
            "Set the target port to 3000.",
            "Configure an HTTP listener on port 80.",
            "Set the health check path to /.",
          ],
        },

        {
          step: 6,
          title: "Create the ECS service",
          description:
            "Run the application task and attach it to the load balancer.",
          instructions: [
            "Create an ECS service inside the cluster.",
            "Select the generated task definition.",
            "Use Fargate.",
            "Set desired tasks to 1.",
            "Attach the Application Load Balancer.",
            "Select the appropriate target group.",
            "Create the service.",
          ],
        },

        {
          step: 7,
          title: "Verify the deployment",
          description:
            "Confirm that the ECS task is running and the application is reachable.",
          instructions: [
            "Wait for the ECS task to reach RUNNING state.",
            "Check the target group health.",
            "Open the Application Load Balancer DNS name.",
            "Verify that the application responds correctly.",
          ],
        },
      ],
    };
  };

  function handleGenerateManualPlan() {
    if (!profile || generatingPlan) {
      return;
    }

    setGeneratingPlan(true);
    setManualPlan(null);

    /*
     * Dummy LLM call.
     *
     * Future:
     *
     * const response = await fetch(
     *   `${API_URL}/api/deployment/analyze`,
     *   {
     *     method: "POST",
     *     headers: {
     *       "Content-Type": "application/json",
     *     },
     *     body: JSON.stringify({
     *       repository: selectedRepository,
     *       analysis,
     *     }),
     *   }
     * );
     *
     * const data = await response.json();
     */

    setTimeout(() => {
      setManualPlan(generateDummyManualPlan());
      setGeneratingPlan(false);
    }, 1800);
  }

  function handleAutoDeploy() {
    if (!profile || autoDeploying) {
      return;
    }

    setAutoDeploying(true);

    /*
     * Future architecture:
     *
     * POST /api/deployment/auto
     *
     * {
     *   repository,
     *   analysis,
     *   awsProfile
     * }
     *
     * Backend:
     *   ↓
     * Generate infrastructure
     *   ↓
     * Create deployment record
     *   ↓
     * Trigger GitHub Actions
     *   ↓
     * Deploy to AWS
     */

    setTimeout(() => {
      setAutoDeploying(false);
      setAutoDeploymentStarted(true);
    }, 1500);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] text-zinc-950">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-black" />

            <p className="mt-4 text-sm font-semibold text-zinc-600">
              Loading deployment configuration...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !selectedRepository) {
    return (
      <main className="min-h-screen bg-[#fafafa] text-zinc-950">
        <div className="mx-auto max-w-3xl px-5 py-16 md:px-8">
          <Card className="rounded-3xl border-red-200 bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <ErrorIcon />
            </div>

            <h1 className="mt-6 text-2xl font-black tracking-tight">
              Deployment configuration unavailable
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              {error}
            </p>

            <a
              href="/deploy"
              className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              Select a repository
            </a>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-zinc-950">
      {/* Subtle background treatment */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-zinc-200/30 blur-3xl" />
        <div className="absolute right-[-10rem] top-[30%] h-96 w-96 rounded-full bg-zinc-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-6 md:py-12 lg:px-8">

        {/* =====================================================
          TOP NAV / BREADCRUMB
      ===================================================== */}

        <div className="mb-8 flex items-center justify-between">
          <a
            href="/deploy"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-black"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>

            Back to repositories
          </a>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-medium text-zinc-400 sm:block">
              Deployment
            </span>

            <span className="h-1 w-1 rounded-full bg-zinc-300" />

            <span className="text-xs font-bold text-zinc-700">
              Configuration
            </span>
          </div>
        </div>

        {/* =====================================================
          HERO
      ===================================================== */}

        <header className="mb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-2 shadow-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950 text-white">
              <SparkleIcon />
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
              Opsify Deployment
            </span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-4xl font-black tracking-[-0.045em] text-zinc-950 sm:text-5xl md:text-6xl">
              Deploy your
              <span className="text-zinc-400"> application.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
              Configure how{" "}
              <span className="font-semibold text-zinc-800">
                {selectedRepository?.name}
              </span>{" "}
              will be deployed to AWS. Opsify can automate the deployment
              or generate a complete manual deployment plan.
            </p>
          </div>
        </header>

        {/* =====================================================
          PROGRESS
      ===================================================== */}

        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ProgressDot
                active={Boolean(selectedRepository)}
                number="1"
              />

              <div className="hidden sm:block">
                <p className="text-xs font-bold text-zinc-900">
                  Repository
                </p>
                <p className="text-[11px] text-zinc-400">
                  Selected
                </p>
              </div>
            </div>

            <ProgressLine
              active={Boolean(selectedRepository)}
            />

            <div className="flex items-center gap-3">
              <ProgressDot
                active={Boolean(profile)}
                number="2"
              />

              <div className="hidden sm:block">
                <p className="text-xs font-bold text-zinc-900">
                  Analysis
                </p>
                <p className="text-[11px] text-zinc-400">
                  {profile ? "Complete" : "Pending"}
                </p>
              </div>
            </div>

            <ProgressLine
              active={Boolean(deploymentMode)}
            />

            <div className="flex items-center gap-3">
              <ProgressDot
                active={Boolean(deploymentMode)}
                number="3"
              />

              <div className="hidden sm:block">
                <p className="text-xs font-bold text-zinc-900">
                  Configuration
                </p>
                <p className="text-[11px] text-zinc-400">
                  {deploymentMode
                    ? deploymentMode === "auto"
                      ? "Auto"
                      : "Manual"
                    : "Choose mode"}
                </p>
              </div>
            </div>

            <ProgressLine
              active={
                deploymentMode === "auto"
                  ? autoDeploymentStarted
                  : Boolean(manualPlan)
              }
            />

            <div className="flex items-center gap-3">
              <ProgressDot
                active={
                  deploymentMode === "auto"
                    ? autoDeploymentStarted
                    : Boolean(manualPlan)
                }
                number="4"
              />

              <div className="hidden sm:block">
                <p className="text-xs font-bold text-zinc-900">
                  Deployment
                </p>
                <p className="text-[11px] text-zinc-400">
                  {deploymentMode === "auto" &&
                    autoDeploymentStarted
                    ? "Ready"
                    : deploymentMode === "manual" &&
                      manualPlan
                      ? "Plan ready"
                      : "Pending"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* ===================================================
            LEFT COLUMN
        =================================================== */}

          <div className="space-y-6">

            {/* =================================================
              REPOSITORY
          ================================================= */}

            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-100 px-6 py-6 sm:px-7">
                <div className="flex items-start gap-4">
                  <StepNumber number="01" />

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Repository
                    </p>

                    <h2 className="mt-1 text-xl font-black tracking-tight">
                      Selected GitHub repository
                    </h2>

                    <p className="mt-1.5 text-sm text-zinc-500">
                      The repository that will be used for deployment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 transition hover:border-zinc-300">

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                          <GithubIcon />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-mono text-sm font-bold text-zinc-950 sm:text-base">
                              {selectedRepository?.full_name}
                            </p>

                            <span className="hidden rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 sm:inline-flex">
                              GitHub
                            </span>
                          </div>

                          {selectedRepository?.description ? (
                            <p className="mt-1 truncate text-xs text-zinc-500">
                              {selectedRepository.description}
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-zinc-400">
                              Ready for deployment
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge
                          label={
                            selectedRepository?.private
                              ? "Private"
                              : "Public"
                          }
                        />

                        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 font-mono text-[11px] font-semibold text-zinc-500">
                          {selectedRepository?.default_branch ||
                            "main"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2 border-t border-zinc-200 pt-4">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>

                      <span className="text-xs font-semibold text-zinc-500">
                        Repository connected and ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
              DEPLOYMENT MODE
          ================================================= */}

            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-100 px-6 py-6 sm:px-7">
                <div className="flex items-start gap-4">
                  <StepNumber number="02" />

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Deployment strategy
                    </p>

                    <h2 className="mt-1 text-xl font-black tracking-tight">
                      Choose how to deploy
                    </h2>

                    <p className="mt-1.5 max-w-xl text-sm leading-6 text-zinc-500">
                      Select the amount of control you want over the
                      AWS deployment process.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="grid gap-4 md:grid-cols-2">

                  <DeploymentModeCard
                    selected={deploymentMode === "auto"}
                    onClick={() => {
                      setDeploymentMode("auto");
                      setManualPlan(null);
                    }}
                    icon={<AutoIcon />}
                    eyebrow="Recommended"
                    title="Auto Deployment"
                    description="Let Opsify determine the infrastructure and handle the deployment workflow for you."
                    features={[
                      "Automatic infrastructure configuration",
                      "Automated deployment pipeline",
                      "Minimal manual AWS work",
                    ]}
                  />

                  <DeploymentModeCard
                    selected={deploymentMode === "manual"}
                    onClick={() => {
                      setDeploymentMode("manual");
                      setAutoDeploymentStarted(false);
                    }}
                    icon={<ManualIcon />}
                    eyebrow="Full control"
                    title="Manual Deployment"
                    description="Get a detailed AWS architecture and step-by-step deployment instructions."
                    features={[
                      "AI-generated AWS architecture",
                      "Detailed configuration values",
                      "Step-by-step deployment guide",
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* =================================================
              AUTO DEPLOYMENT
          ================================================= */}

            {deploymentMode === "auto" && (
              <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">

                <div className="relative overflow-hidden bg-zinc-950 px-6 py-7 text-white sm:px-7">
                  <div className="absolute right-[-4rem] top-[-5rem] h-40 w-40 rounded-full bg-white/[0.04] blur-2xl" />

                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                      <AutoIcon />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                        Auto deployment
                      </p>

                      <h2 className="mt-1 text-xl font-black tracking-tight">
                        Let Opsify handle the deployment
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                        Your repository analysis will be used to
                        determine the infrastructure and prepare the
                        deployment workflow.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-7">

                  {!autoDeploymentStarted ? (
                    <>
                      <div className="space-y-3">
                        <AutoStep
                          number="01"
                          title="Analyze repository"
                          description="Use the completed repository analysis."
                          completed={Boolean(profile)}
                        />

                        <AutoStep
                          number="02"
                          title="Configure AWS"
                          description="Generate the infrastructure required for the application."
                          completed={false}
                        />

                        <AutoStep
                          number="03"
                          title="Deploy application"
                          description="Trigger the automated deployment pipeline."
                          completed={false}
                        />
                      </div>

                      <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-sm">
                            <SparkleIcon />
                          </div>

                          <div>
                            <p className="text-sm font-bold">
                              Automated deployment
                            </p>

                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                              Opsify will eventually generate the
                              infrastructure and trigger the deployment
                              pipeline automatically.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Button
                          onClick={handleAutoDeploy}
                          disabled={!profile || autoDeploying}
                          className="h-12 w-full rounded-xl bg-black px-6 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-zinc-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                        >
                          {autoDeploying ? (
                            <>
                              <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
                              Preparing deployment...
                            </>
                          ) : (
                            <>
                              Start Auto Deployment

                              <span className="ml-3">
                                <ArrowIcon />
                              </span>
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                          <CheckIcon />
                        </div>

                        <div>
                          <p className="text-base font-black text-emerald-950">
                            Deployment pipeline ready
                          </p>

                          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-emerald-700">
                            The auto deployment flow is currently a
                            preview. The actual infrastructure generation
                            and AWS deployment pipeline will be connected
                            in the next phase.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* =================================================
              MANUAL DEPLOYMENT
          ================================================= */}

            {deploymentMode === "manual" && (
              <>
                <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">

                  <div className="border-b border-zinc-100 px-6 py-6 sm:px-7">
                    <div className="flex items-start gap-4">
                      <StepNumber number="03" />

                      <div>
                        <h2 className="mt-1 text-xl font-black tracking-tight">
                          Generate AWS deployment plan
                        </h2>

                        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-zinc-500">
                          Opsify will use the repository analysis to
                          determine the AWS services and configuration
                          required for your application.
                        </p>
                      </div>
                    </div>
                  </div>

                  {!manualPlan && (
                    <div className="p-6 sm:p-7">
                      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
                        <div className="absolute right-[-3rem] top-[-3rem] h-32 w-32 rounded-full bg-zinc-200/50 blur-2xl" />

                        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-start gap-4">

                            <div>
                              <p className="text-sm font-black text-zinc-950">
                                AI-powered infrastructure analysis
                              </p>

                              <p className="mt-1.5 max-w-xl text-xs leading-5 text-zinc-500">
                                Generate a deployment plan based on the
                                repository structure, framework, runtime,
                                dependencies and application requirements.
                              </p>

                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-zinc-500">
                                  Architecture
                                </span>

                                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-zinc-500">
                                  Configuration
                                </span>

                                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-zinc-500">
                                  Deployment guide
                                </span>
                              </div>
                            </div>
                          </div>

                          <Button
                            onClick={handleGenerateManualPlan}
                            disabled={!profile || generatingPlan}
                            className="h-12 w-full shrink-0 rounded-xl bg-black px-6 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
                          >
                            {generatingPlan ? (
                              <>
                                <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
                                AI is analyzing...
                              </>
                            ) : (
                              <>
                                Generate AWS Configuration

                                <span className="ml-3">
                                  <ArrowIcon />
                                </span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {manualPlan && (
                  <ManualDeploymentPlan
                    plan={manualPlan}
                    repository={selectedRepository}
                  />
                )}
              </>
            )}

            {/* =================================================
              EMPTY STATE
          ================================================= */}

            {!deploymentMode && (
              <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm sm:p-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                  <ArrowDownIcon />
                </div>

                <h3 className="mt-5 text-lg font-black tracking-tight">
                  Choose a deployment strategy
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                  Select Auto Deployment to let Opsify handle the
                  workflow, or Manual Deployment to receive a detailed
                  AWS deployment plan.
                </p>

                <div className="mx-auto mt-5 flex max-w-sm items-center justify-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                </div>
              </div>
            )}
          </div>

          {/* ===================================================
            RIGHT SUMMARY
        =================================================== */}

          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">

              {/* Summary header */}

              <div className="relative overflow-hidden bg-zinc-950 p-6 text-white">
                <div className="absolute right-[-4rem] top-[-4rem] h-32 w-32 rounded-full bg-white/[0.05] blur-2xl" />

                <div className="relative flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                    <SparkleIcon />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                    Opsify
                  </span>
                </div>

                <p className="relative mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Deployment overview
                </p>

                <h2 className="relative mt-2 text-xl font-black tracking-tight">
                  Your deployment
                </h2>

                <p className="relative mt-2 text-xs leading-5 text-zinc-400">
                  Review the current deployment configuration.
                </p>
              </div>

              {/* Repository summary */}

              <div className="p-6">

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-sm">
                      <GithubIcon />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                        Repository
                      </p>

                      <p className="mt-1 truncate font-mono text-xs font-bold text-zinc-950">
                        {selectedRepository?.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-1">
                  <SummaryRow
                    label="Branch"
                    value={
                      selectedRepository?.default_branch ||
                      "main"
                    }
                  />

                  <SummaryRow
                    label="Provider"
                    value="AWS"
                  />

                  <SummaryRow
                    label="AWS status"
                    value={
                      awsProfile?.status === "connected"
                        ? "Connected"
                        : "Connected"
                    }
                  />

                  {awsProfile?.region && (
                    <SummaryRow
                      label="Region"
                      value={awsProfile.region}
                    />
                  )}
                </div>

                <div className="my-6 h-px bg-zinc-100" />

                {/* Mode */}

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                  Deployment strategy
                </p>

                <div className="mt-3">
                  {!deploymentMode ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
                      <p className="text-xs font-semibold text-zinc-500">
                        Waiting for selection
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                        {deploymentMode === "auto" ? (
                          <AutoIcon />
                        ) : (
                          <ManualIcon />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black text-zinc-950">
                          {deploymentMode === "auto"
                            ? "Auto Deployment"
                            : "Manual Deployment"}
                        </p>

                        <p className="mt-0.5 text-[10px] text-zinc-500">
                          {deploymentMode === "auto"
                            ? "Opsify handles the workflow"
                            : "AI-generated AWS plan"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="my-6 h-px bg-zinc-100" />

                {/* Pipeline */}

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                  Deployment pipeline
                </p>

                <div className="mt-5">
                  <PipelineStep
                    number="01"
                    title="Repository"
                    description="GitHub repository selected"
                    completed={Boolean(selectedRepository)}
                  />

                  <PipelineStep
                    number="02"
                    title="Analysis"
                    description={
                      profile
                        ? "Repository analysis complete"
                        : "Waiting for analysis"
                    }
                    completed={Boolean(profile)}
                  />

                  <PipelineStep
                    number="03"
                    title="Configuration"
                    description={
                      deploymentMode
                        ? deploymentMode === "auto"
                          ? "Auto deployment selected"
                          : "Manual deployment selected"
                        : "Waiting for selection"
                    }
                    completed={Boolean(deploymentMode)}
                  />

                  <PipelineStep
                    number="04"
                    title="Deployment"
                    description={
                      deploymentMode === "auto"
                        ? autoDeploymentStarted
                          ? "Pipeline ready"
                          : "Waiting to start"
                        : deploymentMode === "manual"
                          ? manualPlan
                            ? "Plan generated"
                            : "Waiting for AI plan"
                          : "Waiting"
                    }
                    completed={
                      deploymentMode === "auto"
                        ? autoDeploymentStarted
                        : Boolean(manualPlan)
                    }
                    last
                  />
                </div>

                {/* AWS status */}

                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                      <CheckIcon />
                    </div>

                    <div>
                      <p className="text-xs font-black text-emerald-950">
                        AWS connected
                      </p>

                      <p className="mt-0.5 text-[10px] text-emerald-700">
                        Deployment account is ready
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* =============================================================
   MANUAL DEPLOYMENT PLAN
============================================================= */

function ManualDeploymentPlan({
  plan,
  repository,
}) {
  return (
    <Card className="rounded-3xl border-zinc-200 bg-white p-7 shadow-sm md:p-8">

      <div className="flex flex-col gap-5 border-b border-zinc-200 pb-7 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
            <SparkleIcon />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
              AI-generated deployment plan
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight">
              AWS infrastructure configuration
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Generated for{" "}
              <span className="font-semibold text-zinc-700">
                {repository?.full_name}
              </span>
              .
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
          AI Preview
        </span>
      </div>

      {/* =======================================================
          ARCHITECTURE
      ======================================================= */}

      <div className="pt-7">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
            Recommended architecture
          </p>

          <h3 className="mt-1 text-xl font-black">
            AWS services
          </h3>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            These services represent the infrastructure the AI
            recommends for the analyzed repository.
          </p>
        </div>

        <div className="space-y-4">
          {plan.architecture.map((service, index) => (
            <div
              key={service.name}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
            >
              <div className="flex flex-col gap-5 md:flex-row md:justify-between">

                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-xs font-black text-white">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-black">
                        {service.name}
                      </h4>

                      <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                        {service.category}
                      </span>
                    </div>

                    <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-500">
                      {service.purpose}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-zinc-200 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                  Configuration
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {Object.entries(
                    service.configuration
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-zinc-200 bg-white p-3"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {formatLabel(key)}
                      </p>

                      <p className="mt-1 break-all font-mono text-xs font-semibold text-zinc-900">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =======================================================
          ENVIRONMENT VARIABLES
      ======================================================= */}

      {plan.environmentVariables?.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
            Environment variables
          </p>

          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
            <div className="grid grid-cols-[1fr_1fr] border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Variable
              </span>

              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Value
              </span>
            </div>

            {plan.environmentVariables.map(
              (variable) => (
                <div
                  key={variable.key}
                  className="grid grid-cols-[1fr_1fr] border-b border-zinc-100 px-4 py-3 last:border-0"
                >
                  <span className="font-mono text-xs font-semibold text-zinc-700">
                    {variable.key}
                  </span>

                  <span className="font-mono text-xs text-zinc-500">
                    {variable.value}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* =======================================================
          GUIDE
      ======================================================= */}

      <div className="mt-8">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
            AWS setup guide
          </p>

          <h3 className="mt-1 text-xl font-black">
            Deploy manually on AWS
          </h3>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Follow these steps to recreate the recommended
            infrastructure in your AWS account.
          </p>
        </div>

        <div className="space-y-4">
          {plan.guide.map((step) => (
            <GuideStep
              key={step.step}
              step={step}
            />
          ))}
        </div>
      </div>

      {/* =======================================================
          FUTURE ACTIONS
      ======================================================= */}

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-950 p-6 text-white">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black">
              Manual deployment plan ready
            </p>

            <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-400">
              In the future, this configuration will be generated
              dynamically by the Opsify LLM and can be exported as
              Terraform, CloudFormation or AWS CLI commands.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/15"
              onClick={() => {
                navigator.clipboard?.writeText(
                  JSON.stringify(plan, null, 2)
                );
              }}
            >
              Copy JSON
            </button>

            <button
              type="button"
              className="rounded-xl bg-white px-4 py-3 text-xs font-bold text-black transition hover:bg-zinc-200"
              onClick={() => {
                window.print();
              }}
            >
              Print Guide
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* =============================================================
   DEPLOYMENT MODE CARD
============================================================= */

function DeploymentModeCard({
  selected,
  onClick,
  icon,
  eyebrow,
  title,
  description,
  features,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-2xl border p-6 text-left transition-all duration-200 ${selected
          ? "border-zinc-950 bg-zinc-950 text-white shadow-xl shadow-black/10"
          : "border-zinc-200 bg-zinc-50 text-zinc-950 hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white hover:shadow-lg hover:shadow-black/[0.04]"
        }`}
    >
      {/* Selected indicator */}

      <div
        className={`absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full transition ${selected
            ? "bg-white text-black"
            : "border border-zinc-200 bg-white text-transparent"
          }`}
      >
        <CheckIcon />
      </div>

      {/* Icon */}

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${selected
            ? "bg-white/10 text-white"
            : "bg-white text-zinc-700 shadow-sm"
          }`}
      >
        {icon}
      </div>

      {/* Text */}

      <p
        className={`mt-6 text-[9px] font-bold uppercase tracking-[0.18em] ${selected
            ? "text-zinc-500"
            : "text-zinc-400"
          }`}
      >
        {eyebrow}
      </p>

      <h3 className="mt-1 text-xl font-black tracking-tight">
        {title}
      </h3>

      <p
        className={`mt-3 text-sm leading-6 ${selected
            ? "text-zinc-400"
            : "text-zinc-500"
          }`}
      >
        {description}
      </p>

      {/* Features */}

      <div className="mt-6 space-y-2.5">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-2.5"
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${selected
                  ? "bg-white/10 text-white"
                  : "bg-white text-zinc-600 shadow-sm"
                }`}
            >
              <CheckIcon />
            </div>

            <span
              className={`text-xs font-semibold ${selected
                  ? "text-zinc-300"
                  : "text-zinc-600"
                }`}
            >
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom action hint */}

      <div
        className={`mt-6 flex items-center gap-2 border-t pt-4 ${selected
            ? "border-white/10 text-zinc-400"
            : "border-zinc-200 text-zinc-400"
          }`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {selected ? "Selected" : "Select this option"}
        </span>

        <ArrowIcon />
      </div>
    </button>
  );
}

/* =============================================================
   AUTO STEP
============================================================= */

function AutoStep({
  number,
  title,
  description,
  completed,
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${completed
          ? "bg-zinc-950 text-white"
          : "bg-zinc-100 text-zinc-400"
          }`}
      >
        {completed ? <CheckIcon /> : number}
      </div>

      <div>
        <p className="text-sm font-bold">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =============================================================
   GUIDE STEP
============================================================= */

function GuideStep({ step }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-xs font-black text-white">
          {String(step.step).padStart(2, "0")}
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-black">
            {step.title}
          </h4>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {step.description}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2 border-t border-zinc-200 pt-5">
        {step.instructions.map(
          (instruction, index) => (
            <div
              key={`${step.step}-${index}`}
              className="flex items-start gap-3"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white text-[9px] font-black text-zinc-500 shadow-sm">
                {index + 1}
              </span>

              <p className="text-xs leading-5 text-zinc-600">
                {instruction}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* =============================================================
   STEP NUMBER
============================================================= */

function StepNumber({ number }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-[10px] font-black tracking-wider text-zinc-700 shadow-sm">
      {number}
    </div>
  );
}

/* =============================================================
   STATUS BADGE
============================================================= */

function StatusBadge({ label }) {
  return (
    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600">
      {label}
    </span>
  );
}

/* =============================================================
   DETECTION CARD
============================================================= */

function DetectionCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-bold text-zinc-950">
        {value}
      </p>
    </div>
  );
}

/* =============================================================
   SUMMARY ROW
============================================================= */

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-100 py-3 first:pt-0 last:border-b-0">
      <span className="text-xs font-semibold text-zinc-400">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-right text-xs font-bold text-zinc-900">
        {value}
      </span>
    </div>
  );
}

/* =============================================================
   PIPELINE STEP
============================================================= */

function PipelineStep({
  number,
  title,
  description,
  completed,
  last = false,
}) {
  return (
    <div className="relative flex gap-3">
      {!last && (
        <div className="absolute left-3.5 top-8 h-[calc(100%-8px)] w-px bg-zinc-200" />
      )}

      <div
        className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-black ${completed
          ? "bg-zinc-950 text-white"
          : "bg-zinc-100 text-zinc-400"
          }`}
      >
        {completed ? <CheckIcon /> : number}
      </div>

      <div className="pb-4">
        <p className="text-sm font-bold text-zinc-950">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =============================================================
   HELPERS
============================================================= */

function formatValue(value, fallback) {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value.length
      ? value.join(", ")
      : fallback;
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function formatLabel(value) {
  return String(value)
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim();
}

/* =============================================================
   ICONS
============================================================= */

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

function AutoIcon() {
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
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="m5.64 5.64 2.83 2.83" />
      <path d="m15.53 15.53 2.83 2.83" />
      <path d="m18.36 5.64-2.83 2.83" />
      <path d="m8.47 15.53-2.83 2.83" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

function ManualIcon() {
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
      <path d="M4 19.5V4.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v15" />
      <path d="M4 19.5a2 2 0 0 0 2 2h14" />
      <path d="M8 6h8" />
      <path d="M8 10h8" />
      <path d="M8 14h5" />
    </svg>
  );
}

function StorageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <ellipse
        cx="12"
        cy="5"
        rx="7"
        ry="3"
      />
      <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
      <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
    </svg>
  );
}

function SparkleIcon() {
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
      <path d="m12 3-1.3 5.2a5 5 0 0 1-3.5 3.5L2 13l5.2 1.3a5 5 0 0 1 3.5 3.5L12 23l1.3-5.2a5 5 0 0 1 3.5-3.5L22 13l-5.2-1.3a5 5 0 0 1-3.5-3.5L12 3Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 10 4 4 8-8" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  );
}

function ArrowIcon() {
  return (
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
  );
}

function ArrowDownIcon() {
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
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  );
}

function ProgressDot({ active, number }) {
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black transition ${
        active
          ? "bg-zinc-950 text-white shadow-sm"
          : "border border-zinc-200 bg-zinc-50 text-zinc-400"
      }`}
    >
      {active ? <CheckIcon /> : number}
    </div>
  );
}

function ProgressLine({ active }) {
  return (
    <div
      className={`h-px flex-1 transition ${
        active
          ? "bg-zinc-950"
          : "bg-zinc-200"
      }`}
    />
  );
}