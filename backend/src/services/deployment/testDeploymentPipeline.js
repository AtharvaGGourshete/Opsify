import { deployRepository } from "./deploymentPipeline.js";

try {
  const result = await deployRepository({ repositoryUrl: "https://github.com/AtharvaGGourshete/Opsify", projectName: "opsify-auto-test", applicationDirectory: "backend/deployment/terraform/test-app", containerPort: 7000, awsRegion: "ap-south-1", desiredCount: 1 });
  console.log("\n================================");
  console.log("DEPLOYMENT SUCCESSFUL");
  console.log("================================");
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error("\n================================");
  console.error("DEPLOYMENT FAILED");
  console.error("================================");
  console.error(error);
  process.exitCode = 1;
}