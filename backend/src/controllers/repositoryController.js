import {
  cloneRepository,
  cleanupRepository,
} from "../services/repository/clone.js";
import { scanRepository } from "../services/repository/scanner.js";
import { detectLanguages } from "../services/repository/detectors/languageDetector.js";
import { findPackageFiles } from "../services/repository/detectors/packageDetector.js";
import { detectJavaScriptFrameworks } from "../services/repository/detectors/frameworkDetector.js";
import { detectApplications } from "../services/repository/detectors/applicationDetector.js";
import { detectDatabases } from "../services/repository/detectors/databaseDetector.js";
import { detectInfrastructure } from "../services/repository/detectors/infrastructureDetector.js";
import { buildRepositoryProfile } from "../services/repository/profileBuilder.js";
import { generateRepositoryContext } from "../services/repository/context/repomix.js";
import { createDeploymentSpecification } from "../services/deployment/deploymentPlanner.js";
import { saveRepositoryAnalysis, getLatestRepositoryAnalysis } from "../services/repository/repositoryAnalysisRepository.js";

function isValidGitHubUrl(url) {
  try {
    const parsed = new URL(url);

    return (
      parsed.hostname === "github.com" ||
      parsed.hostname === "www.github.com"
    );
  } catch {
    return false;
  }
}

export async function analyzeRepository(req, res) {
  const {
    url,
    github_user_id
  } = req.body;

  if (!github_user_id) {
    return res.status(400).json({
      error: "GitHub user ID is required.",
    });
  }

  if (!url) {
    return res.status(400).json({
      error: "Repository URL is required.",
    });
  }

  if (!isValidGitHubUrl(url)) {
    return res.status(400).json({
      error: "Only GitHub repository URLs are supported.",
    });
  }

  let repoPath = null;

  try {
    repoPath = await cloneRepository(url);
    const files = await scanRepository(repoPath);
    const languages = detectLanguages(files);
    const packageData = await findPackageFiles(repoPath, files);
    const frameworks = detectJavaScriptFrameworks(packageData);
    const applications = detectApplications(frameworks, packageData);
    const databases = detectDatabases(packageData);
    const infrastructure = detectInfrastructure(files);
    const repositoryContext = await generateRepositoryContext(repoPath);
    const profile = buildRepositoryProfile({
      repositoryUrl: url,
      files,
      languages,
      packageData,
      frameworks,
      applications,
      databases,
      infrastructure
    });

    const savedAnalysis = await saveRepositoryAnalysis({
      githubUserId: github_user_id,
      repositoryUrl: url,
      files,
      profile
    });

    console.log(
      `Repository analysis saved. Repository ID: ${savedAnalysis.repositoryId}, Scan ID: ${savedAnalysis.scanId}`
    );

    return res.status(200).json({
      profile,
      context: repositoryContext.context,
      repositoryId: savedAnalysis.repositoryId,
      scanId: savedAnalysis.scanId
    });
  } catch (error) {
    console.error("Repository analysis failed:", error);

    return res.status(500).json({
      error: "Repository analysis failed.",
      message: error.message,
    });
  } finally {
    await cleanupRepository(repoPath);
  }
}

export async function createDeploymentPlan(req, res) {
  const {
    profile,
    applicationDirectory,
    port
  } = req.body;

  if (!profile) {
    return res.status(400).json({
      error: "Repository profile is required."
    });
  }

  if (!applicationDirectory) {
    return res.status(400).json({
      error: "Application directory is required."
    });
  }

  if (port === undefined || port === null || port === "") {
    return res.status(400).json({
      error: "Application port is required."
    });
  }

  try {
    const deployment = createDeploymentSpecification({
      profile,
      applicationDirectory,
      port
    });

    return res.status(200).json({
      deployment
    });
  } catch (error) {
    console.error("Deployment planning failed:", error);

    return res.status(400).json({
      error: "Deployment planning failed.",
      message: error.message
    });
  }
}

export async function getLatestRepositoryAnalysisController(req, res) {
  const { github_user_id } = req.query;

  if (!github_user_id) {
    return res.status(400).json({
      error: "GitHub user ID is required.",
    });
  }

  try {
    const result =
      await getLatestRepositoryAnalysis(
        github_user_id
      );

    if (!result) {
      return res.status(404).json({
        error: "No repository analysis found.",
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error(
      "Failed to load repository analysis:",
      error
    );

    return res.status(500).json({
      error: "Failed to load repository analysis.",
      message: error.message,
    });
  }
}