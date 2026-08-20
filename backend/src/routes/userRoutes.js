import express from "express";
import {
  loginViaGithub,
  userAWSDetails,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/github", loginViaGithub);
router.post("/aws-details", userAWSDetails);

export default router;