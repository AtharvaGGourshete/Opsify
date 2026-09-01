import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function runDockerBuild({
  applicationPath,
  imageTag
}) {
  return new Promise((resolve, reject) => {
    const docker = spawn(
      "docker",
      [
        "build",
        "--provenance=false",
        "--platform",
        "linux/amd64",
        "-t",
        imageTag,
        applicationPath
      ],
      {
        stdio: "inherit",
        shell: false
      }
    );

    docker.on("error", (error) => {
      reject(
        new Error(
          `Failed to start Docker: ${error.message}`
        )
      );
    });

    docker.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(`Docker build failed with exit code ${code}.`)
      );
    });
  });
}

export async function buildContainerImage({ repositoryPath, applicationDirectory, imageTag }) {

  if (!repositoryPath) {
    throw new Error("Repository path is required.");
  }

  if (!applicationDirectory) {
    throw new Error("Application directory is required.");
  }

  if (!imageTag) {
    throw new Error("Docker image tag is required.");
  }

  const applicationPath = path.resolve(repositoryPath, applicationDirectory);

  const dockerfilePath = path.join(applicationPath, "Dockerfile");

  const applicationExists = await fileExists(applicationPath);

  if (!applicationExists) {
    throw new Error(`Application directory does not exist: ${applicationDirectory}`);
  }

  const dockerfileExists = await fileExists(dockerfilePath);

  if (!dockerfileExists) {
    throw new Error(`Dockerfile not found in application directory: ${applicationDirectory}`);
  }

  console.log(`Building Docker image: ${imageTag}`);

  console.log(`Docker build context: ${applicationPath}`);

  await runDockerBuild({ applicationPath, imageTag });

  return {
    imageTag,
    applicationDirectory,
    dockerfile: "Dockerfile",
    buildContext: applicationDirectory
  };
}