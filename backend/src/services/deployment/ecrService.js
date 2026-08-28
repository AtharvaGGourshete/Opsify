import {
  ECRClient,
  GetAuthorizationTokenCommand,
  DescribeRepositoriesCommand
} from "@aws-sdk/client-ecr";

import { spawn } from "child_process";

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    console.log(
      `[Docker] Running: ${command} ${args.join(" ")}`
    );

    const process = spawn(command, args, {
      stdio: "inherit",
      shell: false
    });

    process.on("error", (error) => {
      reject(
        new Error(
          `Failed to start ${command}: ${error.message}`
        )
      );
    });

    process.on("close", (code) => {
      console.log(`[Docker] Exit code: ${code}`);

      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${command} failed with exit code ${code}.`
        )
      );
    });
  });
}

async function getRepositoryDetails({
  region,
  repositoryName
}) {
  console.log("[1] Creating ECR client...");

  const client = new ECRClient({
    region
  });

  console.log("[2] Checking ECR repository...");

  try {
    const repositoryResponse = await client.send(
      new DescribeRepositoriesCommand({
        repositoryNames: [repositoryName]
      })
    );

    console.log("[3] ECR repository response received.");

    const repository =
      repositoryResponse.repositories?.[0];

    if (!repository) {
      throw new Error(
        `ECR repository "${repositoryName}" was not returned by AWS.`
      );
    }

    const repositoryUri = repository.repositoryUri;
    const repositoryArn = repository.repositoryArn;

    if (!repositoryUri) {
      throw new Error(
        `ECR repository URI was not returned for ${repositoryName}.`
      );
    }

    if (!repositoryArn) {
      throw new Error(
        `ECR repository ARN was not returned for ${repositoryName}.`
      );
    }

    console.log(
      `[4] Repository URI: ${repositoryUri}`
    );

    console.log(
      `[4] Repository ARN: ${repositoryArn}`
    );

    return {
      repositoryUri,
      repositoryArn
    };

  } catch (error) {
    if (
      error.name === "RepositoryNotFoundException"
    ) {
      throw new Error(
        `ECR repository "${repositoryName}" does not exist.`
      );
    }

    throw new Error(
      `Failed to retrieve ECR repository: ${error.message}`
    );
  }
}

async function getEcrAuthorizationToken(region) {
  console.log(
    "[5] Requesting ECR authorization token..."
  );

  const client = new ECRClient({
    region
  });

  const response = await client.send(
    new GetAuthorizationTokenCommand({})
  );

  console.log(
    "[6] ECR authorization token received."
  );

  const authorizationData =
    response.authorizationData?.[0];

  if (
    !authorizationData?.authorizationToken ||
    !authorizationData?.proxyEndpoint
  ) {
    throw new Error(
      "AWS did not return valid ECR authorization data."
    );
  }

  return authorizationData;
}

async function loginToEcr(authorizationData) {
  const registryEndpoint =
    authorizationData.proxyEndpoint.replace(
      /^https?:\/\//,
      ""
    );

  const authorizationToken =
    Buffer.from(
      authorizationData.authorizationToken,
      "base64"
    )
      .toString("utf8")
      .split(":")[1];

  if (!authorizationToken) {
    throw new Error(
      "Could not extract ECR authorization password."
    );
  }

  console.log(
    `[7] Logging Docker into ${registryEndpoint}...`
  );

  await new Promise((resolve, reject) => {
    const docker = spawn(
      "docker",
      [
        "login",
        "--username",
        "AWS",
        "--password-stdin",
        registryEndpoint
      ],
      {
        stdio: ["pipe", "inherit", "inherit"],
        shell: false
      }
    );

    docker.stdin.write(
      `${authorizationToken}\n`
    );

    docker.stdin.end();

    docker.on("error", reject);

    docker.on("close", (code) => {
      console.log(
        `[Docker login] Exit code: ${code}`
      );

      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Docker login failed with exit code ${code}.`
          )
        );
      }
    });
  });

  console.log(
    "[8] Docker login successful."
  );

  return registryEndpoint;
}

async function tagImage({
  localImageTag,
  remoteImageTag
}) {
  console.log(
    `[9] Tagging image: ${remoteImageTag}`
  );

  await runCommand(
    "docker",
    [
      "tag",
      localImageTag,
      remoteImageTag
    ]
  );
}

async function pushImage(imageTag) {
  console.log(
    `[10] Pushing image: ${imageTag}`
  );

  await runCommand(
    "docker",
    [
      "push",
      imageTag
    ]
  );
}

export async function pushContainerImage({
  localImageTag,
  repositoryName,
  region,
  imageTag
}) {
  console.log(
    "[0] Starting ECR image push..."
  );

  if (!localImageTag) {
    throw new Error(
      "Local Docker image tag is required."
    );
  }

  if (!repositoryName) {
    throw new Error(
      "ECR repository name is required."
    );
  }

  if (!region) {
    throw new Error(
      "AWS region is required."
    );
  }

  if (!imageTag) {
    throw new Error(
      "ECR image tag is required."
    );
  }

  const {
    repositoryUri,
    repositoryArn
  } = await getRepositoryDetails({
    region,
    repositoryName
  });

  const authorizationData =
    await getEcrAuthorizationToken(region);

  await loginToEcr(
    authorizationData
  );

  const remoteImageTag =
    `${repositoryUri}:${imageTag}`;

  await tagImage({
    localImageTag,
    remoteImageTag
  });

  await pushImage(
    remoteImageTag
  );

  console.log(
    "[11] ECR image push completed."
  );

  return {
    repositoryName,
    repositoryUri,
    repositoryArn,
    imageTag,
    imageUri: remoteImageTag
  };
}