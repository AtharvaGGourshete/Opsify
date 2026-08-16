const FRAMEWORK_RULES = [
  {
    name: "Next.js",
    dependencies: ["next"],
    category: "frontend",
    confidence: 1.0
  },
  {
    name: "React",
    dependencies: ["react"],
    category: "frontend",
    confidence: 0.95
  },
  {
    name: "Angular",
    dependencies: ["@angular/core"],
    category: "frontend",
    confidence: 1.0
  },
  {
    name: "Vue",
    dependencies: ["vue"],
    category: "frontend",
    confidence: 0.95
  },
  {
    name: "Nuxt",
    dependencies: ["nuxt"],
    category: "frontend",
    confidence: 1.0
  },
  {
    name: "Svelte",
    dependencies: ["svelte"],
    category: "frontend",
    confidence: 0.95
  },
  {
    name: "Express",
    dependencies: ["express"],
    category: "backend",
    confidence: 1.0
  },
  {
    name: "NestJS",
    dependencies: ["@nestjs/core"],
    category: "backend",
    confidence: 1.0
  },
  {
    name: "Fastify",
    dependencies: ["fastify"],
    category: "backend",
    confidence: 1.0
  },
  {
    name: "Hono",
    dependencies: ["hono"],
    category: "backend",
    confidence: 1.0
  }
];

export function detectJavaScriptFrameworks(packageData) {
  const detected = [];

  for (const pkg of packageData) {
    const allDependencies = new Set([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {})
    ]);

    for (const rule of FRAMEWORK_RULES) {
      const matchedDependencies = rule.dependencies.filter(
        (dependency) => allDependencies.has(dependency)
      );

      if (matchedDependencies.length === 0) {
        continue;
      }

      detected.push({
        directory: getDirectory(pkg.path),
        framework: rule.name,
        category: rule.category,
        confidence: rule.confidence,
        evidence: matchedDependencies.map((dependency) => ({
          source: pkg.path,
          reason: `${dependency} dependency detected`
        }))
      });
    }
  }

  return detected;
}

function getDirectory(packagePath) {
  const normalized = packagePath.replace(/\\/g, "/");
  const parts = normalized.split("/");

  parts.pop();

  return parts.length > 0 ? parts.join("/") : ".";
}