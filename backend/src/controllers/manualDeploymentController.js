import { createManualDeploymentGuide } from "../services/manualDeploymentService.js";

export async function generateManualDeploymentGuide (req, res) {
    try {
        const {
            github_user_id,
            github_owner,
            github_repository,
            github_branch = "main",
            repository_context = {},
        } = req.body;

        const result = await createManualDeploymentGuide({
            github_user_id,
            github_owner,
            github_repository,
            github_branch,
            repository_context,
        });

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Manual deployment guide error:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to generate manual deployment guide.",
        });
    }
}