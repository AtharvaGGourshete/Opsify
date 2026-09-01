import sql from "../../config/database.js";


export async function saveRepositoryAnalysis({
  githubUserId,
  repositoryUrl,
  files,
  profile,
}) {
  if (!githubUserId) {
    throw new Error("GitHub user ID is required.");
  }

  if (!repositoryUrl) {
    throw new Error("Repository URL is required.");
  }

  if (!profile) {
    throw new Error("Repository profile is required.");
  }

  const repositoryInfo = parseGitHubRepository(repositoryUrl);

  if (!repositoryInfo) {
    throw new Error("Invalid GitHub repository URL.");
  }

  return await sql.begin(async (tx) => {

    // ==========================================================
    // 1. REPOSITORY
    // ==========================================================

    const repositoryResult = await tx`
      INSERT INTO public.repositories (
        github_user_id,
        owner,
        name,
        full_name,
        repository_url,
        default_branch
      )
      VALUES (
        ${String(githubUserId)},
        ${repositoryInfo.owner},
        ${repositoryInfo.name},
        ${repositoryInfo.fullName},
        ${repositoryUrl},
        ${repositoryInfo.branch}
      )
      ON CONFLICT (github_user_id, owner, name)
      DO UPDATE SET
        repository_url = EXCLUDED.repository_url,
        default_branch = EXCLUDED.default_branch,
        updated_at = now()
      RETURNING id;
    `;

    const repositoryId = repositoryResult[0].id;


    // ==========================================================
    // 2. REPOSITORY SCAN
    // ==========================================================

    const scanResult = await tx`
      INSERT INTO public.repository_scans (
        repository_id,
        repository_url,
        primary_language,
        total_files,
        total_applications,
        scan_status,
        started_at,
        completed_at
      )
      VALUES (
        ${repositoryId},
        ${repositoryUrl},
        ${profile.languages?.primary || null},
        ${profile.statistics?.totalFiles || 0},
        ${profile.statistics?.totalApplications || 0},
        'completed',
        now(),
        now()
      )
      RETURNING id;
    `;

    const scanId = scanResult[0].id;


    // ==========================================================
    // 3. SCANNED FILES
    // ==========================================================

    for (const file of files || []) {
      await tx`
        INSERT INTO public.scan_files (
          scan_id,
          path,
          extension,
          size
        )
        VALUES (
          ${scanId},
          ${file.path},
          ${file.extension || null},
          ${file.size || 0}
        );
      `;
    }


    // ==========================================================
    // 4. LANGUAGES
    // ==========================================================

    for (const language of profile.languages?.detected || []) {
      await tx`
        INSERT INTO public.scan_languages (
          scan_id,
          language,
          file_count
        )
        VALUES (
          ${scanId},
          ${language.language},
          ${language.fileCount || 0}
        );
      `;
    }


    // ==========================================================
    // 5. APPLICATIONS
    // ==========================================================

    for (const application of profile.applications || []) {
      await tx`
        INSERT INTO public.applications (
          scan_id,
          name,
          directory,
          type,
          framework,
          package_manager,
          runtime
        )
        VALUES (
          ${scanId},
          ${application.name},
          ${application.directory},
          ${application.type},
          ${application.framework || null},
          ${application.packageManager || null},
          ${application.runtime || null}
        );
      `;
    }


    // ==========================================================
    // 6. PACKAGES
    // ==========================================================

    for (const dependency of profile.dependencies || []) {

      const packageResult = await tx`
        INSERT INTO public.scan_packages (
          scan_id,
          directory,
          package_file,
          name,
          version,
          package_manager,
          scripts
        )
        VALUES (
          ${scanId},
          ${dependency.directory},
          ${dependency.packageFile},
          ${dependency.name || null},
          ${dependency.version || null},
          ${dependency.packageManager || null},
          ${JSON.stringify(dependency.scripts || {})}::jsonb
        )
        RETURNING id;
      `;

      const packageId = packageResult[0].id;


      // --------------------------------------------------------
      // Production dependencies
      // --------------------------------------------------------

      for (const dependencyName of dependency.production || []) {
        await tx`
          INSERT INTO public.package_dependencies (
            package_id,
            dependency_name,
            dependency_type
          )
          VALUES (
            ${packageId},
            ${dependencyName},
            'production'
          );
        `;
      }


      // --------------------------------------------------------
      // Development dependencies
      // --------------------------------------------------------

      for (const dependencyName of dependency.development || []) {
        await tx`
          INSERT INTO public.package_dependencies (
            package_id,
            dependency_name,
            dependency_type
          )
          VALUES (
            ${packageId},
            ${dependencyName},
            'development'
          );
        `;
      }
    }


    // ==========================================================
    // 7. DATABASES
    // ==========================================================

    for (const database of profile.databases || []) {
      await tx`
        INSERT INTO public.scan_databases (
          scan_id,
          name,
          directory,
          confidence
        )
        VALUES (
          ${scanId},
          ${database.name},
          ${database.directory},
          ${database.confidence || null}
        );
      `;
    }


    // ==========================================================
    // 8. INFRASTRUCTURE
    // ==========================================================

    const infrastructure = [
      {
        type: "docker",
        data: profile.infrastructure?.docker,
      },
      {
        type: "terraform",
        data: profile.infrastructure?.terraform,
      },
      {
        type: "kubernetes",
        data: profile.infrastructure?.kubernetes,
      },
      {
        type: "ci_cd",
        data: profile.ci_cd?.githubActions,
      },
    ];


    for (const item of infrastructure) {
      const detection = item.data || {};

      const infrastructureResult = await tx`
        INSERT INTO public.scan_infrastructure (
          scan_id,
          infrastructure_type,
          detected
        )
        VALUES (
          ${scanId},
          ${item.type},
          ${Boolean(detection.detected)}
        )
        RETURNING id;
      `;

      const infrastructureId = infrastructureResult[0].id;


      const detectedFiles =
        detection.files ||
        detection.workflows ||
        [];


      for (const filePath of detectedFiles) {
        await tx`
          INSERT INTO public.infrastructure_files (
            infrastructure_id,
            file_path
          )
          VALUES (
            ${infrastructureId},
            ${filePath}
          );
        `;
      }
    }


    // ==========================================================
    // 9. EVIDENCE
    // ==========================================================

    for (const evidence of profile.evidence || []) {
      await tx`
        INSERT INTO public.scan_evidence (
          scan_id,
          evidence_type,
          technology,
          directory,
          confidence,
          source,
          reason
        )
        VALUES (
          ${scanId},
          ${evidence.type},
          ${evidence.technology || null},
          ${evidence.directory || null},
          ${evidence.confidence || null},
          ${evidence.source || null},
          ${evidence.reason || null}
        );
      `;
    }


    // ==========================================================
    // RETURN
    // ==========================================================

    return {
      repositoryId,
      scanId,
    };
  });
}

export async function getLatestRepositoryAnalysis(githubUserId) {
  const result = await sql`
    SELECT
      r.id AS repository_id,
      r.repository_url,
      r.owner,
      r.name,
      r.full_name,
      r.default_branch,

      s.id AS scan_id,
      s.primary_language,
      s.total_files,
      s.total_applications,
      s.scan_status,
      s.created_at AS scan_created_at

    FROM public.repositories r

    INNER JOIN public.repository_scans s
      ON s.repository_id = r.id

    WHERE r.github_user_id = ${String(githubUserId)}

    ORDER BY s.created_at DESC

    LIMIT 1;
  `;

  if (result.length === 0) {
    return null;
  }

  const scan = result[0];

  // ------------------------------------------------------------
  // LANGUAGES
  // ------------------------------------------------------------

  const languages = await sql`
    SELECT
      language,
      file_count
    FROM public.scan_languages
    WHERE scan_id = ${scan.scan_id}
    ORDER BY file_count DESC;
  `;


  // ------------------------------------------------------------
  // APPLICATIONS
  // ------------------------------------------------------------

  const applications = await sql`
    SELECT
      name,
      directory,
      type,
      framework,
      package_manager,
      runtime
    FROM public.applications
    WHERE scan_id = ${scan.scan_id}
    ORDER BY directory;
  `;


  // ------------------------------------------------------------
  // PACKAGES
  // ------------------------------------------------------------

  const packages = await sql`
    SELECT
      id,
      directory,
      package_file,
      name,
      version,
      package_manager,
      scripts
    FROM public.scan_packages
    WHERE scan_id = ${scan.scan_id}
    ORDER BY directory;
  `;


  // ------------------------------------------------------------
  // DEPENDENCIES
  // ------------------------------------------------------------

  const dependencies = await sql`
    SELECT
      pd.package_id,
      pd.dependency_name,
      pd.dependency_type
    FROM public.package_dependencies pd
    INNER JOIN public.scan_packages sp
      ON sp.id = pd.package_id
    WHERE sp.scan_id = ${scan.scan_id}
    ORDER BY pd.dependency_name;
  `;


  // ------------------------------------------------------------
  // DATABASES
  // ------------------------------------------------------------

  const databases = await sql`
    SELECT
      name,
      directory,
      confidence
    FROM public.scan_databases
    WHERE scan_id = ${scan.scan_id}
    ORDER BY name;
  `;


  // ------------------------------------------------------------
  // INFRASTRUCTURE
  // ------------------------------------------------------------

  const infrastructureRows = await sql`
    SELECT
      id,
      infrastructure_type,
      detected
    FROM public.scan_infrastructure
    WHERE scan_id = ${scan.scan_id};
  `;


  const infrastructureFiles = await sql`
    SELECT
      sif.infrastructure_id,
      sif.file_path
    FROM public.infrastructure_files sif
    INNER JOIN public.scan_infrastructure si
      ON si.id = sif.infrastructure_id
    WHERE si.scan_id = ${scan.scan_id};
  `;


  // ------------------------------------------------------------
  // EVIDENCE
  // ------------------------------------------------------------

  const evidence = await sql`
    SELECT
      evidence_type AS type,
      technology,
      directory,
      confidence,
      source,
      reason
    FROM public.scan_evidence
    WHERE scan_id = ${scan.scan_id}
    ORDER BY id;
  `;


  // ------------------------------------------------------------
  // REBUILD DEPENDENCY STRUCTURE
  // ------------------------------------------------------------

  const dependencyProfile = packages.map((pkg) => {

    const pkgDependencies = dependencies.filter(
      (dependency) => dependency.package_id === pkg.id
    );

    return {
      directory: pkg.directory,
      packageFile: pkg.package_file,
      name: pkg.name,
      version: pkg.version,
      packageManager: pkg.package_manager,
      production: pkgDependencies
        .filter(
          (dependency) =>
            dependency.dependency_type === "production"
        )
        .map(
          (dependency) =>
            dependency.dependency_name
        ),
      development: pkgDependencies
        .filter(
          (dependency) =>
            dependency.dependency_type === "development"
        )
        .map(
          (dependency) =>
            dependency.dependency_name
        ),
      scripts: pkg.scripts || {},
    };
  });


  // ------------------------------------------------------------
  // REBUILD INFRASTRUCTURE STRUCTURE
  // ------------------------------------------------------------

  const infrastructure = {
    docker: {
      detected: false,
      files: [],
      evidence: [],
    },

    terraform: {
      detected: false,
      files: [],
      evidence: [],
    },

    kubernetes: {
      detected: false,
      files: [],
      evidence: [],
    },
  };


  let githubActions = {
    detected: false,
    workflows: [],
    evidence: [],
  };


  for (const row of infrastructureRows) {

    const files = infrastructureFiles
      .filter(
        (file) =>
          file.infrastructure_id === row.id
      )
      .map(
        (file) => file.file_path
      );


    const infrastructureEvidence =
      evidence.filter(
        (item) =>
          (
            row.infrastructure_type === "ci_cd"
              ? item.type === "ci_cd"
              : item.type === row.infrastructure_type
          )
      );


    const value = {
      detected: row.detected,
      files,
      evidence: infrastructureEvidence,
    };


    if (row.infrastructure_type === "docker") {
      infrastructure.docker = value;
    }

    if (row.infrastructure_type === "terraform") {
      infrastructure.terraform = value;
    }

    if (row.infrastructure_type === "kubernetes") {
      infrastructure.kubernetes = value;
    }

    if (row.infrastructure_type === "ci_cd") {
      githubActions = {
        detected: row.detected,
        workflows: files,
        evidence: infrastructureEvidence,
      };
    }
  }


  // ------------------------------------------------------------
  // RETURN SAME PROFILE SHAPE AS ANALYSIS
  // ------------------------------------------------------------

  return {
    profile: {
      repository: {
        url: scan.repository_url,
      },

      statistics: {
        totalFiles: scan.total_files,
        totalApplications: scan.total_applications,
      },

      languages: {
        primary: scan.primary_language,
        detected: languages.map((language) => ({
          language: language.language,
          fileCount: language.file_count,
        })),
      },

      applications,

      dependencies: dependencyProfile,

      databases,

      infrastructure,

      ci_cd: {
        githubActions,
      },

      evidence,
    },

    repositoryId: scan.repository_id,
    scanId: scan.scan_id,
  };
}


// ============================================================
// GITHUB REPOSITORY URL PARSER
// ============================================================

function parseGitHubRepository(repositoryUrl) {
  try {
    const parsed = new URL(repositoryUrl);

    if (
      parsed.hostname !== "github.com" &&
      parsed.hostname !== "www.github.com"
    ) {
      return null;
    }

    const parts = parsed.pathname
      .split("/")
      .filter(Boolean);

    if (parts.length < 2) {
      return null;
    }

    const owner = parts[0];

    const name = parts[1]
      .replace(/\.git$/, "");

    return {
      owner,
      name,
      fullName: `${owner}/${name}`,
      branch: "main",
    };

  } catch {
    return null;
  }
}