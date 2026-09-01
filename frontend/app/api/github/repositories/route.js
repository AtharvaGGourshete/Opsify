import { getToken } from "next-auth/jwt";

export async function GET(request) {
  try {
    const isSecure = new URL(request.url).protocol === "https:";

    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      salt: isSecure
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
      secureCookie: isSecure,
    });

    if (!token) {
      return Response.json(
        {
          message: "You must be authenticated with GitHub.",
        },
        {
          status: 401,
        }
      );
    }

    const githubAccessToken = token.githubAccessToken;

    if (!githubAccessToken) {
      return Response.json(
        {
          message:
            "GitHub access token is missing. Sign out and sign in again.",
        },
        {
          status: 401,
        }
      );
    }

    const repositories = [];

    let page = 1;

    while (true) {
      const githubResponse = await fetch(
        `https://api.github.com/user/repos?visibility=all&affiliation=owner,collaborator,organization_member&sort=updated&direction=desc&per_page=100&page=${page}`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${githubAccessToken}`,
            "X-GitHub-Api-Version": "2026-03-10",
          },
          cache: "no-store",
        }
      );

      if (!githubResponse.ok) {
        const errorData = await githubResponse.json().catch(() => null);

        console.error("GitHub repository request failed:", {
          status: githubResponse.status,
          error: errorData,
        });

        return Response.json(
          {
            message:
              errorData?.message ||
              "Failed to retrieve repositories from GitHub.",
          },
          {
            status: githubResponse.status,
          }
        );
      }

      const pageRepositories = await githubResponse.json();

      repositories.push(...pageRepositories);

      if (pageRepositories.length < 100) {
        break;
      }

      page += 1;
    }

    const safeRepositories = repositories.map((repository) => ({
      id: repository.id,
      name: repository.name,
      full_name: repository.full_name,
      description: repository.description,
      private: repository.private,
      visibility: repository.visibility,
      html_url: repository.html_url,
      default_branch: repository.default_branch,
      owner: {
        login: repository.owner?.login,
        id: repository.owner?.id,
        avatar_url: repository.owner?.avatar_url,
      },
      permissions: repository.permissions
        ? {
            admin: Boolean(repository.permissions.admin),
            push: Boolean(repository.permissions.push),
            pull: Boolean(repository.permissions.pull),
          }
        : null,
      archived: Boolean(repository.archived),
      fork: Boolean(repository.fork),
    }));

    return Response.json({
      repositories: safeRepositories,
      count: safeRepositories.length,
    });
  } catch (error) {
    console.error("GitHub repositories API error:", error);

    return Response.json(
      {
        message: "Failed to retrieve GitHub repositories.",
      },
      {
        status: 500,
      }
    );
  }
}