import { runCli } from "repomix";
import fs from "fs/promises";
import path from "path";

export async function generateRepositoryContext(repoPath) {
  const outputFile = path.join(path.dirname(repoPath), "opsify-repomix.json");

  const options = {
    output: outputFile,
    style: "json",
    // compress: true,
    quiet: true,

    ignorePatterns: [
      "**/.git/**",
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**"
    ]
  };

  try {
    const result = await runCli(
      [repoPath],
      process.cwd(),
      options
    );

    if (!result?.packResult) {
      throw new Error(
        "Repomix did not return a pack result."
      );
    }

    const context = await fs.readFile(
      outputFile,
      "utf8"
    );

    await fs.rm(outputFile, {
      force: true
    });

    return {
      success: true,
      context,
      statistics: {
        totalFiles: result.packResult.totalFiles,
        totalCharacters: result.packResult.totalCharacters,
        totalTokens: result.packResult.totalTokens
      }
    };
  } catch (error) {
    await fs.rm(outputFile, {
      force: true
    }).catch(() => {});

    throw new Error(
      `Repomix context generation failed: ${error.message}`
    );
  }
}