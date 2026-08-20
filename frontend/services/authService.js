const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const saveGithubUser = async (githubData) => {
  const response = await fetch(`${API_URL}/api/auth/github`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(githubData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save GitHub user");
  }

  return data;
};

export const saveAWSDetails = async (awsData) => {
  const response = await fetch(`${API_URL}/api/auth/aws`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(awsData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save AWS details");
  }

  return data;
};