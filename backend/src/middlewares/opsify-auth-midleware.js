import crypto from "crypto";

export const opsifyAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is required",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = authHeader.substring(7);

    const expectedToken = process.env.OPSIFY_API_TOKEN;

    if (!expectedToken) {
      console.error("OPSIFY_API_TOKEN is not configured");

      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured",
      });
    }

    const tokenBuffer = Buffer.from(token);
    const expectedBuffer = Buffer.from(expectedToken);

    if (
      tokenBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(tokenBuffer, expectedBuffer)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid API token",
      });
    }

    next();
  } catch (error) {
    console.error("Opsify authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};