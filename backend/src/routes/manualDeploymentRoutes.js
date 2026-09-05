import express from "express";
import { generateManualDeploymentGuide } from "../controllers/manualDeploymentController.js";

const router = express.Router();

router.post("/manual-guide", generateManualDeploymentGuide);

export default router;