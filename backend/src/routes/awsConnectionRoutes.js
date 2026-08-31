import express from "express";
import { createAWSConnection, awsConnectionCallback } from "../controllers/awsConnectionController.js";

const router = express.Router();

router.post("/connections", createAWSConnection);
router.post("/connections/callback", awsConnectionCallback);

export default router;