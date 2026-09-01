import sql from "../config/database.js";

export const loginViaGithub = async (req, res) => {
  try {
    const { github_user_id, github_username, github_email } = req.body;

    console.log("GitHub user sync received:", {github_user_id, github_username, github_email});

    if (!github_user_id) {
      return res.status(400).json({
        success: false,
        message: "GitHub user ID is required",
      });
    }

    if (!github_username) {
      return res.status(400).json({
        success: false,
        message: "GitHub username is required",
      });
    }

    const result = await sql`
      INSERT INTO public.aws_connections (
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
        ${String(github_user_id)},
        ${github_username},
        ${github_email || null},
        NULL,
        NULL,
        NULL,
        NULL,
        'pending',
        NULL,
        now(),
        now()
      )

      ON CONFLICT (github_user_id)

      DO UPDATE SET
        github_username = EXCLUDED.github_username,
        github_email = EXCLUDED.github_email,
        updated_at = now()

      RETURNING *;
    `;

    if (result.length === 0) {
      throw new Error(
        "GitHub user could not be registered"
      );
    }

    console.log("GitHub user synchronized successfully:", result[0]);

    return res.status(200).json({
      success: true,
      message: "GitHub user connected successfully",
      connection: result[0],
    });

  } catch (error) {
    console.error("GitHub login error:",error);

    return res.status(500).json({
      success: false,
      message: "Failed to save GitHub user",
      error: error.message || "Internal server error",
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { github_user_id } = req.params;

    if (!github_user_id) {
      return res.status(400).json({
        success: false,
        message: "GitHub user ID is required",
      });
    }

    const result = await sql`
      SELECT
        id,
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
        updated_at,
        connection_id
      FROM public.aws_connections
      WHERE github_user_id = ${String(github_user_id)}
      LIMIT 1;
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile: result[0],
    });
  } catch (error) {
    console.error("Get user profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

export const userAWSDetails = async (req, res) => {
  try {
    const {
      github_user_id,
      aws_account_id,
      aws_region,
      role_name,
      role_arn,
      status,
      bootstrap_stack_name,
      stack_name,
      stack_id,
      stack_status,
      deployment_url,
    } = req.body;

    console.log("AWS details received:", req.body);

    if (!github_user_id) {
      return res.status(400).json({
        success: false,
        message: "GitHub user ID is required",
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

    const connectionResult = await sql`
      UPDATE public.aws_connections
      SET
        aws_account_id = ${String(aws_account_id)},
        aws_region = ${aws_region || "ap-south-1"},
        role_name = ${role_name || null},
        role_arn = ${role_arn},
        status = ${status || "connected"},
        bootstrap_stack_name = ${bootstrap_stack_name || null},
        updated_at = now()

      WHERE github_user_id = ${String(github_user_id)}

      RETURNING *;
    `;

    if (connectionResult.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "GitHub user connection not found",
      });
    }

    const connection =
      connectionResult[0];

    console.log(
      "AWS connection updated:",
      connection
    );

    let deployment = null;

    if (stack_name) {
      const deploymentResult = await sql`
        INSERT INTO public.deployments (
          aws_connection_id,
          stack_name,
          stack_id,
          stack_status,
          deployment_url,
          created_at,
          updated_at
        )
        VALUES (
          ${connection.id},
          ${stack_name},
          ${stack_id || null},
          ${stack_status || null},
          ${deployment_url || null},
          now(),
          now()
        )
        RETURNING *;
      `;

      deployment =
        deploymentResult[0];

      console.log(
        "Deployment information stored:",
        deployment
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "AWS details updated successfully",
      connection,
      deployment,
    });

  } catch (error) {
    console.error(
      "AWS details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update AWS details",
      error:
        error.message ||
        "Internal server error",
    });
  }
};