import fs from "fs/promises";
import path from "path";

const IGNORED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "coverage",
  "target",
  "venv",
  ".venv",
  "__pycache__",
  ".turbo",
  ".cache",
]);

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".mp3",
  ".mp4",
  ".mov",
  ".avi",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function scanRepository(repoPath) {
  const files = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (
        entry.isDirectory() &&
        IGNORED_DIRECTORIES.has(entry.name)
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const extension = path.extname(entry.name).toLowerCase();

      if (BINARY_EXTENSIONS.has(extension)) {
        continue;
      }

      const stats = await fs.stat(fullPath);

      if (stats.size > MAX_FILE_SIZE) {
        continue;
      }

      const relativePath = path.relative(repoPath, fullPath).split(path.sep).join("/");

      files.push({
        path: relativePath,
        extension: extension || null,
        size: stats.size,
      });
    }
  }

  await walk(repoPath);

  return files;
}