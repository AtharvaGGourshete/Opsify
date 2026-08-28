import {
  pushContainerImage
} from "./ecrService.js";

const projectName =
  "opsify-auto-test";

const region =
  "ap-south-1";

const imageTag =
  "deployment-test";

try {
  const result =
    await pushContainerImage({
      localImageTag:
        `${projectName}:${imageTag}`,

      repositoryName:
        projectName,

      region,

      imageTag
    });

  console.log("\nECR push successful:");
  console.log(result);

} catch (error) {
  console.error("\nECR push failed:");
  console.error(error.message);

  process.exitCode = 1;
}