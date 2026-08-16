export function detectInfrastructure(files) {
  const dockerFiles = files.filter((file) => {
    const name = file.path.split("/").pop().toLowerCase();

    return (
      name === "dockerfile" ||
      name === "docker-compose.yml" ||
      name === "docker-compose.yaml"
    );
  });

  const terraformFiles = files.filter(
    (file) => file.extension === ".tf"
  );

  const githubActionsFiles = files.filter(
    (file) =>
      file.path.startsWith(".github/workflows/") &&
      (
        file.extension === ".yml" ||
        file.extension === ".yaml"
      )
  );

  const kubernetesFiles = files.filter((file) => {
    const normalized = file.path.toLowerCase();

    return (
      normalized.startsWith("k8s/") ||
      normalized.startsWith("kubernetes/")
    );
  });

  return {
    docker: {
      detected: dockerFiles.length > 0,
      files: dockerFiles.map((file) => file.path),
      evidence: dockerFiles.map((file) => ({
        source: file.path,
        reason: "Docker configuration file detected"
      }))
    },

    terraform: {
      detected: terraformFiles.length > 0,
      files: terraformFiles.map((file) => file.path),
      evidence: terraformFiles.map((file) => ({
        source: file.path,
        reason: "Terraform configuration file detected"
      }))
    },

    githubActions: {
      detected: githubActionsFiles.length > 0,
      workflows: githubActionsFiles.map((file) => file.path),
      evidence: githubActionsFiles.map((file) => ({
        source: file.path,
        reason: "GitHub Actions workflow detected"
      }))
    },

    kubernetes: {
      detected: kubernetesFiles.length > 0,
      files: kubernetesFiles.map((file) => file.path),
      evidence: kubernetesFiles.map((file) => ({
        source: file.path,
        reason: "Kubernetes configuration detected"
      }))
    }
  };
}