import {
  executeTerraformDeployment
} from "./terraformExecutor.js";

try {
  const result =
    await executeTerraformDeployment({
      projectName: "opsify-auto-test",

      containerImage:
        "862205457196.dkr.ecr.ap-south-1.amazonaws.com/opsify-test-app:deployment-test",

      containerPort: 7000,

      awsRegion: "ap-south-1",

      desiredCount: 1
    });

  console.log(
    "\nTerraform deployment successful:"
  );

  console.dir(
    result,
    {
      depth: null
    }
  );
} catch (error) {
  console.error(
    "\nTerraform deployment failed:"
  );

  console.error(error.message);

  process.exitCode = 1;
}