import express from "express";
import {
  getUserProfile,
  loginViaGithub,
  userAWSDetails,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/users/:githubUserId", getUserProfile);
router.post("/github", loginViaGithub);
router.post("/aws-details", userAWSDetails);

export default router;
