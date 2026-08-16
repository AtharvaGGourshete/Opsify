import fs from "fs/promises";
import path from "path";

export async function findPackageFiles(repoPath, files) {
  const packageFiles = files.filter(
    (file) => path.basename(file.path) === "package.json"
  );

  const results = [];

  for (const file of packageFiles) {
    const absolutePath = path.join(repoPath, file.path);

    try {
      const content = await fs.readFile(absolutePath, "utf8");
      const packageJson = JSON.parse(content);

      results.push({
        path: file.path,
        name: packageJson.name || null,
        version: packageJson.version || null,
        packageManager: await detectPackageManager(repoPath, file.path),
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
        scripts: packageJson.scripts || {}
      });
    } catch (error) {
      results.push({
        path: file.path,
        error: `Could not parse package.json: ${error.message}`
      });
    }
  }

  return results;
}

async function detectPackageManager(repoPath, packageJsonPath) {
  const directory = path.dirname(path.join(repoPath, packageJsonPath));

  try {
    const files = await fs.readdir(directory);

    if (files.includes("pnpm-lock.yaml")) return "pnpm";
    if (files.includes("yarn.lock")) return "yarn";
    if (files.includes("bun.lockb") || files.includes("bun.lock")) {
      return "bun";
    }
    if (files.includes("package-lock.json")) return "npm";

    return "unknown";
  } catch {
    return "unknown";
  }
}