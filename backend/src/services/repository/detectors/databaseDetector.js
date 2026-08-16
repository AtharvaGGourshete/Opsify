const DATABASE_RULES = [
  {
    name: "PostgreSQL",
    dependencies: [
      "pg",
      "postgres",
      "postgresql"
    ]
  },
  {
    name: "MySQL",
    dependencies: [
      "mysql",
      "mysql2"
    ]
  },
  {
    name: "MongoDB",
    dependencies: [
      "mongodb",
      "mongoose"
    ]
  },
  {
    name: "Redis",
    dependencies: [
      "redis",
      "ioredis"
    ]
  },
  {
    name: "SQLite",
    dependencies: [
      "sqlite3",
      "better-sqlite3"
    ]
  }
];

export function detectDatabases(packageData) {
  const detected = [];

  for (const pkg of packageData) {
    const dependencies = new Set([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {})
    ]);

    for (const rule of DATABASE_RULES) {
      const evidence = rule.dependencies.filter(
        (dependency) => dependencies.has(dependency)
      );

      if (evidence.length === 0) continue;

      detected.push({
        name: rule.name,
        directory: getDirectory(pkg.path),
        confidence: 0.95,
        evidence: evidence.map((dependency) => ({
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