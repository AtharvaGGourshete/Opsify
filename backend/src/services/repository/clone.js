import { simpleGit } from "simple-git";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";

export async function cloneRepository(repoUrl) {
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "opsify-repo-")
  );

  const repoPath = path.join(tempRoot, randomUUID());

  try {
    const git = simpleGit();

    await git.clone(repoUrl, repoPath, ["--depth", "1"]);

    return repoPath;
  } catch (error) {
    await fs.rm(tempRoot, {
      recursive: true,
      force: true,
    });

    throw new Error(`Failed to clone repository: ${error.message}`);
  }
}

export async function cleanupRepository(repoPath) {
  if (!repoPath) return;

  const tempRoot = path.dirname(repoPath);

  await fs.rm(tempRoot, {
    recursive: true,
    force: true,
  });
}