"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useSession } from "next-auth/react";

const icons = {
  github: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.25c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6-.01c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  ),
  search: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>,
  arrow: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 5 7 7-7 7" /></svg>,
  copy: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
  check: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>,
  database: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></svg>,
  code: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m8 9-4 3 4 3" /><path d="m16 9 4 3-4 3" /><path d="m14 5-4 14" /></svg>,
  server: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="6" rx="2" /><rect x="3" y="14" width="18" height="6" rx="2" /><path d="M7 7h.01M7 17h.01" /></svg>,
};

export default function DeployPage() {
  const { data: session } = useSession();

  const [repositories, setRepositories] = useState([]);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [url, setUrl] = useState("");
  const [context, setContext] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [repositoriesLoading, setRepositoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadRepositories() {
      if (!session?.user?.githubId) {
        setRepositoriesLoading(false);
        return;
      }

      try {
        setRepositoriesLoading(true);
        setError("");

        const response = await fetch("/api/github/repositories", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load GitHub repositories."
          );
        }

        setRepositories(data.repositories || []);
      } catch (error) {
        console.error("Failed to load GitHub repositories:", error);

        setError(
          error.message || "Failed to load GitHub repositories."
        );
      } finally {
        setRepositoriesLoading(false);
      }
    }

    loadRepositories();
  }, [session]);

  useEffect(() => {
    async function loadLatestAnalysis() {
      const githubUserId = session?.user?.githubId;

      if (!githubUserId) {
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/repositories/latest?github_user_id=${encodeURIComponent(
            githubUserId
          )}`,
          {
            cache: "no-store",
          }
        );

        if (response.status === 404) {
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load repository analysis."
          );
        }

        setProfile(data.profile);

        setUrl(data.profile.repository.url);
      } catch (error) {
        console.error(
          "Failed to restore repository analysis:",
          error
        );
      }
    }

    loadLatestAnalysis();
  }, [session]);

  async function analyzeRepository() {
    async function analyzeRepository() {
      if (!selectedRepository) {
        setError("Select a GitHub repository to continue.");
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
              url: selectedRepository.html_url,
              github_user_id: session?.user?.githubId,
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
            github_user_id: session?.user?.githubId,
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

  function clearAnalysis() {
    setProfile(null);
    setContext(null);
    setSelectedRepository(null);
    setUrl("");
    setError("");
    setCopied(false);
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
    <main className="min-h-screen bg-[#cdedf6] text-black">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-black/[0.025] blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <header className="mb-16">
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
            <div className="max-w-4xl">
              <div className="mb-7 flex items-center gap-3">
                <Badge variant="outline" className="border-black bg-[#58a4b0]/40 px-4 py-3 text-sm font-semibold text-black">
                  Repository Intelligence
                </Badge>
              </div>

              <h1 className="text-5xl leading-[0.92] tracking-[-0.06em] text-[#58a4b0] sm:text-6xl md:text-7xl lg:text-8xl">
                Understand your<br />
                <span className="text-black">application.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base font-small leading-7 text-black sm:text-lg md:text-xl md:leading-8">
                Analyze a GitHub repository to discover its technology
                stack, applications, dependencies and infrastructure.
              </p>
            </div>

            {profile && (
              <Badge className="w-fit shrink-0 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
                <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
                Analysis complete
              </Badge>
            )}
          </div>
        </header>
        <Card className="overflow-hidden border-zinc-200 bg-white shadow-[0_25px_70px_-35px_rgba(0,0,0,0.25)]">

          <CardContent className="p-6 md:p-9">
            <div className="mb-7 flex items-center gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-black">Analyze repository</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Select a GitHub repository you have access to
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  {repositoriesLoading ? (
                    <div className="flex h-14 w-full items-center rounded-xl border border-zinc-200 bg-zinc-50 px-5 text-sm font-medium text-zinc-500">
                      Loading your GitHub repositories...
                    </div>
                  ) : repositories.length === 0 ? (
                    <div className="flex h-14 w-full items-center rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-medium text-red-700">
                      No GitHub repositories available.
                    </div>
                  ) : (
                    <select
                      value={selectedRepository?.id || ""}
                      onChange={(e) => {
                        const repository = repositories.find(
                          (item) => String(item.id) === e.target.value
                        );

                        setSelectedRepository(repository || null);
                        setUrl(repository?.html_url || "");
                        setError("");

                        if (repository) {
                          localStorage.setItem(
                            "opsify_selected_repository",
                            JSON.stringify({
                              id: repository.id,
                              name: repository.name,
                              full_name: repository.full_name,
                              html_url: repository.html_url,
                              default_branch: repository.default_branch || "main",
                              private: repository.private,
                              owner: repository.owner,
                            })
                          );
                        } else {
                          localStorage.removeItem("opsify_selected_repository");
                        }
                      }}
                      className="h-14 w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 px-5 pr-10 text-base font-medium text-black outline-none transition focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5"
                    >
                      <option value="">Select a repository</option>

                      {repositories
                        .filter((repository) => !repository.archived)
                        .map((repository) => (
                          <option key={repository.id} value={repository.id}>
                            {repository.full_name}
                            {repository.private ? " — Private" : " — Public"}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                <Button
                  onClick={analyzeRepository}
                  disabled={loading || repositoriesLoading || !selectedRepository}
                  className="h-14 rounded-xl bg-black px-7 text-base font-bold text-white hover:bg-zinc-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze repository
                      <span className="ml-2">{icons.arrow}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {selectedRepository && (
              <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      Selected repository
                    </p>

                    <p className="mt-1 truncate font-mono text-sm font-bold text-black">
                      {selectedRepository.full_name}
                    </p>

                    {selectedRepository.description && (
                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {selectedRepository.description}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600">
                      {selectedRepository.private ? "Private" : "Public"}
                    </span>

                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600">
                      {selectedRepository.default_branch || "main"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
        {loading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-xl border border-zinc-200 bg-zinc-50" />
            ))}
          </div>
        )}

        {profile && !loading && (
          <div className="mt-16 space-y-14">
            <section>
              <SectionHeading eyebrow="Overview" title="Repository profile" number="01" />

              <Card className="border-zinc-200 bg-white shadow-sm">
                <CardContent className="p-6 md:p-9">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500">
                        {icons.github}
                        GitHub repository
                      </div>
                      <p className="mt-3 truncate text-base font-semibold text-black hover:underline">
                        <Link href={profile.repository.url} target="_blank" rel="noopener noreferrer">
                          {profile.repository.url}
                        </Link>
                      </p>
                    </div>

                    <Badge variant="outline" className="w-fit bg-[#cdedf6] px-3 py-3 text-sm font-medium text-black">
                      Repository analyzed
                    </Badge>
                  </div>
                  <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Stat label="Files analyzed" value={profile.statistics.totalFiles} icon={icons.code} />
                    <Stat label="Applications" value={profile.statistics.totalApplications} icon={icons.server} />
                    <Stat label="Primary language" value={profile.languages.primary} icon={icons.code} />
                    <Stat label="Databases" value={profile.databases.length} icon={icons.database} />
                  </div>

                </CardContent>
              </Card>
            </section>
            <section>
              <SectionHeading eyebrow="Applications" title="What is inside?" number="02" />
              <div className="grid gap-5 md:grid-cols-2">
                {profile.applications.map((application) => (
                  <Card key={application.directory} className="group border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-black/[0.04]">
                    <CardContent className="p-7">
                      <div className="flex items-start justify-between gap-5">
                        <div className="min-w-0">
                          <p className="text-xl font-black tracking-tight text-black">
                            {application.name.charAt(0).toUpperCase() + application.name.slice(1)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-8 grid grid-cols-3 gap-3">
                        <InfoItem label="Framework" value={application.framework} />
                        <InfoItem label="Runtime" value={application.runtime} />
                        <InfoItem label="Package" value={application.packageManager} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <div className="grid gap-12 lg:grid-cols-2">
              <section>
                <SectionHeading eyebrow="Technology" title="Languages" number="03" />
                <Card className="border-zinc-200 bg-white shadow-sm">
                  <CardContent className="p-7">
                    <div className="space-y-7">
                      {profile.languages.detected.map((language) => (
                        <div key={language.language}>
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-base font-bold text-black">{language.language}</span>
                            <span className="text-sm text-zinc-500">{language.fileCount} files</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100">
                            <div className="h-full rounded-full bg-[#58a4b0] transition-all" style={{ width: `${Math.max(8, Math.min(100, (language.fileCount / Math.max(profile.statistics.totalFiles, 1)) * 100))}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
              <section>
                <SectionHeading eyebrow="Infrastructure" title="Deployment stack" number="04" />
                <Card className="border-zinc-200 bg-white shadow-sm">
                  <CardContent className="grid grid-cols-2 gap-4 p-7">
                    <InfrastructureCard name="Docker" detected={profile.infrastructure.docker.detected} />
                    <InfrastructureCard name="Terraform" detected={profile.infrastructure.terraform.detected} />
                    <InfrastructureCard name="Kubernetes" detected={profile.infrastructure.kubernetes.detected} />
                    <InfrastructureCard name="GitHub Actions" detected={profile.ci_cd.githubActions.detected} />
                  </CardContent>
                </Card>
              </section>
            </div>

            <section>
              <SectionHeading eyebrow="Packages" title="Dependencies" number="05" />
              <div className="grid gap-5 md:grid-cols-2">
                {profile.dependencies.map((dependency) => (
                  <Card key={dependency.packageFile} className="border-zinc-200 bg-white shadow-sm">
                    <CardContent className="p-7">
                      <div className="flex items-start justify-between gap-5">
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-black">
                            {dependency.directory.charAt(0).toUpperCase(0) + dependency.directory.slice(1)}
                          </h3>
                          <p className="mt-2 truncate font-mono text-sm text-zinc-400">{dependency.packageFile}</p>
                        </div>
                      </div>
                      <div className="mt-7">
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">Dependencies</p>
                        <div className="flex flex-wrap gap-2">
                          {[...dependency.production, ...dependency.development].map((item) => (
                            <span key={item} className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs font-medium text-zinc-700 hover:bg-[#58a4b0] hover:text-white transition cursor-pointer">
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

            <section>
              <SectionHeading eyebrow="Detection" title="Evidence" number="06" />
              <Card className="overflow-hidden border-zinc-200 bg-white shadow-sm">
                <CardContent className="divide-y divide-zinc-100 p-0">
                  {profile.evidence.map((item, index) => {
                    const confidence = Math.round(item.confidence * 100);

                    return (
                      <div key={`${item.source}-${index}`} className="group p-6 transition-colors duration-200 hover:bg-zinc-50/70 md:p-7">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-lg font-bold tracking-tight text-black">
                                  {item.technology}
                                </h3>
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">
                                  Detected
                                </span>
                              </div>
                              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                                {item.reason}
                              </p>
                              <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                                <span className="max-w-[300px] truncate font-mono text-xs font-medium text-zinc-600">
                                  {item.source}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-5 lg:w-44 lg:flex-col lg:items-end lg:gap-2">
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black tracking-tight text-black">
                                {confidence}
                              </span>
                              <span className="text-sm font-bold text-zinc-400">%</span>
                            </div>
                            <div className="w-full max-w-44">
                              <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                                <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${confidence}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </section>
            <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-8 sm:flex-row sm:items-center sm:justify-center">
              <Button type="button" onClick={clearAnalysis} variant="outline" className="h-12 rounded-xl px-7 font-semibold text-black cursor-pointer hover:bg-zinc-100">
                Clear Analysis
              </Button>
              <Link href="/aws-setup">
                <Button type="button" className="h-12 w-full rounded-xl bg-black px-8 text-base font-bold text-white hover:bg-zinc-800 sm:w-auto cursor-pointer">
                  Proceed
                  <span className="ml-2">{icons.arrow}</span>
                </Button>
              </Link>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

function SectionHeading({ eyebrow, title, number }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-black md:text-4xl">
          {title}
        </h2>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="group rounded-xl border border-zinc-200 bg-zinc-50 p-6 transition hover:border-zinc-300 hover:shadow-md hover:bg-[#cdedf6]">
      <div className="flex items-center justify-between">
        <span className="text-black">{icon}</span>
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

function InfrastructureCard({ name, detected }) {
  return (
    <div className={`rounded-xl border p-6 transition ${detected ? "border-emerald-200 bg-emerald-50" : "border-zinc-200 bg-zinc-50"}`}>
      <div className="flex items-center justify-between">
        <p className="text-base font-bold text-black">
          {name}
        </p>
      </div>
      <p className={`mt-3 text-sm font-semibold ${detected ? "text-emerald-700" : "text-zinc-500"}`}>
        {detected ? "Detected" : "Not detected"}
      </p>
    </div>
  );
}
