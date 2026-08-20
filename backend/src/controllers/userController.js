import sql from "../config/database.js";

export const loginViaGithub = async (req, res) => {
  try {
    const { github_user_id, github_username, github_email } = req.body;

    // Validate required fields
    if (!github_user_id || !github_username || !github_email) {
      return res.status(400).json({
        success: false,
        message: "GitHub user ID, username and email are required",
      });
    }

    const result = await sql`
      INSERT INTO public.aws_connections (
        github_user_id,
        github_username,
        github_email
      )
      VALUES (
        ${github_user_id},
        ${github_username},
        ${github_email}
      )
      ON CONFLICT (github_user_id)
      DO UPDATE SET
        github_username = EXCLUDED.github_username,
        github_email = EXCLUDED.github_email,
        updated_at = now()
      RETURNING *;
    `;

    return res.status(200).json({
      success: true,
      message: "GitHub user connected successfully",
      connection: result[0],
    });
  } catch (error) {
    console.error("GitHub login error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save GitHub user",
    });
  }
};

export const userAWSDetails = async (req, res) => {
  try {
    const {
      github_user_id,

      // AWS connection details
      aws_account_id,
      aws_region,
      role_name,
      role_arn,
      status,
      bootstrap_stack_name,

      // Deployment details
      stack_name,
      stack_id,
      stack_status,
      deployment_url,
    } = req.body;

    // -----------------------------------------
    // Validation
    // -----------------------------------------

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

    // -----------------------------------------
    // 1. Update AWS connection
    // -----------------------------------------

    const connectionResult = await sql`
      UPDATE public.aws_connections
      SET
        aws_account_id = ${aws_account_id},
        aws_region = ${aws_region || "ap-south-1"},
        role_name = ${role_name || null},
        role_arn = ${role_arn},
        status = ${status || "connected"},
        bootstrap_stack_name = ${bootstrap_stack_name || null},
        updated_at = now()
      WHERE github_user_id = ${github_user_id}
      RETURNING *;
    `;

    if (connectionResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "GitHub user connection not found",
      });
    }

    const connection = connectionResult[0];

    // -----------------------------------------
    // 2. Store deployment information
    // -----------------------------------------

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

      deployment = deploymentResult[0];
    }

    // -----------------------------------------
    // 3. Return result
    // -----------------------------------------

    return res.status(200).json({
      success: true,
      message: "AWS details updated successfully",
      connection,
      deployment,
    });

  } catch (error) {
    console.error("AWS details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update AWS details",
      error: error.message,
    });
  }
};
