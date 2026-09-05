import sql from "../config/database.js"
import { generateDeploymentGuide } from "./mistralService.js";

function sanitizeRepositoryContext(repositoryContext = {}) {
    const safeContext = {
        ...repositoryContext,
    };

    if (Array.isArray(safeContext.file_tree)) {
        safeContext.file_tree = safeContext.file_tree.slice(0, 500).map((item) => String(item).slice(0, 500));
    }

    if (safeContext.package_json) {
        safeContext.package_json = String(safeContext.package_json).slice(0, 12000);
    }

    if (safeContext.readme) {
        safeContext.readme = String(safeContext.readme).slice(0, 12000);
    }

    if (safeContext.analysis) {
        safeContext.analysis = String(safeContext.analysis).slice(0, 12000);
    }

    return safeContext;
}

export async function createManualDeploymentGuide({
    github_user_id,
    github_owner,
    github_repository,
    github_branch = "main",
    repositoryContext = {},
}) {
    if (!github_user_id) {
        const error = new Error("Github user id is required.");
        error.statusCode = 400;
        throw error;
    }

    if (!github_owner || !github_repository) {
        const error = new Error("Github repository information is required.");
        error.statusCode = 400;
        throw error;
    }

    const connections = await sql`
    SELECT
      github_user_id,
      github_username,
      aws_account_id,
      aws_region,
      role_name,
      role_arn,
      status,
      bootstrap_stack_name
    FROM public.aws_connections
    WHERE github_user_id = ${String(github_user_id)}
    LIMIT 1;
  `;

    const connection = connections[0];

    if (!connection) {
        const error = new Error("Connect your AWS account before generating a manual deployment guide.");
        error.statusCode = 409;
        throw error;
    }

    if (connection.status !== "connected") {
        const error = new Error("Connect your AWS account before generating a manual deployment guide.");
        error.statusCode = 409;
        throw error;
    }

    const deploymentContext = {
        deployment_mode: "manual",
        cloud_provider: "AWS",
        github: {
            owner: github_owner,
            repository: github_repository,
            branch: github_branch,
        },
        aws: {
            account_id: connection.aws_account_id,
            region: connection.aws_region,
            connection_status: connection.status,
            deployment_role_available: Boolean(connection.role_arn),
        },

        repository: sanitizeRepositoryContext(repositoryContext),
    };

    const { guide, model } = await generateDeploymentGuide(deploymentContext);

    return {
        guide,
        metadata: {
            model,
            generated_at: new Date().toString(),
            repository: `${github_owner}/${github_repository}`,
            branch: github_branch,
            aws_region: connection.aws_region,
        },
    };
}