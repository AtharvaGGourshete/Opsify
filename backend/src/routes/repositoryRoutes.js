import express from "express";
import { analyzeRepository, createDeploymentPlan } from "../controllers/repositoryController.js";

const router = express.Router();

router.post("/analyze", analyzeRepository);
router.post("/deployment-plan", createDeploymentPlan);

export default router;