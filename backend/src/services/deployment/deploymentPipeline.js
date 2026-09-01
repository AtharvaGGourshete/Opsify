import { cloneRepository, cleanupRepository } from "../repository/clone.js";
import { buildContainerImage } from "./containerBuilder.js";
import { pushContainerImage } from "./ecrService.js";
import { executeTerraformDeployment } from "./terraformExecutor.js";

export async function deployRepository({
    repositoryUrl,
    projectName,
    applicationDirectory,
    containerPort,
    awsRegion = "ap-south-1",
    desiredCount = 1
}) {
    if (!repositoryUrl) throw new Error("Repository URL is required.");
    if (!projectName) throw new Error("Project name is required.");
    if (!applicationDirectory) throw new Error("Application directory is required.");
    if (!containerPort) throw new Error("Container port is required.");

    let repositoryPath = null;
    const imageTag = "deployment-test";

    try {
        repositoryPath = await cloneRepository(repositoryUrl);
        console.log(`Repository cloned to: ${repositoryPath}`);

        const containerResult = await buildContainerImage({
            repositoryPath,
            applicationDirectory,
            imageTag: `${projectName}:${imageTag}`
        });
        console.log("Container build successful:", containerResult);

        const ecrResult = await pushContainerImage({
            localImageTag: containerResult.imageTag,
            repositoryName: projectName,
            region: awsRegion,
            imageTag
        });
        console.log("ECR push successful:", ecrResult);

        const terraformResult = await executeTerraformDeployment({
            projectName,
            containerImage: ecrResult.imageUri,
            ecrRepositoryArn: ecrResult.repositoryArn,
            containerPort,
            awsRegion,
            desiredCount
        });
        console.log("Terraform deployment successful:", terraformResult);

        const dnsName = terraformResult.outputs.load_balancer_dns_name;

        return {
            projectName,
            repositoryUrl,
            applicationDirectory,
            containerPort,
            containerImage: ecrResult.imageUri,
            outputs: terraformResult.outputs,
            liveUrl: dnsName ? `http://${dnsName}` : null
        };
    } finally {
        await cleanupRepository(repositoryPath);
    }
}