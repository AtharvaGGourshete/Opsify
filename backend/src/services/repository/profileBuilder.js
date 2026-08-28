export function buildRepositoryProfile({
  repositoryUrl,
  files,
  languages,
  packageData,
  frameworks,
  applications,
  databases,
  infrastructure
}) {
  const evidence = buildEvidence({
    frameworks,
    databases,
    infrastructure
  });

  return {
    repository: {
      url: repositoryUrl
    },

    statistics: {
      totalFiles: files.length,
      totalApplications: applications.length
    },

    languages: {
      primary: languages.primary,
      detected: languages.detected
    },

    applications: applications.map((application) => ({
      name: application.name,
      directory: application.directory,
      type: application.type,
      framework: application.framework,
      packageManager: application.packageManager,
      runtime: application.runtime
    })),

    dependencies: packageData.map((pkg) => ({
      directory: getDirectory(pkg.path),
      packageFile: pkg.path,
      name: pkg.name,
      version: pkg.version,
      packageManager: pkg.packageManager,
      production: Object.keys(pkg.dependencies || {}),
      development: Object.keys(pkg.devDependencies || {}),
      scripts: pkg.scripts || {}
    })),

    databases,

    infrastructure: {
      docker: infrastructure.docker,
      terraform: infrastructure.terraform,
      kubernetes: infrastructure.kubernetes
    },

    ci_cd: {
      githubActions: infrastructure.githubActions
    },

    evidence
  };
}

function buildEvidence({
  frameworks,
  databases,
  infrastructure
}) {
  const evidence = [];

  for (const framework of frameworks) {
    for (const item of framework.evidence || []) {
      evidence.push({
        type: "framework",
        technology: framework.framework,
        directory: framework.directory,
        confidence: framework.confidence,
        source: item.source,
        reason: item.reason
      });
    }
  }

  for (const database of databases) {
    for (const item of database.evidence || []) {
      evidence.push({
        type: "database",
        technology: database.name,
        directory: database.directory,
        confidence: database.confidence,
        source: item.source,
        reason: item.reason
      });
    }
  }

  addInfrastructureEvidence(
    evidence,
    "docker",
    infrastructure.docker
  );

  addInfrastructureEvidence(
    evidence,
    "terraform",
    infrastructure.terraform
  );

  addInfrastructureEvidence(
    evidence,
    "kubernetes",
    infrastructure.kubernetes
  );

  addInfrastructureEvidence(
    evidence,
    "ci_cd",
    infrastructure.githubActions
  );

  return evidence;
}

function addInfrastructureEvidence(
  evidence,
  type,
  detection
) {
  for (const item of detection?.evidence || []) {
    evidence.push({
      type,
      source: item.source,
      confidence: 1,
      reason: item.reason
    });
  }
}

function getDirectory(packagePath) {
  const normalized = packagePath.replace(/\\/g, "/");
  const parts = normalized.split("/");

  parts.pop();

  return parts.length > 0 ? parts.join("/") : ".";
}