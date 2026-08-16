const FRONTEND_FRAMEWORKS = new Set([
  "Next.js",
  "React",
  "Angular",
  "Vue",
  "Nuxt",
  "Svelte"
]);

const BACKEND_FRAMEWORKS = new Set([
  "Express",
  "NestJS",
  "Fastify",
  "Hono"
]);

export function detectApplications(frameworks, packageData) {
  const applications = [];

  for (const pkg of packageData) {
    const directory = getDirectory(pkg.path);

    const appFrameworks = frameworks.filter(
      (framework) => framework.directory === directory
    );

    const frontendFramework = appFrameworks.find(
      (framework) => FRONTEND_FRAMEWORKS.has(framework.framework)
    );

    const backendFramework = appFrameworks.find(
      (framework) => BACKEND_FRAMEWORKS.has(framework.framework)
    );

    if (frontendFramework) {
      applications.push({
        name: directory === "." ? "root" : directory,
        directory,
        type: "frontend",
        framework: frontendFramework.framework,
        packageManager: pkg.packageManager,
        runtime: "Node.js"
      });

      continue;
    }

    if (backendFramework) {
      applications.push({
        name: directory === "." ? "root" : directory,
        directory,
        type: "backend",
        framework: backendFramework.framework,
        packageManager: pkg.packageManager,
        runtime: "Node.js"
      });
    }
  }

  return applications;
}

function getDirectory(packagePath) {
  const normalized = packagePath.replace(/\\/g, "/");
  const parts = normalized.split("/");

  parts.pop();

  return parts.length > 0 ? parts.join("/") : ".";
}