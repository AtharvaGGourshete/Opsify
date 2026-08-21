"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const services = [
  {
    id: "compute",
    title: "Compute",
    description: "Run your application workloads",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 8h8v8H8z" />
        <path d="M8 2v2M16 2v2M8 20v2M16 20v2M20 8h2M20 16h2M2 8h2M2 16h2" />
      </svg>
    ),
  },
  {
    id: "storage",
    title: "Storage",
    description: "Store application assets and files",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <ellipse cx="12" cy="5" rx="7" ry="3" />
        <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
        <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
      </svg>
    ),
  },
  {
    id: "database",
    title: "Database",
    description: "Persist your application data",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <ellipse cx="12" cy="5" rx="7" ry="3" />
        <path d="M5 5v14c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
        <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
      </svg>
    ),
  },
  {
    id: "network",
    title: "Networking",
    description: "Connect and secure your services",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="5" cy="12" r="2.5" />
        <circle cx="19" cy="6" r="2.5" />
        <circle cx="19" cy="18" r="2.5" />
        <path d="m7.2 11 9.5-4M7.2 13l9.5 4" />
      </svg>
    ),
  },
];

export default function ConfigurationsPage() {
  const [githubUrl, setGithubUrl] = useState("");
  const [provider, setProvider] = useState("AWS");
  const [selectedServices, setSelectedServices] = useState([
    "compute",
    "storage",
    "database",
  ]);
  const [analyzing, setAnalyzing] = useState(false);

  const toggleService = (id) => {
    setSelectedServices((current) =>
      current.includes(id)
        ? current.filter((service) => service !== id)
        : [...current, id]
    );
  };

  const analyzeRepository = () => {
    if (!githubUrl) return;

    setAnalyzing(true);

    setTimeout(() => {
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-950">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="mb-10">
            <h1 className="text-2xl">Dummy page hai ye</h1>
          <h1 className="max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-5xl md:text-6xl">
            Deploy your application
            <span className="text-zinc-400"> without the complexity.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-500 md:text-lg">
            Choose your cloud provider,
            and let Opsify configure the infrastructure for you.
          </p>

        </header>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid gap-6 lg:grid-cols-[1.55fr_0.75fr]">

          {/* =================================================
              LEFT CONFIGURATION
          ================================================= */}

          <div className="space-y-6">

            {/* Repository */}
            <Card className="rounded-3xl border-zinc-200 bg-white p-7 shadow-sm md:p-8">

              <div className="flex items-start gap-4">

                <StepNumber number="01" />

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Repository
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight">
                    Connect GitHub
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Enter the repository you want Opsify to analyze and deploy.
                  </p>
                </div>

              </div>

              <div className="mt-7">

                <label className="mb-2 block text-sm font-semibold text-zinc-900">
                  GitHub repository URL
                </label>

                <div className="relative">

                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                    <GithubIcon />
                  </div>

                  <Input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="h-12 rounded-xl border-zinc-200 bg-zinc-50 pl-11 text-sm font-medium text-black placeholder:text-zinc-400 focus-visible:ring-black"
                  />

                </div>

              </div>

            </Card>

            {/* Cloud Provider */}
            <Card className="rounded-3xl border-zinc-200 bg-white p-7 shadow-sm md:p-8">

              <div className="flex items-start gap-4">

                <StepNumber number="02" />

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Cloud
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight">
                    Choose your provider
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Opsify will map your selected services to the appropriate
                    cloud resources.
                  </p>
                </div>

              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">

                <ProviderCard
                  name="AWS"
                  description="Amazon Web Services"
                  selected={provider === "AWS"}
                  onClick={() => setProvider("AWS")}
                  icon={<AwsIcon />}
                />

                <ProviderCard
                  name="GCP"
                  description="Google Cloud Platform"
                  selected={provider === "GCP"}
                  onClick={() => setProvider("GCP")}
                  icon={<GcpIcon />}
                />

              </div>

            </Card>

            {/* Services */}
            <Card className="rounded-3xl border-zinc-200 bg-white p-7 shadow-sm md:p-8">

              <div className="flex items-start gap-4">

                <StepNumber number="03" />

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Infrastructure
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight">
                    Configure services
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Select the infrastructure your application needs.
                    Service names and implementations adapt to your provider.
                  </p>
                </div>

              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">

                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected={selectedServices.includes(service.id)}
                    provider={provider}
                    onClick={() => toggleService(service.id)}
                  />
                ))}

              </div>

            </Card>

            {/* CTA */}
            <div className="rounded-3xl bg-black p-7 text-white shadow-xl md:p-8">

              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                    Ready to deploy
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight">
                    Build your infrastructure
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                    Opsify will analyze your repository and prepare the
                    selected cloud resources.
                  </p>

                </div>

                <Button
                  onClick={analyzeRepository}
                  disabled={!githubUrl || analyzing}
                  className="h-12 shrink-0 rounded-xl bg-white px-6 text-sm font-bold text-black hover:bg-zinc-200 disabled:opacity-40"
                >
                  {analyzing
                    ? "Analyzing..."
                    : "Proceed to configuration"}

                  {!analyzing && (
                    <span className="ml-3">
                      <ArrowIcon />
                    </span>
                  )}
                </Button>

              </div>

            </div>

          </div>

          {/* =================================================
              AI RECOMMENDATION PANEL
          ================================================= */}

          <aside className="lg:sticky lg:top-24 lg:h-fit">

            <Card className="overflow-hidden rounded-3xl border-zinc-200 bg-white shadow-sm">

              {/* AI Header */}
              <div className="border-b border-zinc-200 bg-zinc-950 p-7 text-white">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                    <SparkleIcon />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                    AI powered
                  </span>

                </div>

                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Recommendation
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Let AI understand your repo.
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Opsify analyzes your repository structure and recommends
                  infrastructure based on what your application actually needs.
                </p>

              </div>

              {/* AI Body */}
              <div className="p-7">

                <RecommendationStep
                  number="01"
                  title="Analyze repository"
                  description="Inspect framework, dependencies, runtime and project structure."
                />

                <RecommendationStep
                  number="02"
                  title="Identify requirements"
                  description="Determine compute, storage, database and networking needs."
                />

                <RecommendationStep
                  number="03"
                  title="Recommend services"
                  description={`Map requirements to ${provider} cloud services.`}
                />

                <div className="mt-7 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Current provider
                    </span>

                  </div>

                  <p className="mt-2 text-2xl font-black">
                    {provider}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Recommendations will be optimized for this provider.
                  </p>

                </div>

              </div>

            </Card>

          </aside>

        </div>

      </div>
    </main>
  );
}

/* =========================================================
   STEP NUMBER
========================================================= */

function StepNumber({ number }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-[11px] font-bold text-white">
      {number}
    </div>
  );
}

/* =========================================================
   PROVIDER CARD
========================================================= */

function ProviderCard({
  name,
  description,
  selected,
  onClick,
  icon,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
        selected
          ? "border-black bg-zinc-950 text-white shadow-lg shadow-black/10"
          : "border-zinc-200 bg-zinc-50 text-black hover:border-zinc-300 hover:bg-white"
      }`}
    >

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          selected
            ? "bg-white/10 text-white"
            : "bg-white text-zinc-700 shadow-sm"
        }`}
      >
        {icon}
      </div>

      <div className="flex-1">

        <p className="text-sm font-bold">
          {name}
        </p>

        <p
          className={`mt-1 text-xs ${
            selected
              ? "text-zinc-400"
              : "text-zinc-500"
          }`}
        >
          {description}
        </p>

      </div>

      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
          selected
            ? "border-white bg-white"
            : "border-zinc-300"
        }`}
      >
        {selected && (
          <span className="h-2 w-2 rounded-full bg-black" />
        )}
      </div>

    </button>
  );
}

/* =========================================================
   SERVICE CARD
========================================================= */

function ServiceCard({
  service,
  selected,
  provider,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
        selected
          ? "border-zinc-950 bg-zinc-950 text-white"
          : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-white"
      }`}
    >

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          selected
            ? "bg-white/10 text-white"
            : "bg-white text-zinc-600 shadow-sm"
        }`}
      >
        {service.icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-bold">
          {service.title}
        </p>

        <p
          className={`mt-1 text-xs ${
            selected
              ? "text-zinc-400"
              : "text-zinc-500"
          }`}
        >
          {provider} • {service.description}
        </p>

      </div>

      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
          selected
            ? "border-white bg-white"
            : "border-zinc-300"
        }`}
      >
        {selected && (
          <svg
            viewBox="0 0 20 20"
            className="h-3 w-3 text-black"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="m4 10 4 4 8-8" />
          </svg>
        )}
      </div>

    </button>
  );
}

/* =========================================================
   RECOMMENDATION STEP
========================================================= */

function RecommendationStep({
  number,
  title,
  description,
}) {
  return (
    <div className="relative flex gap-4">

      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-[10px] font-black text-zinc-600">
        {number}
      </div>

      <div className="pb-7">

        <p className="text-sm font-bold text-zinc-950">
          {title}
        </p>

        <p className="mt-1.5 text-xs leading-5 text-zinc-500">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   ICONS
========================================================= */

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

function AwsIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-6 w-6"
      fill="none"
    >
      <path
        d="M14 29.5c3.5 2.4 8 3.7 13.1 3.7 5.1 0 9.5-1.3 12.9-3.7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M18 17.5h12M18 22.5h12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M15 13.5h18v19H15z"
        stroke="currentColor"
        strokeWidth="2.5"
        rx="2"
      />
    </svg>
  );
}

function GcpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 18h10a4 4 0 0 0 .7-7.94A6 6 0 0 0 6.1 8.5 4.5 4.5 0 0 0 7 18Z" />
      <path d="M9 14h6" />
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