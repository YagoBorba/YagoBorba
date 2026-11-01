import { excludedLanguages } from './content.mjs';

const QUERY = `
query($login: String!) {
  user(login: $login) {
    followers { totalCount }
    repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100) {
      totalCount
      nodes {
        name
        stargazerCount
        forkCount
        pushedAt
        languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

export async function fetchProfile(login, token) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': `${login}-profile-generator`,
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`);
  }
  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '));
  }
  return summarize(payload.data.user);
}

function summarize(user) {
  const repos = user.repositories.nodes;
  const contributions = user.contributionsCollection;
  const days = contributions.contributionCalendar.weeks.flatMap((week) => week.contributionDays);

  return {
    totals: {
      contributions: contributions.contributionCalendar.totalContributions,
      commits: contributions.totalCommitContributions,
      pullRequests: contributions.totalPullRequestContributions,
      issues: contributions.totalIssueContributions,
      stars: repos.reduce((sum, repo) => sum + repo.stargazerCount, 0),
      repositories: user.repositories.totalCount,
      followers: user.followers.totalCount,
    },
    streaks: streaks(days),
    languages: languageMix(repos),
    repos: Object.fromEntries(repos.map((repo) => [repo.name, repo])),
  };
}

function streaks(days) {
  let longest = 0;
  let run = 0;
  let bestDay = 0;
  for (const day of days) {
    bestDay = Math.max(bestDay, day.contributionCount);
    run = day.contributionCount > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  let current = 0;
  let index = days.length - 1;
  if (index >= 0 && days[index].contributionCount === 0) index -= 1;
  while (index >= 0 && days[index].contributionCount > 0) {
    current += 1;
    index -= 1;
  }
  return { current, longest, bestDay };
}

function languageMix(repos, limit = 7) {
  const totals = new Map();
  for (const repo of repos) {
    for (const { size, node } of repo.languages.edges) {
      if (excludedLanguages.has(node.name)) continue;
      const entry = totals.get(node.name) ?? { name: node.name, color: node.color, size: 0 };
      entry.size += size;
      totals.set(node.name, entry);
    }
  }
  const sorted = [...totals.values()].sort((a, b) => b.size - a.size);
  const total = sorted.reduce((sum, entry) => sum + entry.size, 0) || 1;
  const top = sorted.slice(0, limit);
  const rest = sorted.slice(limit).reduce((sum, entry) => sum + entry.size, 0);
  if (rest > 0) top.push({ name: 'Other', color: null, size: rest });
  return top.map((entry) => ({ ...entry, share: entry.size / total }));
}
