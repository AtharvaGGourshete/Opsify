import sql from "../config/database.js";
import { randomUUID } from "crypto";

const AWS_CONSOLE_URL = "https://console.aws.amazon.com/cloudformation/home#/stacks/create/review";

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
    "param_ConnectionId": connectionId,
    "param_GitHubBranch": github_branch,
    "param_GitHubOwner": github_owner,
    "param_GitHubRepository": github_repository,
    "param_GitHubUserId": github_user_id,
    "param_OpsifyCallbackUrl": callbackUrl,
  });

  return `https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?templateURL=${encodeURIComponent(
    templateUrl
  )}&stackName=${encodeURIComponent(stackName)}&${params.toString()}`;
}

export const createAWSConnection = async (req, res) => {
  try {
    const {
      github_user_id,
      github_owner,
      github_repository,
      github_branch = "main",
    } = req.body;

    if (!github_user_id) {
      return res.status(400).json({
        success: false,
        message: "GitHub user ID is required",
      });
    }

    if (!github_owner) {
      return res.status(400).json({
        success: false,
        message: "GitHub repository owner is required",
      });
    }

    if (!github_repository) {
      return res.status(400).json({
        success: false,
        message: "GitHub repository is required",
      });
    }

    const templateUrl = getRequiredEnv("AWS_BOOTSTRAP_URL");

    const apiUrl = getRequiredEnv("OPSIFY_API_URL");

    const callbackUrl = `${apiUrl.replace(/\/$/, "")}/api/aws/connections/callback`;

    const existingResult = await sql`
      SELECT *
      FROM public.aws_connections
      WHERE github_user_id = ${String(github_user_id)}
      LIMIT 1;
    `;

    const existing = existingResult[0];

    if (existing && existing.status === "connected" && existing.aws_account_id && existing.role_arn) {
      console.log("AWS connection already connected. Reusing existing connection:",existing.connection_id);

      return res.status(200).json({
        success: true,
        alreadyConnected: true,

        connectionId:
          existing.connection_id,

        stackName:
          existing.bootstrap_stack_name,

        launchUrl: null,

        status: "connected",

        connection: existing,
      });
    }
    if (existing && existing.status === "pending" && existing.connection_id && existing.bootstrap_stack_name) {

      const launchUrl = buildLaunchUrl({
          templateUrl,

          stackName:
            existing.bootstrap_stack_name,

          connectionId:
            existing.connection_id,

          github_user_id,

          github_owner,

          github_repository,

          github_branch,

          callbackUrl,
        });

      return res.status(200).json({
        success: true,
        alreadyConnected: false,

        connectionId:
          existing.connection_id,

        stackName:
          existing.bootstrap_stack_name,

        launchUrl,

        status: "pending",

        connection: existing,
      });
    }

    const connectionId = randomUUID();

    const stackName = `OpsifyBootstrap-${connectionId}`;

    if (!existing) {
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
        VALUES (
          ${connectionId},
          ${String(github_user_id)},
          NULL,
          NULL,
          NULL,
          'ap-south-1',
          NULL,
          NULL,
          'pending',
          ${stackName},
          now(),
          now()
        )
        RETURNING *;
      `;

      if (result.length === 0) {
        throw new Error(
          "AWS connection could not be created"
        );
      }

      const connection = result[0];

      const launchUrl =
        buildLaunchUrl({
          templateUrl,
          stackName,
          connectionId,
          github_user_id,
          github_owner,
          github_repository,
          github_branch,
          callbackUrl,
        });

      console.log(
        "AWS connection created successfully:",
        connection
      );

      return res.status(200).json({
        success: true,
        alreadyConnected: false,

        connectionId,
        stackName,
        launchUrl,

        status: "pending",

        connection,
      });
    }

    const result = await sql`
      UPDATE public.aws_connections
      SET
        connection_id = ${connectionId},

        aws_account_id = NULL,

        aws_region = 'ap-south-1',

        role_name = NULL,

        role_arn = NULL,

        status = 'pending',

        bootstrap_stack_name = ${stackName},

        updated_at = now()

      WHERE github_user_id = ${String(github_user_id)}

      RETURNING *;
    `;

    if (result.length === 0) {
      throw new Error("AWS connection could not be initialized");
    }

    const connection = result[0];

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

    console.log("Existing AWS connection reset for new bootstrap:", connection);

    return res.status(200).json({
      success: true,
      alreadyConnected: false,

      connectionId,
      stackName,
      launchUrl,

      status: "pending",

      connection,
    });

  } catch (error) {
    console.error(
      "AWS connection creation failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create AWS connection",
      error:
        error.message ||
        "Internal server error",
    });
  }
};

export const awsConnectionCallback = async (req, res) => {
  try {
    console.log("AWS connection callback received:", req.body);

    const {
      connection_id,
      github_user_id,
      aws_account_id,
      aws_region,
      role_name,
      role_arn,
      status,
      bootstrap_stack_name,
    } = req.body;

    if (!connection_id) {
      return res.status(400).json({
        success: false,
        message: "Connection ID is required",
      });
    }

    if (!aws_account_id) {
      return res.status(400).json({
        success: false,
        message: "AWS account ID is required",
      });
    }

    if (!role_arn) {
      return res.status(400).json({
        success: false,
        message: "AWS role ARN is required",
      });
    }

    const result = await sql`
      UPDATE public.aws_connections
      SET
        aws_account_id = ${String(aws_account_id)},
        aws_region = ${aws_region || "ap-south-1"},
        role_name = ${role_name || null},
        role_arn = ${role_arn},
        status = ${status || "connected"},
        bootstrap_stack_name = ${bootstrap_stack_name || null},
        updated_at = now()

      WHERE connection_id = ${String(connection_id)}

      RETURNING *;
    `;

    if (result.length === 0) {
      console.error("AWS callback could not find connection:",{connection_id, github_user_id,});

      return res.status(404).json({
        success: false,
        message: "AWS connection not found",
      });
    }

    const connection = result[0];

    console.log("AWS connection successfully updated:",connection);

    return res.status(200).json({
      success: true,
      message: "AWS connection registered successfully",
      connection,
    });

  } catch (error) {
    console.error(
      "AWS connection callback failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to register AWS connection",
      error: error.message || "Internal server error",
    });
  }
};