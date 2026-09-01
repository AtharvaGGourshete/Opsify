import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TERRAFORM_TEMPLATE_PATH = path.resolve(__dirname, "../../../deployment/terraform/template");
const TERRAFORM_WORKSPACE_ROOT = path.resolve(__dirname, "../../../deployment/terraform/workspaces");

function runTerraform(args, workingDirectory) {
  return new Promise((resolve, reject) => {
    const terraform = spawn("terraform", args, { cwd: workingDirectory, stdio: "inherit", shell: false });
    terraform.on("error", (error) => reject(new Error(`Failed to start Terraform: ${error.message}`)));
    terraform.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Terraform command failed with exit code ${code}.`));
    });
  });
}

async function prepareTerraformWorkspace(workspacePath) {
  await fs.mkdir(workspacePath, { recursive: true });
  await fs.cp(TERRAFORM_TEMPLATE_PATH, workspacePath, { recursive: true, force: true });
}

async function readTerraformOutput(workspacePath, outputName) {
  return new Promise((resolve, reject) => {
    const terraform = spawn("terraform", ["output", "-raw", outputName], { cwd: workspacePath, stdio: ["ignore", "pipe", "pipe"], shell: false });
    let stdout = "";
    let stderr = "";
    terraform.stdout.on("data", (data) => { stdout += data.toString(); });
    terraform.stderr.on("data", (data) => { stderr += data.toString(); });
    terraform.on("error", (error) => { reject(error); });
    terraform.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Failed to read Terraform output "${outputName}": ${stderr.trim() || `exit code ${code}`}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function getTerraformOutputs(workspacePath) {
  const outputs = {};
  const outputNames = ["ecr_repository_url", "ecs_cluster_name", "ecs_service_name", "ecs_task_definition_arn", "load_balancer_dns_name", "cloudwatch_log_group_name", "vpc_id"];
  for (const outputName of outputNames) {
    try {
      outputs[outputName] = await readTerraformOutput(workspacePath, outputName);
    } catch {
      outputs[outputName] = null;
    }
  }
  return outputs;
}

export async function executeTerraformDeployment({ projectName, containerImage, containerPort, awsRegion, ecrRepositoryArn, desiredCount = 1 }) {
  if (!projectName) throw new Error("Project name is required.");
  if (!containerImage) throw new Error("Container image is required.");
  if (!containerPort) throw new Error("Container port is required.");
  if (!awsRegion) throw new Error("AWS region is required.");
  if (!ecrRepositoryArn) throw new Error("ECR repository ARN is required.");
  if (!Number.isInteger(Number(containerPort)) || Number(containerPort) <= 0) throw new Error("Container port must be a valid positive integer.");
  if (!Number.isInteger(Number(desiredCount)) || Number(desiredCount) < 0) throw new Error("Desired count must be a non-negative integer.");
  const workspacePath = path.join(TERRAFORM_WORKSPACE_ROOT, projectName);
  try {
    await prepareTerraformWorkspace(workspacePath);
    await runTerraform(["init", "-input=false"], workspacePath);
    await runTerraform(["apply", "-auto-approve", "-input=false", `-var=project_name=${projectName}`, `-var=container_image=${containerImage}`, `-var=container_port=${containerPort}`, `-var=aws_region=${awsRegion}`, `-var=ecr_repository_arn=${ecrRepositoryArn}`, `-var=desired_count=${desiredCount}`], workspacePath);
    const outputs = await getTerraformOutputs(workspacePath);
    return { projectName, containerImage, containerPort: Number(containerPort), awsRegion, ecrRepositoryArn, desiredCount: Number(desiredCount), workspacePath, outputs };
  } catch (error) {
    throw error;
  }
}