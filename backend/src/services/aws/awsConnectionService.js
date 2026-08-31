import crypto from "crypto";
import sql from "../../config/database.js";

const AWS_CONSOLE_URL =
  "https://console.aws.amazon.com/cloudformation/home#/stacks/create/review";

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function buildLaunchUrl({
  templateUrl,
  stackName,
  connectionId,
  github_user_id,
  github_owner,
  github_repository,
  github_branch,
  callbackUrl,
}) {
  const params = new URLSearchParams({
    templateURL: templateUrl,
    stackName,
    param_ConnectionId: connectionId,
    param_github_user_id: String(github_user_id),
    param_github_owner: github_owner,
    param_github_repository: github_repository,
    param_github_branch: github_branch || "main",
    param_OpsifyCallbackUrl: callbackUrl,
  });

  return `${AWS_CONSOLE_URL}?${params.toString()}`;
}


/*
 * =========================================================
 * CREATE / REUSE AWS CONNECTION
 * =========================================================
 */

export async function createAWSConnection({
  github_user_id,
  github_owner,
  github_repository,
  github_branch = "main",
}) {
  if (!github_user_id) {
    throw new Error("GitHub user ID is required");
  }

  if (!github_owner) {
    throw new Error("GitHub repository owner is required");
  }

  if (!github_repository) {
    throw new Error("GitHub repository is required");
  }

  if (!github_branch) {
    throw new Error("GitHub branch is required");
  }

  const templateUrl = getRequiredEnv("AWS_BOOTSTRAP_URL");
  const apiUrl = getRequiredEnv("OPSIFY_API_URL");

  const callbackUrl =
  `${apiUrl.replace(/\/$/, "")}/api/aws/connections/callback`;

  /*
   * -------------------------------------------------------
   * Check existing AWS connection FIRST
   * -------------------------------------------------------
   */

  const existingResult = await sql`
    SELECT *
    FROM public.aws_connections
    WHERE github_user_id = ${String(github_user_id)}
    LIMIT 1;
  `;

  if (existingResult.length > 0) {
    const existing = existingResult[0];

    /*
     * AWS is already connected.
     * NEVER reset it to pending.
     */

    if (
      existing.status === "connected" &&
      existing.connection_id &&
      existing.role_arn
    ) {
      console.log(
        "AWS connection already connected. Reusing existing connection:",
        existing.connection_id
      );

      return {
        connection: existing,
        connectionId: existing.connection_id,
        stackName: existing.bootstrap_stack_name,
        callbackUrl,
        launchUrl: null,
        status: "connected",
      };
    }

    /*
     * Bootstrap is already pending.
     * Reuse the existing connection instead of generating
     * another UUID and resetting the database.
     */

    if (
      existing.status === "pending" &&
      existing.connection_id &&
      existing.bootstrap_stack_name
    ) {
      console.log(
        "AWS connection already pending. Reusing:",
        existing.connection_id
      );

      const launchUrl = buildLaunchUrl({
        templateUrl,
        stackName: existing.bootstrap_stack_name,
        connectionId: existing.connection_id,
        github_user_id,
        github_owner,
        github_repository,
        github_branch,
        callbackUrl,
      });

      return {
        connection: existing,
        connectionId: existing.connection_id,
        stackName: existing.bootstrap_stack_name,
        callbackUrl,
        launchUrl,
        status: "pending",
      };
    }
  }

  /*
   * -------------------------------------------------------
   * Create a NEW connection
   * -------------------------------------------------------
   */

  const connectionId = crypto.randomUUID();

  const stackName = `OpsifyBootstrap-${connectionId}`;

  console.log("Creating NEW AWS connection:", {
    connectionId,
    stackName,
    github_user_id,
    github_owner,
    github_repository,
    github_branch,
    callbackUrl,
    templateUrl,
  });

  /*
   * IMPORTANT:
   *
   * connection_id is now explicitly stored.
   */

  const result = await sql`
    INSERT INTO public.aws_connections (
      connection_id,
      github_user_id,
      github_username,
      github_email,
      aws_account_id,
      aws_region,
      role_name,
      role_arn,
      status,
      bootstrap_stack_name,
      created_at,
      updated_at
    )
    SELECT
      ${connectionId},
      github_user_id,
      github_username,
      github_email,
      NULL,
      'ap-south-1',
      NULL,
      NULL,
      'pending',
      ${stackName},
      now(),
      now()
    FROM public.aws_connections
    WHERE github_user_id = ${String(github_user_id)}

    ON CONFLICT (github_user_id)

    DO UPDATE SET
      connection_id = EXCLUDED.connection_id,
      aws_account_id = NULL,
      aws_region = 'ap-south-1',
      role_name = NULL,
      role_arn = NULL,
      status = 'pending',
      bootstrap_stack_name = EXCLUDED.bootstrap_stack_name,
      updated_at = now()

    RETURNING *;
  `;

  if (result.length === 0) {
    throw new Error(
      "GitHub user must be registered before connecting AWS"
    );
  }

  const launchUrl = buildLaunchUrl({
    templateUrl,
    stackName,
    connectionId,
    github_user_id,
    github_owner,
    github_repository,
    github_branch,
    callbackUrl,
  });

  return {
    connection: result[0],
    connectionId,
    stackName,
    callbackUrl,
    launchUrl,
    status: "pending",
  };
}