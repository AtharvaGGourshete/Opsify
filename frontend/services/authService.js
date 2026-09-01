const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.AUTH_URL ||
  "http://localhost:5000";

function buildApiUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}


export const saveGithubUser = async (githubData) => {
  const response = await fetch(buildApiUrl("/api/auth/github"),{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(githubData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save GitHub user");
  }

  return data;
};


export const getUserProfile = async (github_user_id) => {
  const response = await fetch(buildApiUrl(`/api/auth/users/${github_user_id}`),
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch user profile");
  }

  return data;
};


export const saveAWSDetails = async (awsData) => {
  const response = await fetch(buildApiUrl("/api/auth/aws-details"),
  {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(awsData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to save AWS details"
    );
  }

  return data;
};
