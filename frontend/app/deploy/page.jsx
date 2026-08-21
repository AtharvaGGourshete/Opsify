"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const icons = {
  github: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.25c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6-.01c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  ),

  search: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
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

  copy: (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),

  check: (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  ),

  database: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
    </svg>
  ),

  code: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 9-4 3 4 3" />
      <path d="m16 9 4 3-4 3" />
      <path d="m14 5-4 14" />
    </svg>
  ),

  server: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <path d="M7 7h.01M7 17h.01" />
    </svg>
  ),
};

export default function DeployPage() {
  const [url, setUrl] = useState("");
  const [context, setContext] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function analyzeRepository() {
    if (!url.trim()) {
      setError("Enter a GitHub repository URL to continue.");
      return;
    }

    setLoading(true);
    setError("");
    setProfile(null);
    setContext(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/repositories/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Repository analysis failed."
        );
      }

      setProfile(data.profile);
      setContext(data.context);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyContext() {
    const value =
      typeof context === "string"
        ? context
        : JSON.stringify(context, null, 2);

    await navigator.clipboard.writeText(value);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <main className="min-h-screen bg-white text-black">

      {/* Background */}
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

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">

        {/* =====================================================
            HERO
        ===================================================== */}

        <header className="mb-16">

          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">

            <div className="max-w-4xl">

              <div className="mb-7 flex items-center gap-3">

                <Badge
                  variant="outline"
                  className="border-zinc-200 bg-zinc-50 px-4 py-1.5 text-sm font-semibold text-black"
                >
                  Repository Intelligence
                </Badge>

              </div>

              <h1 className="text-5xl font-black leading-[0.92] tracking-[-0.06em] text-black sm:text-6xl md:text-7xl lg:text-8xl">
                Understand your
                <br />
                <span className="text-black/35">
                  application.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base font-medium leading-7 text-zinc-600 sm:text-lg md:text-xl md:leading-8">
                Analyze a GitHub repository to discover its technology
                stack, applications, dependencies and infrastructure.
              </p>

            </div>

            {profile && (
              <Badge className="w-fit shrink-0 border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
                <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
                Analysis complete
              </Badge>
            )}

          </div>
        </header>

        {/* =====================================================
            INPUT
        ===================================================== */}

        <Card className="overflow-hidden border-zinc-200 bg-white shadow-[0_25px_70px_-35px_rgba(0,0,0,0.25)]">

          <CardContent className="p-6 md:p-9">

            <div className="mb-7 flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-black">
                {icons.github}
              </div>

              <div>

                <h2 className="text-xl font-bold tracking-tight text-black">
                  Analyze repository
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Paste a public GitHub repository URL
                </p>

              </div>

            </div>

            <div className="flex flex-col gap-3 md:flex-row">

              <div className="relative flex-1">

                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  {icons.search}
                </div>

                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      analyzeRepository();
                    }
                  }}
                  placeholder="https://github.com/username/repository"
                  className="h-14 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-12 pr-5 text-base font-medium text-black outline-none placeholder:text-zinc-400 transition focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5"
                />

              </div>

              <Button
                onClick={analyzeRepository}
                disabled={loading}
                className="h-14 rounded-xl bg-black px-7 text-base font-bold text-white hover:bg-zinc-800"
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze repository
                    <span className="ml-2">
                      {icons.arrow}
                    </span>
                  </>
                )}
              </Button>

            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

          </CardContent>
        </Card>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-xl border border-zinc-200 bg-zinc-50"
              />
            ))}

          </div>
        )}

        {/* =====================================================
            RESULTS
        ===================================================== */}

        {profile && !loading && (
          <div className="mt-16 space-y-14">

            {/* =================================================
                OVERVIEW
            ================================================= */}

            <section>

              <SectionHeading
                eyebrow="Overview"
                title="Repository profile"
                number="01"
              />

              <Card className="border-zinc-200 bg-white shadow-sm">

                <CardContent className="p-6 md:p-9">

                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                    <div className="min-w-0">

                      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500">
                        {icons.github}
                        GitHub repository
                      </div>

                      <p className="mt-3 truncate text-base font-semibold text-black">
                        {profile.repository.url}
                      </p>

                    </div>

                    <Badge
                      variant="outline"
                      className="w-fit border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-black"
                    >
                      Repository analyzed
                    </Badge>

                  </div>

                  <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <Stat
                      label="Files analyzed"
                      value={profile.statistics.totalFiles}
                      icon={icons.code}
                    />

                    <Stat
                      label="Applications"
                      value={profile.statistics.totalApplications}
                      icon={icons.server}
                    />

                    <Stat
                      label="Primary language"
                      value={profile.languages.primary}
                      icon={icons.code}
                    />

                    <Stat
                      label="Databases"
                      value={profile.databases.length}
                      icon={icons.database}
                    />

                  </div>

                </CardContent>
              </Card>

            </section>

            {/* =================================================
                APPLICATIONS
            ================================================= */}

            <section>

              <SectionHeading
                eyebrow="Applications"
                title="What is inside?"
                number="02"
              />

              <div className="grid gap-5 md:grid-cols-2">

                {profile.applications.map((application) => (
                  <Card
                    key={application.directory}
                    className="group border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-black/[0.04]"
                  >

                    <CardContent className="p-7">

                      <div className="flex items-start justify-between gap-5">

                        <div className="min-w-0">

                          <p className="text-xl font-black tracking-tight text-black">
                            {application.name}
                          </p>

                          <p className="mt-2 truncate font-mono text-sm text-zinc-400">
                            {application.directory}
                          </p>

                        </div>

                        <Badge
                          variant="outline"
                          className="shrink-0 border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-black"
                        >
                          {application.type}
                        </Badge>

                      </div>

                      <div className="mt-8 grid grid-cols-3 gap-3">

                        <InfoItem
                          label="Framework"
                          value={application.framework}
                        />

                        <InfoItem
                          label="Runtime"
                          value={application.runtime}
                        />

                        <InfoItem
                          label="Package"
                          value={application.packageManager}
                        />

                      </div>

                    </CardContent>
                  </Card>
                ))}

              </div>
            </section>

            {/* =================================================
                TECHNOLOGY + INFRASTRUCTURE
            ================================================= */}

            <div className="grid gap-12 lg:grid-cols-2">

              <section>

                <SectionHeading
                  eyebrow="Technology"
                  title="Languages"
                  number="03"
                />

                <Card className="border-zinc-200 bg-white shadow-sm">

                  <CardContent className="p-7">

                    <div className="space-y-7">

                      {profile.languages.detected.map((language) => (
                        <div key={language.language}>

                          <div className="mb-3 flex items-center justify-between">

                            <span className="text-base font-bold text-black">
                              {language.language}
                            </span>

                            <span className="font-mono text-sm text-zinc-500">
                              {language.fileCount} files
                            </span>

                          </div>

                          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100">

                            <div
                              className="h-full rounded-full bg-black transition-all"
                              style={{
                                width: `${Math.max(
                                  8,
                                  Math.min(
                                    100,
                                    (language.fileCount /
                                      Math.max(
                                        profile.statistics.totalFiles,
                                        1
                                      )) *
                                      100
                                  )
                                )}%`,
                              }}
                            />

                          </div>

                        </div>
                      ))}

                    </div>

                  </CardContent>
                </Card>

              </section>

              <section>

                <SectionHeading
                  eyebrow="Infrastructure"
                  title="Deployment stack"
                  number="04"
                />

                <Card className="border-zinc-200 bg-white shadow-sm">

                  <CardContent className="grid grid-cols-2 gap-4 p-7">

                    <InfrastructureCard
                      name="Docker"
                      detected={profile.infrastructure.docker.detected}
                    />

                    <InfrastructureCard
                      name="Terraform"
                      detected={profile.infrastructure.terraform.detected}
                    />

                    <InfrastructureCard
                      name="Kubernetes"
                      detected={
                        profile.infrastructure.kubernetes.detected
                      }
                    />

                    <InfrastructureCard
                      name="GitHub Actions"
                      detected={
                        profile.ci_cd.githubActions.detected
                      }
                    />

                  </CardContent>
                </Card>

              </section>

            </div>

            {/* =================================================
                DEPENDENCIES
            ================================================= */}

            <section>

              <SectionHeading
                eyebrow="Packages"
                title="Dependencies"
                number="05"
              />

              <div className="grid gap-5 md:grid-cols-2">

                {profile.dependencies.map((dependency) => (
                  <Card
                    key={dependency.packageFile}
                    className="border-zinc-200 bg-white shadow-sm"
                  >

                    <CardContent className="p-7">

                      <div className="flex items-start justify-between gap-5">

                        <div className="min-w-0">

                          <h3 className="text-lg font-bold text-black">
                            {dependency.directory}
                          </h3>

                          <p className="mt-2 truncate font-mono text-sm text-zinc-400">
                            {dependency.packageFile}
                          </p>

                        </div>

                        <Badge
                          variant="outline"
                          className="shrink-0 border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-black"
                        >
                          {dependency.packageManager}
                        </Badge>

                      </div>

                      <div className="mt-7">

                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                          Dependencies
                        </p>

                        <div className="flex flex-wrap gap-2">

                          {[
                            ...dependency.production,
                            ...dependency.development,
                          ].map((item) => (
                            <span
                              key={item}
                              className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs font-medium text-zinc-700"
                            >
                              {item}
                            </span>
                          ))}

                        </div>

                      </div>

                    </CardContent>
                  </Card>
                ))}

              </div>
            </section>

            {/* =================================================
                EVIDENCE
            ================================================= */}

            <section>

              <SectionHeading
                eyebrow="Detection"
                title="Why Opsify thinks this"
                number="06"
              />

              <Card className="border-zinc-200 bg-white shadow-sm">

                <CardContent className="divide-y divide-zinc-100 p-0">

                  {profile.evidence.map((item, index) => (
                    <div
                      key={`${item.source}-${index}`}
                      className="flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between"
                    >

                      <div className="flex items-start gap-4">

                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          {icons.check}
                        </div>

                        <div>

                          <p className="text-base font-bold text-black">
                            {item.technology}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-zinc-600">
                            {item.reason}
                          </p>

                          <p className="mt-3 font-mono text-xs text-zinc-400">
                            SOURCE: {item.source}
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-4 md:flex-col md:items-end">

                        <span className="text-2xl font-black text-black">
                          {Math.round(item.confidence * 100)}%
                        </span>

                        <div className="h-2 w-36 overflow-hidden rounded-full bg-zinc-100">

                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                              width: `${item.confidence * 100}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>
                  ))}

                </CardContent>
              </Card>

            </section>

            {/* =================================================
                RAW CONTEXT
            ================================================= */}

            {context && (
              <section>

                <SectionHeading
                  eyebrow="Repomix"
                  title="Repository context"
                  number="07"
                />

                <Card className="overflow-hidden border-zinc-200 bg-white shadow-sm">

                  <div className="flex flex-col justify-between gap-5 border-b border-zinc-200 bg-zinc-50 px-6 py-5 sm:flex-row sm:items-center">

                    <div>

                      <p className="text-base font-bold text-black">
                        Raw repository context
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Generated context available for AI analysis.
                      </p>

                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyContext}
                      className="h-10 border-zinc-200 bg-white px-4 text-sm font-semibold text-black hover:bg-zinc-100"
                    >
                      {copied ? (
                        <>
                          {icons.check}
                          <span className="ml-2">
                            Copied
                          </span>
                        </>
                      ) : (
                        <>
                          {icons.copy}
                          <span className="ml-2">
                            Copy context
                          </span>
                        </>
                      )}
                    </Button>

                  </div>

                  <pre className="max-h-[600px] overflow-auto bg-zinc-950 p-6 font-mono text-xs leading-6 text-white md:p-8">
                    {typeof context === "string"
                      ? context
                      : JSON.stringify(context, null, 2)}
                  </pre>

                </Card>

              </section>
            )}
          <Link href={"/deploy/configurations"}><Button>Proceed</Button></Link>
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        

      </div>
    </main>
  );
}

/* =============================================================
   SECTION HEADING
============================================================= */

function SectionHeading({ eyebrow, title, number }) {
  return (
    <div className="mb-6 flex items-end justify-between">

      <div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-3xl font-black tracking-tight text-black md:text-4xl">
          {title}
        </h2>

      </div>

      <span className="font-mono text-xs text-zinc-400">
        ANALYSIS / {number}
      </span>

    </div>
  );
}

/* =============================================================
   STAT
============================================================= */

function Stat({ label, value, icon }) {
  return (
    <div className="group rounded-xl border border-zinc-200 bg-zinc-50 p-6 transition hover:border-zinc-300 hover:bg-white hover:shadow-md">

      <div className="flex items-center justify-between">

        <span className="text-black">
          {icon}
        </span>

        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Metric
        </span>

      </div>

      <p className="mt-7 truncate text-4xl font-black tracking-tight text-black">
        {value}
      </p>

      <p className="mt-2 text-sm font-medium text-zinc-500">
        {label}
      </p>

    </div>
  );
}

/* =============================================================
   INFO ITEM
============================================================= */

function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">

      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-semibold text-black">
        {value || "Unknown"}
      </p>

    </div>
  );
}

/* =============================================================
   INFRASTRUCTURE
============================================================= */

function InfrastructureCard({ name, detected }) {
  return (
    <div
      className={`rounded-xl border p-6 transition ${
        detected
          ? "border-emerald-200 bg-emerald-50"
          : "border-zinc-200 bg-zinc-50"
      }`}
    >

      <div className="flex items-center justify-between">

        <p className="text-base font-bold text-black">
          {name}
        </p>

        <span
          className={`h-2.5 w-2.5 rounded-full ${
            detected
              ? "bg-emerald-500"
              : "bg-zinc-300"
          }`}
        />

      </div>

      <p
        className={`mt-3 text-sm font-semibold ${
          detected
            ? "text-emerald-700"
            : "text-zinc-500"
        }`}
      >
        {detected ? "Detected" : "Not detected"}
      </p>

    </div>
  );
}