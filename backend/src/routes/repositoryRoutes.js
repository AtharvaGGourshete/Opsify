import express from "express";
import { analyzeRepository, createDeploymentPlan, getLatestRepositoryAnalysisController } from "../controllers/repositoryController.js";

const router = express.Router();

router.post("/analyze", analyzeRepository);
router.post("/deployment-plan", createDeploymentPlan);
router.get("/latest", getLatestRepositoryAnalysisController);

export default router;