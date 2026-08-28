export function createDeploymentSpecification({
  profile,
  applicationDirectory,
  port
}) {
  if (!profile) {
    throw new Error("Repository profile is required.");
  }

  if (!applicationDirectory) {
    throw new Error("Application directory is required.");
  }

  const numericPort = Number(port);

  if (
    !Number.isInteger(numericPort) ||
    numericPort < 1 ||
    numericPort > 65535
  ) {
    throw new Error("Port must be an integer between 1 and 65535.");
  }

  const application = profile.applications.find(
    (item) => item.directory === applicationDirectory
  );

  if (!application) {
    throw new Error(
      `No application found at directory: ${applicationDirectory}`
    );
  }

  const dependencyInfo = profile.dependencies.find(
    (item) => item.directory === applicationDirectory
  );

  if (!dependencyInfo) {
    throw new Error(
      `No package information found for application: ${applicationDirectory}`
    );
  }

  const scripts = dependencyInfo.scripts || {};

  return {
    supported: true,

    application: {
      name: application.name,
      directory: application.directory,
      type: application.type,
      framework: application.framework,
      runtime: application.runtime,
      packageManager: application.packageManager
    },

    build: {
      startCommand: scripts.start || null,
      buildCommand: scripts.build || null
    },

    network: {
      port: numericPort
    },

    container: {
      strategy: "docker"
    },

    deployment: {
      platform: "aws-ecs-fargate"
    }
  };
}