import { auth } from "@/auth";
import SignIn from "@/components/auth/sign-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    number: "01",
    title: "AI-Powered Architecture",
    description:
      "Opsify analyzes your repository and recommends the exact cloud infrastructure your application actually needs.",
  },
  {
    number: "02",
    title: "Secure by Default",
    description:
      "Deploy seamlessly through GitHub Actions OIDC without storing long-lived, high-risk cloud credentials.",
  },
  {
    number: "03",
    title: "One-Click Deployment",
    description:
      "Go straight from configuration to a live production application without manually wiring individual services.",
  },
  {
    number: "04",
    title: "Automated DevOps",
    description:
      "Build, provision, deploy, and retrieve your running application instance through a unified workflow.",
  },
  {
    number: "05",
    title: "Your Cloud Account",
    description:
      "Infrastructure is provisioned entirely inside your private AWS account. You retain total ownership.",
  },
  {
    number: "06",
    title: "AI DevOps Mentor",
    description:
      "Gain full visibility into what Opsify executes and the engineering rationale behind every decision.",
  },
];

const steps = [
  {
    number: "01",
    title: "Connect GitHub",
    description:
      "Link your target repository and let Opsify intelligently parse your application structure.",
  },
  {
    number: "02",
    title: "Choose Infrastructure",
    description:
      "Customize services manually or accept optimized AI recommendations tailored for scale.",
  },
  {
    number: "03",
    title: "Deploy Live",
    description:
      "Opsify safely provisions AWS resources and pushes your application to production.",
  },
];

function ArrowRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
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

function ArrowDown() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

function GitHubLogo({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.25c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6-.01c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M7.5 18.5h9a4 4 0 0 0 .48-7.97A5.5 5.5 0 0 0 6.36 9.5 4.5 4.5 0 0 0 7.5 18.5Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3 5 6v5c0 4.5 2.9 8.5 7 10 4.1-1.5 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="m12 3 1.3 5.7L19 10l-5.7 1.3L12 17l-1.3-5.7L5 10l5.7-1.3L12 3Z" />
      <path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M14 4c2.5-2.5 5.5-2.5 6-2 .5.5.5 3.5-2 6l-7.5 7.5-4-4L14 4Z" />
      <path d="m8.5 11.5-3 1-2 4 4-2 1-3Z" />
      <path d="m12.5 15.5-1 3-4 2 2-4 3-1Z" />
      <circle cx="16.5" cy="7.5" r="1.5" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3" />
      <path d="M13 15h4" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  );
}

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fafafa] text-neutral-900 selection:bg-neutral-900 selection:text-white">
    
      <section id="product" className="relative overflow-hidden px-6 pb-24 md:pb-36 pt-10">
        
        {/* Soft Modern Glow */}
        <div className="pointer-events-none absolute left-1/2 top-16 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-neutral-200/60 blur-[120px]" />

        {/* Clean Light Subtle Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative mx-auto max-w-7xl">

          {/* Hero Heading */}
          <h1 className="mx-auto mt-8 max-w-6xl text-center text-[3.2rem] font-extrabold leading-[1] tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-[7rem]">
            <span className="block text-neutral-900">From code.</span>
            <span className="block text-neutral-400">To cloud.</span>
            <span className="block text-neutral-900">Automatically.</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-8 max-w-2xl text-center text-base font-normal leading-7 text-neutral-600 md:text-lg md:leading-8">
            Deploy your GitHub projects straight to production without becoming a DevOps expert. 
            <strong className="font-semibold text-neutral-900"> Opsify manages the infrastructure layer.</strong>
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 w-60 rounded-xl bg-neutral-900 px-6 text-sm font-bold text-white shadow-lg shadow-neutral-900/10 hover:bg-neutral-800 transition-all"
            >
              <a href="#get-started">
                <div className="flex items-center gap-2">
                  Deploy your first app
                  <ArrowRight />
                </div>
              </a>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 hover:text-neutral-900 transition-all"
            >
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>

          {/* Trust Text */}
          <p className="mt-6 text-center text-xs font-medium text-neutral-400 tracking-wide uppercase">
            Your Cloud Account · Your Infrastructure · Complete Control
          </p>

          {/* =====================================================
              PRODUCT PREVIEW CARD
          ===================================================== */}
          <div className="relative mx-auto mt-20 max-w-5xl">
            <Card className="relative overflow-hidden rounded-2xl border-neutral-200/80 bg-white shadow-xl shadow-neutral-200/50">
              
              {/* Window Bar */}
              <div className="flex h-12 items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-5">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-neutral-200" />
                  <span className="h-3 w-3 rounded-full bg-neutral-200" />
                  <span className="h-3 w-3 rounded-full bg-neutral-200" />
                </div>
                <span className="font-mono text-[11px] font-semibold text-neutral-400 tracking-wider">
                  OPSIFY_CLI_v2.4
                </span>
                <div className="w-8" />
              </div>

              <div className="grid md:grid-cols-[1.2fr_1fr]">
                
                {/* Terminal Side */}
                <CardContent className="border-b border-neutral-100 p-6 md:border-b-0 md:border-r md:p-8 bg-neutral-900 text-neutral-100">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 text-white">
                      <GitHubLogo />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">your-repository</p>
                      <p className="text-[10px] text-neutral-400 font-mono">github.com/org/project</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 font-mono text-xs shadow-inner">
                    <div className="mb-4 text-neutral-500">$ opsify deploy --production</div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span className="text-neutral-300">Repository structure analyzed</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span className="text-neutral-300">CloudFormation blueprint generated</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span className="text-neutral-300">AWS resources securely provisioned</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span className="text-neutral-300">Production pipeline built & active</span>
                      </div>
                      <div className="mt-5 border-t border-neutral-800/80 pt-4">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-sans">Live Endpoint</p>
                        <p className="mt-1.5 font-mono text-xs text-emerald-400 font-semibold underline underline-offset-4">
                          https://app.opsify.dev
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Architecture Overview Side */}
                <CardContent className="p-6 md:p-8 bg-white flex flex-col justify-between">
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Configuration</p>
                        <h3 className="mt-1 text-lg font-bold text-neutral-900">Stack Ready</h3>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        ACTIVE
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        ["Compute Engine", "AWS Lambda"],
                        ["API Gateway", "REST / HTTP API"],
                        ["CI/CD Pipeline", "GitHub Actions"],
                        ["Auth Standard", "OIDC Secure"],
                        ["Template Spec", "CloudFormation"],
                      ].map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/60 px-4 py-3">
                          <span className="text-xs font-medium text-neutral-500">{key}</span>
                          <span className="text-xs font-bold text-neutral-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>

              </div>
            </Card>
          </div>

        </div>
      </section>

      {/* =========================================================
          TECHNOLOGY STRIP
      ========================================================= */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-6 px-6 py-6 text-xs font-bold text-neutral-400 tracking-wider uppercase">
          <span className="flex items-center gap-2"><GitHubLogo className="h-4 w-4" /> GitHub</span>
          <span className="flex items-center gap-2"><CloudIcon /> AWS Cloud</span>
          <span className="flex items-center gap-2"><TerminalIcon /> Actions OIDC</span>
          <span className="flex items-center gap-2"><ShieldIcon /> Secure IAM</span>
          <span className="flex items-center gap-2"><LayersIcon /> CloudFormation</span>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section id="how-it-works" className="px-6 py-28 md:py-36 bg-[#fafafa]">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-400">
              Workflow Guide
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-5xl">
              Production ready in <span className="text-neutral-400">three clear steps.</span>
            </h2>
            <p className="mt-4 max-w-xl text-base font-normal leading-7 text-neutral-600">
              No manual infrastructure configuration needed. Opsify smoothly automates the pipeline from commit to deployment.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.number} className="group relative overflow-hidden border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-sm font-bold text-neutral-300">{step.number}</span>
                    <div className="text-neutral-400 group-hover:text-neutral-900 transition-colors">
                      {index === 0 && <GitHubLogo />}
                      {index === 1 && <LayersIcon />}
                      {index === 2 && <RocketIcon />}
                    </div>
                  </div>
                  <div className="mt-16">
                    <h3 className="text-xl font-bold text-neutral-900 tracking-tight">{step.title}</h3>
                    <p className="mt-3 text-sm font-normal leading-6 text-neutral-600">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURES SECTION
      ========================================================= */}
      <section id="features" className="border-y border-neutral-200 bg-white px-6 py-28 md:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-400">
                Core Capabilities
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-5xl">
                Advanced DevOps,<br />
                <span className="text-neutral-400">without the configuration overhead.</span>
              </h2>
            </div>
            <p className="max-w-md text-base font-normal leading-7 text-neutral-600">
              Opsify handles standard maintenance automation while maintaining complete visibility and control over your configuration files.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={feature.title} className="group border-neutral-200 bg-[#fafafa]/50 shadow-none transition-all duration-300 hover:bg-white hover:shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-neutral-400">{feature.number}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 shadow-sm group-hover:text-neutral-900 group-hover:border-neutral-300 transition">
                      {index === 0 && <SparkleIcon />}
                      {index === 1 && <ShieldIcon />}
                      {index === 2 && <RocketIcon />}
                      {index === 3 && <TerminalIcon />}
                      {index === 4 && <CloudIcon />}
                      {index === 5 && <SparkleIcon />}
                    </div>
                  </div>
                  <h3 className="mt-10 text-lg font-bold text-neutral-900 tracking-tight">{feature.title}</h3>
                  <p className="mt-3 text-sm font-normal leading-6 text-neutral-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CALL TO ACTION
      ========================================================= */}
      <section id="get-started" className="px-6 py-28 md:py-36 bg-[#fafafa]">
        <Card className="relative mx-auto max-w-5xl overflow-hidden border-neutral-200 bg-neutral-900 text-white shadow-2xl">
          
          {/* Subtle Glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.05] blur-3xl" />

          <CardContent className="relative px-6 py-20 text-center md:px-16 md:py-28">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-neutral-900 shadow">
              <ZapIcon />
            </div>

            <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
              Stop configuring manual infrastructure.<br />
              <span className="text-neutral-400">Start shipping production apps.</span>
            </h2>

            <p className="mx-auto mt-6 max-w-lg text-sm font-normal leading-6 text-neutral-400 md:text-base">
              Connect your repository today and let Opsify automate your delivery workflows seamlessly.
            </p>

            <Button
              asChild
              size="lg"
              className="mt-8 h-12 rounded-xl bg-white px-8 font-bold text-neutral-900 hover:bg-neutral-100 shadow transition-all"
            >
              <a href="#">
                Get started with Opsify
                <span className="ml-2"><ArrowRight /></span>
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-neutral-200 bg-white px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 py-8 text-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <ZapIcon />
            </div>
            <div>
              <p className="font-bold text-neutral-900">Opsify</p>
              <p className="text-[11px] text-neutral-400">Deploy smarter. Ship faster.</p>
            </div>
          </div>
          <div className="text-xs font-medium text-neutral-400">
            © {new Date().getFullYear()} Opsify Inc. Built for professional developers.
          </div>
        </div>
      </footer>
    </main>
  );
}