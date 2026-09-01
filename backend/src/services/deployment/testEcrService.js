import { pushContainerImage } from "./ecrService.js";

const projectName = "opsify-auto-test";
const region = "ap-south-1";
const imageTag = "deployment-test";

try {
  const result = await pushContainerImage({ localImageTag: `${projectName}:${imageTag}`, repositoryName: projectName, region, imageTag });
  console.log("\nECR push successful:", result);
} catch (error) {
  console.error("\nECR push failed:", error.message);
  process.exitCode = 1;
}