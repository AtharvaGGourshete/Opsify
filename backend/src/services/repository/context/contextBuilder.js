export function buildAIContext(profile, repomixContext) {
  return { 
    repository: {
      url: profile.repository.url
    },

    summary: {
      files: profile.statistics.totalFiles,
      applications: profile.statistics.totalApplications,
      primaryLanguage: profile.languages.primary
    },

    applications: profile.applications,

    languages: profile.languages.detected,

    dependencies: profile.dependencies,

    databases: profile.databases,

    infrastructure: profile.infrastructure,

    ci_cd: profile.ci_cd,

    evidence: profile.evidence,

    sourceContext: repomixContext
  };
}