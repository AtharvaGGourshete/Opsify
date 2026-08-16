"use client";

import { useState } from "react";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [context, setContext] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeRepository() {
    if (!url.trim()) {
      setError("Please enter a GitHub repository URL.");
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

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Repository Intelligence
          </h1>

          <p className="mt-2 text-gray-600">
            Analyze your GitHub repository and understand its
            technology stack and infrastructure.
          </p>
        </div>

        {/* Repository Input */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            GitHub Repository URL
          </label>

          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/user/repository"
              className="flex-1 rounded-lg border px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-black"
            />

            <button
              onClick={analyzeRepository}
              disabled={loading}
              className="rounded-lg bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze Repository"}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Results */}
        {profile && (
          <div className="mt-8 space-y-6">

            {/* Repository Overview */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">
                Repository Overview
              </h2>

              <p className="mt-2 break-all text-sm text-gray-700">
                {profile.repository.url}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                <Stat
                  label="Files"
                  value={profile.statistics.totalFiles}
                />

                <Stat
                  label="Applications"
                  value={profile.statistics.totalApplications}
                />

                <Stat
                  label="Primary Language"
                  value={profile.languages.primary}
                />

                <Stat
                  label="Databases"
                  value={profile.databases.length}
                />
              </div>
            </section>

            {/* Applications */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Applications
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                {profile.applications.map((application) => (
                  <div
                    key={application.directory}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-700">
                        {application.name}
                      </h3>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-800">
                        {application.type}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p>
                        Framework:{" "}
                        <strong>{application.framework}</strong>
                      </p>

                      <p>
                        Runtime:{" "}
                        <strong>{application.runtime}</strong>
                      </p>

                      <p>
                        Package Manager:{" "}
                        <strong>{application.packageManager}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Languages */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Languages
              </h2>

              <div className="space-y-3">
                {profile.languages.detected.map((language) => (
                  <div
                    key={language.language}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-700">
                      {language.language}
                    </span>

                    <span className="text-sm text-gray-500">
                      {language.fileCount} files
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Dependencies */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Dependencies
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                {profile.dependencies.map((dependency) => (
                  <div
                    key={dependency.packageFile}
                    className="rounded-lg border p-4"
                  >
                    <h3 className="font-semibold text-gray-700">
                      {dependency.directory}
                    </h3>

                    <p className="mt-1 text-xs text-gray-800">
                      {dependency.packageManager}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-gray-800">
                      {[
                        ...dependency.production,
                        ...dependency.development,
                      ].map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-gray-100 px-2.5 py-1 text-xs"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Infrastructure */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Infrastructure & CI/CD
              </h2>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
              </div>
            </section>

            {/* Evidence */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Detection Evidence
              </h2>

              <div className="space-y-3">
                {profile.evidence.map((item, index) => (
                  <div
                    key={`${item.source}-${index}`}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between gap-4 text-gray-700">
                      <div>
                        <p className="font-medium">
                          {item.technology}
                        </p>

                        <p className="text-sm text-gray-500">
                          {item.reason}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                      Source: {item.source}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {context && (
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Repository Context
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Raw repository context generated by Repomix.
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">
                    Repomix Output
                  </span>

                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        typeof context === "string"
                          ? context
                          : JSON.stringify(context, null, 2)
                      )
                    }
                    className="rounded-md border bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
                  >
                    Copy Context
                  </button>
                </div>

                <pre className="max-h-[600px] overflow-auto bg-gray-950 p-5 text-xs leading-5 text-gray-200">
                  {typeof context === "string"
                    ? context
                    : JSON.stringify(context, null, 2)}
                </pre>
              </div>
            </section>
          )}

          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-sm text-gray-700">{label}</p>
      <p className="mt-1 text-xl text-gray-800 font-semibold">{value}</p>
    </div>
  );
}

function InfrastructureCard({ name, detected }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="font-medium text-gray-700">{name}</p>

      <p
        className={`mt-2 text-sm ${
          detected ? "text-green-600" : "text-gray-400"
        }`}
      >
        {detected ? "Detected" : "Not detected"}
      </p>
    </div>
  );
}