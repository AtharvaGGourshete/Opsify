"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
const icons = {
  github: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      {" "}
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.25c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6-.01c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />{" "}
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
      {" "}
      <circle cx="11" cy="11" r="7" /> <path d="m20 20-4-4" />{" "}
    </svg>
  ),
  arrow: (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {" "}
      <path d="M5 12h14" /> <path d="m13 5 7 7-7 7" />{" "}
    </svg>
  ),
  copy: (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {" "}
      <rect x="9" y="9" width="11" height="11" rx="2" />{" "}
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />{" "}
    </svg>
  ),
  check: (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      {" "}
      <path d="m5 12 4 4L19 6" />{" "}
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
      {" "}
      <ellipse cx="12" cy="5" rx="8" ry="3" />{" "}
      <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />{" "}
      <path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />{" "}
    </svg>
  ),
  code: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      {" "}
      <path d="m8 9-4 3 4 3" /> <path d="m16 9 4 3-4 3" />{" "}
      <path d="m14 5-4 14" />{" "}
    </svg>
  ),
  server: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      {" "}
      <rect x="3" y="4" width="18" height="6" rx="2" />{" "}
      <rect x="3" y="14" width="18" height="6" rx="2" />{" "}
      <path d="M7 7h.01M7 17h.01" />{" "}
    </svg>
  ),
};
export default function Dashboard() {
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.trim() }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Repository analysis failed.");
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
      typeof context === "string" ? context : JSON.stringify(context, null, 2);
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1800);
  }
  return (
    <main className="min-h-screen bg-[#070809] text-white">
      {" "}
      {/* Background */}{" "}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {" "}
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[140px]" />{" "}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />{" "}
      </div>{" "}
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        {" "}
        {/* ===================================================== HEADER ===================================================== */}{" "}
        <header className="mb-12">
          {" "}
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            {" "}
            <div>
              {" "}
              <div className="mb-5 flex items-center gap-2">
                {" "}
                <Badge
                  variant="outline"
                  className="border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-white/50"
                >
                  {" "}
                  Repository Intelligence{" "}
                </Badge>{" "}
                <span className="text-xs text-white/20"> OPSIFY </span>{" "}
              </div>{" "}
              <h1 className="text-4xl font-black tracking-[-0.04em] md:text-6xl">
                {" "}
                Understand your <br />{" "}
                <span className="text-white/35"> application. </span>{" "}
              </h1>{" "}
              <p className="mt-5 max-w-2xl text-sm font-medium leading-6 text-white/40 md:text-base">
                {" "}
                Analyze a GitHub repository to discover its technology stack,
                applications, dependencies and infrastructure.{" "}
              </p>{" "}
            </div>{" "}
            {profile && (
              <Badge className="w-fit border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-emerald-400 hover:bg-emerald-400/[0.06]">
                {" "}
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />{" "}
                Analysis complete{" "}
              </Badge>
            )}{" "}
          </div>{" "}
        </header>{" "}
        {/* ===================================================== REPOSITORY INPUT ===================================================== */}{" "}
        <Card className="overflow-hidden border-white/[0.08] bg-[#0c0e11] shadow-2xl shadow-black/20">
          {" "}
          <CardContent className="p-6 md:p-8">
            {" "}
            <div className="mb-5 flex items-center gap-3">
              {" "}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
                {" "}
                {icons.github}{" "}
              </div>{" "}
              <div>
                {" "}
                <h2 className="text-sm font-bold"> Analyze repository </h2>{" "}
                <p className="mt-0.5 text-xs text-white/30">
                  {" "}
                  Paste a public GitHub repository URL{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex flex-col gap-3 md:flex-row">
              {" "}
              <div className="relative flex-1">
                {" "}
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25">
                  {" "}
                  {icons.search}{" "}
                </div>{" "}
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
                  className="h-12 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] pl-12 pr-4 text-sm font-medium text-white outline-none placeholder:text-white/20 transition focus:border-white/20 focus:bg-white/[0.04]"
                />{" "}
              </div>{" "}
              <Button
                onClick={analyzeRepository}
                disabled={loading}
                className="h-12 rounded-lg bg-white px-6 font-bold text-black hover:bg-white/90"
              >
                {" "}
                {loading ? (
                  <>
                    {" "}
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />{" "}
                    Analyzing...{" "}
                  </>
                ) : (
                  <>
                    {" "}
                    Analyze repository{" "}
                    <span className="ml-2"> {icons.arrow} </span>{" "}
                  </>
                )}{" "}
              </Button>{" "}
            </div>{" "}
            {error && (
              <div className="mt-4 rounded-lg border border-red-400/10 bg-red-400/[0.04] px-4 py-3 text-sm font-medium text-red-400">
                {" "}
                {error}{" "}
              </div>
            )}{" "}
            <p className="mt-4 text-xs text-white/20">
              {" "}
              Press Enter to analyze · Repository data is processed by
              Opsify{" "}
            </p>{" "}
          </CardContent>{" "}
        </Card>{" "}
        {/* ===================================================== LOADING STATE ===================================================== */}{" "}
        {loading && (
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {" "}
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]"
              />
            ))}{" "}
          </div>
        )}{" "}
        {/* ===================================================== RESULTS ===================================================== */}{" "}
        {profile && !loading && (
          <div className="mt-10 space-y-8">
            {" "}
            {/* ================================================= OVERVIEW ================================================= */}{" "}
            <section>
              {" "}
              <div className="mb-5 flex items-end justify-between">
                {" "}
                <div>
                  {" "}
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/25">
                    {" "}
                    Overview{" "}
                  </p>{" "}
                  <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
                    {" "}
                    Repository profile{" "}
                  </h2>{" "}
                </div>{" "}
                <span className="hidden text-xs font-mono text-white/20 md:block">
                  {" "}
                  ANALYSIS / 01{" "}
                </span>{" "}
              </div>{" "}
              <Card className="border-white/[0.08] bg-[#0c0e11]">
                {" "}
                <CardContent className="p-6 md:p-8">
                  {" "}
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    {" "}
                    <div className="min-w-0">
                      {" "}
                      <div className="flex items-center gap-2 text-xs font-semibold text-white/30">
                        {" "}
                         GitHub repository{" "}
                      </div>{" "}
                      <p className="mt-3 truncate text-sm font-semibold text-white/70">
                        {" "}
                        {profile.repository.url}{" "}
                      </p>{" "}
                    </div>{" "}
                    <Badge
                      variant="outline"
                      className="w-fit border-white/[0.08] bg-white/[0.025] text-white/40"
                    >
                      {" "}
                      Repository analyzed{" "}
                    </Badge>{" "}
                  </div>{" "}
                  <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {" "}
                    <Stat
                      label="Files analyzed"
                      value={profile.statistics.totalFiles}
                      icon={icons.code}
                    />{" "}
                    <Stat
                      label="Applications"
                      value={profile.statistics.totalApplications}
                      icon={icons.server}
                    />{" "}
                    <Stat
                      label="Primary language"
                      value={profile.languages.primary}
                      icon={icons.code}
                    />{" "}
                    <Stat
                      label="Databases"
                      value={profile.databases.length}
                      icon={icons.database}
                    />{" "}
                  </div>{" "}
                </CardContent>{" "}
              </Card>{" "}
            </section>{" "}
            {/* ================================================= APPLICATIONS ================================================= */}{" "}
            <section>
              {" "}
              <SectionHeading
                eyebrow="Applications"
                title="What is inside?"
                number="02"
              />{" "}
              <div className="grid gap-4 md:grid-cols-2">
                {" "}
                {profile.applications.map((application) => (
                  <Card
                    key={application.directory}
                    className="group border-white/[0.07] bg-[#0c0e11] transition-all hover:-translate-y-0.5 hover:border-white/[0.14]"
                  >
                    {" "}
                    <CardContent className="p-6">
                      {" "}
                      <div className="flex items-start justify-between gap-4">
                        {" "}
                        <div>
                          {" "}
                          <p className="text-lg font-black tracking-tight">
                            {" "}
                            {application.name}{" "}
                          </p>{" "}
                          <p className="mt-1 font-mono text-xs text-white/25">
                            {" "}
                            {application.directory}{" "}
                          </p>{" "}
                        </div>{" "}
                        <Badge
                          variant="outline"
                          className="border-white/[0.08] bg-white/[0.025] text-white/50"
                        >
                          {" "}
                          {application.type}{" "}
                        </Badge>{" "}
                      </div>{" "}
                      <div className="mt-7 grid grid-cols-3 gap-2">
                        {" "}
                        <InfoItem
                          label="Framework"
                          value={application.framework}
                        />{" "}
                        <InfoItem label="Runtime" value={application.runtime} />{" "}
                        <InfoItem
                          label="Package"
                          value={application.packageManager}
                        />{" "}
                      </div>{" "}
                    </CardContent>{" "}
                  </Card>
                ))}{" "}
              </div>{" "}
            </section>{" "}
            {/* ================================================= LANGUAGES + INFRASTRUCTURE ================================================= */}{" "}
            <div className="grid gap-8 lg:grid-cols-2">
              {" "}
              <section>
                {" "}
                <SectionHeading
                  eyebrow="Technology"
                  title="Languages"
                  number="03"
                />{" "}
                <Card className="border-white/[0.07] bg-[#0c0e11]">
                  {" "}
                  <CardContent className="p-6">
                    {" "}
                    <div className="space-y-5">
                      {" "}
                      {profile.languages.detected.map((language, index) => (
                        <div key={language.language}>
                          {" "}
                          <div className="mb-2 flex items-center justify-between">
                            {" "}
                            <span className="text-sm font-bold">
                              {" "}
                              {language.language}{" "}
                            </span>{" "}
                            <span className="text-xs font-mono text-white/30">
                              {" "}
                              {language.fileCount} files{" "}
                            </span>{" "}
                          </div>{" "}
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                            {" "}
                            <div
                              className="h-full rounded-full bg-white transition-all"
                              style={{
                                width: `${Math.max(8, Math.min(100, (language.fileCount / Math.max(profile.statistics.totalFiles, 1)) * 100))}%`,
                              }}
                            />{" "}
                          </div>{" "}
                        </div>
                      ))}{" "}
                    </div>{" "}
                  </CardContent>{" "}
                </Card>{" "}
              </section>{" "}
              <section>
                {" "}
                <SectionHeading
                  eyebrow="Infrastructure"
                  title="Deployment stack"
                  number="04"
                />{" "}
                <Card className="border-white/[0.07] bg-[#0c0e11]">
                  {" "}
                  <CardContent className="grid grid-cols-2 gap-3 p-6">
                    {" "}
                    <InfrastructureCard
                      name="Docker"
                      detected={profile.infrastructure.docker.detected}
                    />{" "}
                    <InfrastructureCard
                      name="Terraform"
                      detected={profile.infrastructure.terraform.detected}
                    />{" "}
                    <InfrastructureCard
                      name="Kubernetes"
                      detected={profile.infrastructure.kubernetes.detected}
                    />{" "}
                    <InfrastructureCard
                      name="GitHub Actions"
                      detected={profile.ci_cd.githubActions.detected}
                    />{" "}
                  </CardContent>{" "}
                </Card>{" "}
              </section>{" "}
            </div>{" "}
            {/* ================================================= DEPENDENCIES ================================================= */}{" "}
            <section>
              {" "}
              <SectionHeading
                eyebrow="Packages"
                title="Dependencies"
                number="05"
              />{" "}
              <div className="grid gap-4 md:grid-cols-2">
                {" "}
                {profile.dependencies.map((dependency) => (
                  <Card
                    key={dependency.packageFile}
                    className="border-white/[0.07] bg-[#0c0e11]"
                  >
                    {" "}
                    <CardContent className="p-6">
                      {" "}
                      <div className="flex items-start justify-between">
                        {" "}
                        <div>
                          {" "}
                          <h3 className="font-bold">
                            {" "}
                            {dependency.directory}{" "}
                          </h3>{" "}
                          <p className="mt-1 font-mono text-xs text-white/25">
                            {" "}
                            {dependency.packageFile}{" "}
                          </p>{" "}
                        </div>{" "}
                        <Badge
                          variant="outline"
                          className="border-white/[0.08] text-white/40"
                        >
                          {" "}
                          {dependency.packageManager}{" "}
                        </Badge>{" "}
                      </div>{" "}
                      <div className="mt-6">
                        {" "}
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/20">
                          {" "}
                          Dependencies{" "}
                        </p>{" "}
                        <div className="flex flex-wrap gap-2">
                          {" "}
                          {[
                            ...dependency.production,
                            ...dependency.development,
                          ].map((item) => (
                            <span
                              key={item}
                              className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 font-mono text-[11px] text-white/50"
                            >
                              {" "}
                              {item}{" "}
                            </span>
                          ))}{" "}
                        </div>{" "}
                      </div>{" "}
                    </CardContent>{" "}
                  </Card>
                ))}{" "}
              </div>{" "}
            </section>{" "}
            {/* ================================================= EVIDENCE ================================================= */}{" "}
            <section>
              {" "}
              <SectionHeading
                eyebrow="Detection"
                title="Why Opsify thinks this"
                number="06"
              />{" "}
              <Card className="border-white/[0.07] bg-[#0c0e11]">
                {" "}
                <CardContent className="divide-y divide-white/[0.05] p-0">
                  {" "}
                  {profile.evidence.map((item, index) => (
                    <div
                      key={`${item.source}-${index}`}
                      className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6"
                    >
                      {" "}
                      <div className="flex items-start gap-4">
                        {" "}
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.06] text-emerald-400">
                          {" "}
                          {icons.check}{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <p className="text-sm font-bold">
                            {" "}
                            {item.technology}{" "}
                          </p>{" "}
                          <p className="mt-1 text-sm leading-5 text-white/35">
                            {" "}
                            {item.reason}{" "}
                          </p>{" "}
                          <p className="mt-2 font-mono text-[10px] text-white/20">
                            {" "}
                            SOURCE: {item.source}{" "}
                          </p>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div className="flex items-center gap-3 md:flex-col md:items-end">
                        {" "}
                        <span className="text-xl font-black">
                          {" "}
                          {Math.round(item.confidence * 100)}%{" "}
                        </span>{" "}
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/[0.05]">
                          {" "}
                          <div
                            className="h-full rounded-full bg-emerald-400"
                            style={{ width: `${item.confidence * 100}%` }}
                          />{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>
                  ))}{" "}
                </CardContent>{" "}
              </Card>{" "}
            </section>{" "}
            {/* ================================================= RAW CONTEXT ================================================= */}{" "}
            {context && (
              <section>
                {" "}
                <SectionHeading
                  eyebrow="Repomix"
                  title="Repository context"
                  number="07"
                />{" "}
                <Card className="overflow-hidden border-white/[0.07] bg-[#0c0e11]">
                  {" "}
                  <div className="flex flex-col justify-between gap-4 border-b border-white/[0.06] bg-white/[0.015] px-5 py-4 sm:flex-row sm:items-center">
                    {" "}
                    <div>
                      {" "}
                      <p className="text-sm font-bold">
                        {" "}
                        Raw repository context{" "}
                      </p>{" "}
                      <p className="mt-1 text-xs text-white/25">
                        {" "}
                        Generated context available for AI analysis.{" "}
                      </p>{" "}
                    </div>{" "}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyContext}
                      className="border-white/[0.08] bg-transparent text-white/60 hover:bg-white/[0.05] hover:text-white"
                    >
                      {" "}
                      {copied ? (
                        <>
                          {" "}
                          {icons.check}{" "}
                          <span className="ml-2">Copied</span>{" "}
                        </>
                      ) : (
                        <>
                          {" "}
                          {icons.copy}{" "}
                          <span className="ml-2">Copy context</span>{" "}
                        </>
                      )}{" "}
                    </Button>{" "}
                  </div>{" "}
                  <pre className="max-h-[600px] overflow-auto bg-[#08090b] p-6 font-mono text-[11px] leading-6 text-white/45">
                    {" "}
                    {typeof context === "string"
                      ? context
                      : JSON.stringify(context, null, 2)}{" "}
                  </pre>{" "}
                </Card>{" "}
              </section>
            )}{" "}
          </div>
        )}{" "}
        {/* ===================================================== EMPTY STATE ===================================================== */}{" "}
        {!profile && !loading && !error && (
          <div className="mt-24 text-center">
            {" "}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-white/30">
              {" "}
              {icons.github}{" "}
            </div>{" "}
            <h2 className="mt-6 text-2xl font-black tracking-tight">
              {" "}
              Ready to inspect your code?{" "}
            </h2>{" "}
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/30">
              {" "}
              Paste a GitHub repository above and Opsify will build a detailed
              technical profile of your application.{" "}
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </main>
  );
}
/* ============================================================= COMPONENTS ============================================================= */ function SectionHeading({
  eyebrow,
  title,
  number,
}) {
  return (
    <div className="mb-5 flex items-end justify-between">
      {" "}
      <div>
        {" "}
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
          {" "}
          {eyebrow}{" "}
        </p>{" "}
        <h2 className="mt-2 text-2xl font-black tracking-tight">
          {" "}
          {title}{" "}
        </h2>{" "}
      </div>{" "}
      <span className="font-mono text-xs text-white/15">
        {" "}
        ANALYSIS / {number}{" "}
      </span>{" "}
    </div>
  );
}
function Stat({ label, value, icon }) {
  return (
    <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition hover:border-white/[0.12]">
      {" "}
      <div className="flex items-center justify-between">
        {" "}
        <span className="text-white/25"> {icon} </span>{" "}
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
          {" "}
          Metric{" "}
        </span>{" "}
      </div>{" "}
      <p className="mt-7 truncate text-2xl font-black tracking-tight">
        {" "}
        {value}{" "}
      </p>{" "}
      <p className="mt-1 text-xs font-medium text-white/30"> {label} </p>{" "}
    </div>
  );
}
function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      {" "}
      <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">
        {" "}
        {label}{" "}
      </p>{" "}
      <p className="mt-2 truncate text-xs font-semibold text-white/60">
        {" "}
        {value || "Unknown"}{" "}
      </p>{" "}
    </div>
  );
}
function InfrastructureCard({ name, detected }) {
  return (
    <div
      className={`rounded-xl border p-5 transition ${detected ? "border-emerald-400/10 bg-emerald-400/[0.025]" : "border-white/[0.06] bg-white/[0.015]"}`}
    >
      {" "}
      <div className="flex items-center justify-between">
        {" "}
        <p className="text-sm font-bold"> {name} </p>{" "}
        <span
          className={`h-2 w-2 rounded-full ${detected ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-white/15"}`}
        />{" "}
      </div>{" "}
      <p
        className={`mt-3 text-xs font-semibold ${detected ? "text-emerald-400" : "text-white/20"}`}
      >
        {" "}
        {detected ? "Detected" : "Not detected"}{" "}
      </p>{" "}
    </div>
  );
}
