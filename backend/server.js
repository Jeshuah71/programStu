require("dotenv").config({ path: pathEnvFile() });

const express = require("express");
const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const dataFile = path.join(__dirname, "data", "students.json");
const githubApiBaseUrl = "https://api.github.com";
const openAiApiBaseUrl = "https://api.openai.com/v1/responses";

app.use(cors());
app.use(express.json());

function pathEnvFile() {
  return require("path").join(__dirname, ".env");
}

function getGitHubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return null;
  }

  return { token, owner, repo };
}

function getGitHubProjectConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_PROJECT_OWNER || process.env.GITHUB_ORG || process.env.GITHUB_OWNER;
  const projectId = process.env.GITHUB_PROJECT_ID || process.env.VITE_GITHUB_PROJECT_ID;
  const projectNumber = process.env.GITHUB_PROJECT_NUMBER || process.env.VITE_GITHUB_PROJECT_NUMBER;

  if (!token || !owner || (!projectId && !projectNumber)) {
    return null;
  }

  return { token, owner, projectId, projectNumber: projectNumber ? Number(projectNumber) : null };
}

async function fetchGitHub(pathname) {
  const config = getGitHubConfig();

  if (!config) {
    const error = new Error("GitHub integration is not configured");
    error.status = 503;
    throw error;
  }

  const response = await fetch(`${githubApiBaseUrl}${pathname}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "User-Agent": "suu-student-onboarding-hub",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.message || "GitHub request failed");
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function mutateGitHub(pathname, options = {}) {
  const config = getGitHubConfig();

  if (!config) {
    const error = new Error("GitHub integration is not configured");
    error.status = 503;
    throw error;
  }

  const response = await fetch(`${githubApiBaseUrl}${pathname}`, {
    method: options.method || "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "User-Agent": "suu-student-onboarding-hub",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.message || "GitHub request failed");
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function fetchGitHubGraphQL(query, variables = {}) {
  const projectConfig = getGitHubProjectConfig();
  const token = projectConfig?.token || process.env.GITHUB_TOKEN;

  if (!token) {
    const error = new Error("GitHub project integration is not configured");
    error.status = 503;
    throw error;
  }

  const response = await fetch(`${githubApiBaseUrl}/graphql`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "suu-student-onboarding-hub"
    },
    body: JSON.stringify({ query, variables })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.errors?.length) {
    const error = new Error(payload.errors?.[0]?.message || "GitHub GraphQL request failed");
    error.status = response.status || 500;
    throw error;
  }

  return payload.data;
}

async function askOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-5.2";

  if (!apiKey) {
    const error = new Error("OpenAI integration is not configured");
    error.status = 503;
    throw error;
  }

  const response = await fetch(openAiApiBaseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: prompt,
      max_output_tokens: 700
    })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.error?.message || "OpenAI request failed");
    error.status = response.status;
    throw error;
  }

  const payload = await response.json();
  return (
    payload.output_text ||
    payload.output
      ?.flatMap((item) => item.content || [])
      .map((item) => item.text || "")
      .join("\n")
      .trim() ||
    ""
  );
}

function normalizeGitHubIssue(issue) {
  return {
    id: `github-issue-${issue.id}`,
    number: issue.number,
    title: issue.title,
    status: issue.state === "open" ? "Open" : "Closed",
    assigneeStudentId: null,
    assigneeLogin: issue.assignee?.login || "",
    labels: issue.labels.map((label) => label.name),
    repository: issue.repository_url.split("/repos/")[1] || "",
    updatedAt: issue.updated_at,
    url: issue.html_url
  };
}

function getPullRequestReviewState(pullRequest) {
  if (pullRequest.draft) {
    return "Draft";
  }

  if (pullRequest.merged_at) {
    return "Approved";
  }

  return "Waiting for review";
}

function normalizeGitHubPullRequest(pullRequest) {
  return {
    id: `github-pr-${pullRequest.id}`,
    number: pullRequest.number,
    title: pullRequest.title,
    status: pullRequest.merged_at ? "Merged" : pullRequest.state === "open" ? "Open" : "Closed",
    authorStudentId: null,
    authorLogin: pullRequest.user?.login || "",
    repository: pullRequest.base?.repo?.full_name || "",
    reviewState: getPullRequestReviewState(pullRequest),
    checksState: "Unknown",
    linkedIssueNumber: null,
    updatedAt: pullRequest.updated_at,
    url: pullRequest.html_url
  };
}

const statusToProjectName = {
  backlog: "Backlog",
  ready: "Refined / Ready",
  blocked: "Blocked",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done"
};

const projectNameToStatus = Object.entries(statusToProjectName).reduce((acc, [key, value]) => {
  acc[value.toLowerCase()] = key;
  return acc;
}, {});

function toStatusId(value) {
  if (!value) {
    return "backlog";
  }

  const normalized = String(value).trim().toLowerCase();
  return projectNameToStatus[normalized] || normalized.replace(/\s+/g, "-").replace("refined-/-ready", "ready");
}

function slugify(value) {
  return String(value || "uncategorized")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function getProjectFieldValue(fieldValue) {
  if (!fieldValue?.field?.name) {
    return null;
  }

  if (typeof fieldValue.text === "string") {
    return fieldValue.text;
  }
  if (typeof fieldValue.name === "string") {
    return fieldValue.name;
  }
  if (typeof fieldValue.date === "string") {
    return fieldValue.date;
  }
  if (fieldValue.users?.nodes?.length) {
    return fieldValue.users.nodes.map((user) => user.login).join(", ");
  }

  return null;
}

function buildFieldMap(item) {
  return (item.fieldValues?.nodes || []).reduce((acc, fieldValue) => {
    const value = getProjectFieldValue(fieldValue);
    if (fieldValue?.field?.name && value !== null && value !== "") {
      acc[fieldValue.field.name] = value;
    }
    return acc;
  }, {});
}

function getContentAssignees(content) {
  return content?.assignees?.nodes?.map((assignee) => assignee.login) || [];
}

function findStudentForAssignee(students, assigneeLogins) {
  const normalizedLogins = assigneeLogins.map((login) => login.toLowerCase());
  return students.find((student) => {
    const candidates = [
      student.githubUsername,
      student.githubLogin,
      student.username,
      student.email?.split("@")[0],
      student.name?.toLowerCase().replace(/\s+/g, "")
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    return candidates.some((candidate) => normalizedLogins.includes(candidate));
  });
}

function normalizeProjectItemToStory(item, students) {
  const fields = buildFieldMap(item);
  const content = item.content || {};
  const assigneeLogins = fields["Assigned To"]
    ? String(fields["Assigned To"]).split(",").map((login) => login.trim()).filter(Boolean)
    : getContentAssignees(content);
  const student = findStudentForAssignee(students, assigneeLogins);
  const epicTitle = fields.Epic || "Unassigned Epic";
  const artifact = fields.Artifact || (content.__typename === "PullRequest" ? "PR" : "Doc");
  const storyType = fields["Story Type"] || "Story";
  const status = toStatusId(fields["Kanban Status"] || fields.Status || content.state);
  const movedAt = item.updatedAt || content.updatedAt || new Date().toISOString();

  return {
    id: item.id,
    projectItemId: item.id,
    contentId: content.id || "",
    githubNumber: content.number || null,
    githubType: content.__typename || "DraftIssue",
    title: content.title || "Untitled project item",
    epicId: `epic-${slugify(epicTitle)}`,
    assigneeStudentId: student?.id || "",
    assigneeLogin: assigneeLogins[0] || "",
    artifact,
    storyType,
    status,
    estimateDays: Number(fields["Estimate Days"] || fields.Estimate || 2),
    movedAt,
    overview: content.body || "",
    why: "",
    problem: "",
    requestedBy: fields["Requested By"] || "",
    acceptanceCriteria: [],
    constraints: "",
    dependencies: fields.Dependencies || "",
    artifactLink: content.url || "",
    verification: fields.Verification || "",
    followUp: "",
    blockedReason: fields.Blocker || fields["Blocked Reason"] || "",
    repository: content.repository?.nameWithOwner || ""
  };
}

function buildEpicsFromStories(stories) {
  const epicsById = new Map();

  stories.forEach((story) => {
    if (!epicsById.has(story.epicId)) {
      const title = story.epicId.replace(/^epic-/, "").split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
      epicsById.set(story.epicId, {
        id: story.epicId,
        title,
        description: `Stories grouped from the GitHub Project Epic field for ${title}.`,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        owner: "GitHub Project"
      });
    }
  });

  return [...epicsById.values()];
}

async function resolveProjectId() {
  const config = getGitHubProjectConfig();

  if (!config) {
    const error = new Error("GitHub project integration is not configured");
    error.status = 503;
    throw error;
  }

  if (config.projectId) {
    return config.projectId;
  }

  const data = await fetchGitHubGraphQL(
    `query($owner: String!, $number: Int!) {
      organization(login: $owner) { projectV2(number: $number) { id title } }
      user(login: $owner) { projectV2(number: $number) { id title } }
    }`,
    { owner: config.owner, number: config.projectNumber }
  );
  const project = data.organization?.projectV2 || data.user?.projectV2;

  if (!project?.id) {
    const error = new Error("GitHub Project was not found for the configured owner and number");
    error.status = 404;
    throw error;
  }

  return project.id;
}

async function getProjectMetadata(projectId) {
  const data = await fetchGitHubGraphQL(
    `query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          id
          title
          fields(first: 50) {
            nodes {
              ... on ProjectV2Field { id name }
              ... on ProjectV2SingleSelectField { id name options { id name } }
              ... on ProjectV2FieldCommon { id name }
            }
          }
        }
      }
    }`,
    { projectId }
  );

  const project = data.node;
  if (!project) {
    const error = new Error("GitHub Project metadata was not found");
    error.status = 404;
    throw error;
  }

  return project;
}

async function listProjectStories() {
  const projectId = await resolveProjectId();
  const students = (await readStudents()).map(normalizeStudent);
  const items = [];
  let cursor = null;

  do {
    const data = await fetchGitHubGraphQL(
      `query($projectId: ID!, $cursor: String) {
        node(id: $projectId) {
          ... on ProjectV2 {
            id
            title
            items(first: 50, after: $cursor) {
              pageInfo { hasNextPage endCursor }
              nodes {
                id
                updatedAt
                fieldValues(first: 30) {
                  nodes {
                    ... on ProjectV2ItemFieldTextValue { text field { ... on ProjectV2FieldCommon { name } } }
                    ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2FieldCommon { name } } }
                    ... on ProjectV2ItemFieldDateValue { date field { ... on ProjectV2FieldCommon { name } } }
                    ... on ProjectV2ItemFieldUserValue { users(first: 10) { nodes { login } } field { ... on ProjectV2FieldCommon { name } } }
                  }
                }
                content {
                  __typename
                  ... on DraftIssue { id title body }
                  ... on Issue {
                    id
                    number
                    title
                    body
                    state
                    updatedAt
                    url
                    repository { nameWithOwner }
                    assignees(first: 10) { nodes { login } }
                  }
                  ... on PullRequest {
                    id
                    number
                    title
                    body
                    state
                    updatedAt
                    url
                    repository { nameWithOwner }
                    assignees(first: 10) { nodes { login } }
                  }
                }
              }
            }
          }
        }
      }`,
      { projectId, cursor }
    );

    const page = data.node?.items;
    items.push(...(page?.nodes || []));
    cursor = page?.pageInfo?.hasNextPage ? page.pageInfo.endCursor : null;
  } while (cursor);

  const stories = items
    .filter((item) => item.content?.title)
    .map((item) => normalizeProjectItemToStory(item, students));

  return {
    projectId,
    epics: buildEpicsFromStories(stories),
    stories
  };
}

function findProjectField(project, fieldName) {
  return project.fields?.nodes?.find((field) => field?.name === fieldName);
}

async function updateProjectSingleSelect(projectId, itemId, fieldName, optionName) {
  const project = await getProjectMetadata(projectId);
  const field = findProjectField(project, fieldName);
  const option = field?.options?.find((item) => item.name === optionName);

  if (!field?.id || !option?.id) {
    const error = new Error(`GitHub Project field "${fieldName}" does not have option "${optionName}"`);
    error.status = 400;
    throw error;
  }

  await fetchGitHubGraphQL(
    `mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: { singleSelectOptionId: $optionId }
      }) {
        projectV2Item { id }
      }
    }`,
    { projectId, itemId, fieldId: field.id, optionId: option.id }
  );
}

async function updateProjectTextField(projectId, itemId, fieldName, text) {
  if (!text) {
    return;
  }

  const project = await getProjectMetadata(projectId);
  const field = findProjectField(project, fieldName);

  if (!field?.id) {
    return;
  }

  await fetchGitHubGraphQL(
    `mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $text: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: { text: $text }
      }) {
        projectV2Item { id }
      }
    }`,
    { projectId, itemId, fieldId: field.id, text }
  );
}

function buildStoryIssueBody(form) {
  const criteria = String(form.acceptanceCriteria || "")
    .split("\n")
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .map((item) => `- [ ] ${item}`)
    .join("\n");

  return [
    "## OVERVIEW",
    form.overview || "",
    "",
    `**Why are we doing this?** ${form.why || ""}`,
    `**What problem does it solve?** ${form.problem || ""}`,
    `**Who asked for it?** ${form.requestedBy || ""}`,
    "",
    "## REQUIREMENTS",
    criteria || "- [ ] Add acceptance criteria",
    "",
    `**Constraints:** ${form.constraints || "None listed"}`,
    `**Dependencies:** ${form.dependencies || "None listed"}`,
    "",
    "## OUTCOMES",
    `**Artifact:** ${form.artifact || "PR"}`,
    `**Verification:** ${form.verification || ""}`,
    `**Artifact link:** ${form.artifactLink || ""}`,
    `**Follow-up:** ${form.followUp || "None listed"}`
  ].join("\n");
}

async function createProjectStory(form) {
  const config = getGitHubConfig();
  const projectId = await resolveProjectId();
  const issue = await mutateGitHub(`/repos/${config.owner}/${config.repo}/issues`, {
    method: "POST",
    body: {
      title: form.title,
      body: buildStoryIssueBody(form),
      labels: [form.storyType === "Spike" ? "spike" : "story"]
    }
  });

  const added = await fetchGitHubGraphQL(
    `mutation($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
        item { id }
      }
    }`,
    { projectId, contentId: issue.node_id }
  );

  const itemId = added.addProjectV2ItemById.item.id;
  await updateProjectTextField(projectId, itemId, "Epic", form.epicTitle || form.epicId || "Unassigned Epic");
  await updateProjectSingleSelect(projectId, itemId, "Artifact", form.storyType === "Spike" ? "Doc" : form.artifact);
  await updateProjectSingleSelect(projectId, itemId, "Story Type", form.storyType || "Story");
  await updateProjectSingleSelect(projectId, itemId, "Kanban Status", "Backlog");

  return listProjectStories();
}

const defaultTaskBlueprints = [
  {
    title: "Set up VM / Dev environment",
    description: "Install and verify the required SUU development environment and VM profile.",
    phase: "Day 1: Access & Environment",
    resourceTitle: "Development Environment Setup",
    resourceUrl: "#"
  },
  {
    title: "Install required tools",
    description: "Install Node.js, Git, the code editor, and required extensions.",
    phase: "Day 1: Access & Environment",
    resourceTitle: "Development Environment Setup",
    resourceUrl: "#"
  },
  {
    title: "Verify access to internal systems",
    description: "Confirm access to email, VPN, GitHub, the ticket board, and shared docs.",
    phase: "Day 1: Access & Environment",
    resourceTitle: "Common Errors & Fixes",
    resourceUrl: "#"
  },
  {
    title: "Clone repository",
    description: "Clone the main SUU IT application repository to your local machine.",
    phase: "Day 2: Repository Setup",
    resourceTitle: "Git & Branch Naming Guide",
    resourceUrl: "#"
  },
  {
    title: "Install dependencies",
    description: "Install project dependencies and verify access to package registries.",
    phase: "Day 2: Repository Setup",
    resourceTitle: "Common Errors & Fixes",
    resourceUrl: "#"
  },
  {
    title: "Run the project locally",
    description: "Start the app and confirm the local development workflow is working.",
    phase: "Day 2: Repository Setup",
    resourceTitle: "Development Environment Setup",
    resourceUrl: "#"
  },
  {
    title: "Create first branch",
    description: "Create a feature branch using the SUU IT naming convention.",
    phase: "Day 3: Git Workflow",
    resourceTitle: "Git & Branch Naming Guide",
    resourceUrl: "#"
  },
  {
    title: "Review code guidelines",
    description: "Read the coding standards, PR expectations, and review etiquette.",
    phase: "Day 3: Git Workflow",
    resourceTitle: "SUU IT Coding Standards",
    resourceUrl: "#"
  },
  {
    title: "Make first small change",
    description: "Complete a small update that helps you learn the repository structure.",
    phase: "Day 3: Git Workflow",
    resourceTitle: "SUU IT Coding Standards",
    resourceUrl: "#"
  },
  {
    title: "Submit first PR",
    description: "Open a pull request with a clear summary, scope, and testing notes.",
    phase: "Week 1: First Pull Request",
    resourceTitle: "Pull Request Checklist",
    resourceUrl: "#"
  },
  {
    title: "Attend standup meeting",
    description: "Share yesterday, today, and blockers clearly in the team standup.",
    phase: "Week 1: First Pull Request",
    resourceTitle: "Standup Meeting Guide",
    resourceUrl: "#"
  },
  {
    title: "Respond to code review feedback",
    description: "Work through review comments and communicate updates professionally.",
    phase: "Week 1: First Pull Request",
    resourceTitle: "Code Review Expectations",
    resourceUrl: "#"
  },
  {
    title: "Get code review approved",
    description: "Address remaining comments and get a mentor or reviewer approval.",
    phase: "Week 1: First Pull Request",
    resourceTitle: "Code Review Expectations",
    resourceUrl: "#"
  },
  {
    title: "Pick first starter issue",
    description: "Choose an onboarding-friendly issue that matches your current skills.",
    phase: "Week 2: Independent Starter Issue",
    resourceTitle: "Pull Request Checklist",
    resourceUrl: "#"
  },
  {
    title: "Document one thing learned",
    description: "Capture one useful lesson to help the next SUU student programmer ramp faster.",
    phase: "Week 2: Independent Starter Issue",
    resourceTitle: "SUU IT Coding Standards",
    resourceUrl: "#"
  },
  {
    title: "Complete onboarding reflection",
    description: "Summarize what you learned, what was confusing, and what documentation should improve.",
    phase: "Week 2: Independent Starter Issue",
    resourceTitle: "Standup Meeting Guide",
    resourceUrl: "#"
  }
];

const phaseOrder = [
  "Day 1: Access & Environment",
  "Day 2: Repository Setup",
  "Day 3: Git Workflow",
  "Week 1: First Pull Request",
  "Week 2: Independent Starter Issue"
];

const phaseMap = {
  "Day 1: Environment Setup": "Day 1: Access & Environment",
  "First Week: Team Workflow": "Week 1: First Pull Request",
  Productivity: "Week 2: Independent Starter Issue"
};

const seedProfiles = [
  {
    id: "stu-001",
    name: "Alex Johnson",
    email: "alex.johnson@suu.edu",
    mentor: "Morgan Lee",
    mentorEmail: "morgan.lee@suu.edu",
    mentorRole: "Senior Developer",
    team: "SUU IT Software Services",
    startDate: "2026-04-21",
    statuses: new Array(16).fill("completed"),
    notes: {},
    reflection: {
      learned: "I learned the PR workflow and how our internal tooling is organized.",
      confusing: "The initial environment setup guide could use one screenshot per step.",
      helpNeeded: "None right now. I am ready for a starter issue.",
      documentation: "Add a short troubleshooting section for branch naming examples."
    }
  },
  {
    id: "stu-002",
    name: "Maria Lopez",
    email: "maria.lopez@suu.edu",
    mentor: "Dana Rivera",
    mentorEmail: "dana.rivera@suu.edu",
    mentorRole: "Technical Lead",
    team: "SUU IT Software Services",
    startDate: "2026-04-22",
    statuses: new Array(16).fill("completed"),
    notes: { "task-016": "Reflection submitted after finishing my first approved pull request." },
    reflection: {
      learned: "I learned how to move changes from a branch into a reviewed PR.",
      confusing: "It took time to understand which docs were team-wide versus project-specific.",
      helpNeeded: "I would like feedback on my first assigned issue.",
      documentation: "Combine the PR checklist and review expectations into one launch page."
    }
  },
  {
    id: "stu-003",
    name: "Ethan Brown",
    email: "ethan.brown@suu.edu",
    mentor: "Morgan Lee",
    mentorEmail: "morgan.lee@suu.edu",
    mentorRole: "Senior Developer",
    team: "SUU IT Software Services",
    startDate: "2026-04-26",
    statuses: ["completed", "completed", "completed", "completed", "completed", "completed", "completed", "completed", "in-progress", "not-started", "completed", "not-started", "not-started", "in-progress", "not-started", "not-started"],
    notes: { "task-009": "I am not sure which branch name format to use for my first small change." },
    reflection: { learned: "", confusing: "", helpNeeded: "", documentation: "" }
  },
  {
    id: "stu-004",
    name: "Sofia Martinez",
    email: "sofia.martinez@suu.edu",
    mentor: "Evelyn Brooks",
    mentorEmail: "evelyn.brooks@suu.edu",
    mentorRole: "Engineering Manager",
    team: "SUU IT Software Services",
    startDate: "2026-04-24",
    statuses: ["completed", "completed", "completed", "completed", "completed", "completed", "completed", "completed", "completed", "in-progress", "completed", "not-started", "not-started", "in-progress", "not-started", "not-started"],
    notes: { "task-010": "Waiting for code review feedback before I move the PR forward." },
    reflection: { learned: "", confusing: "", helpNeeded: "", documentation: "" }
  },
  {
    id: "stu-005",
    name: "Daniel Kim",
    email: "daniel.kim@suu.edu",
    mentor: "Dana Rivera",
    mentorEmail: "dana.rivera@suu.edu",
    mentorRole: "Technical Lead",
    team: "SUU IT Software Services",
    startDate: "2026-04-27",
    statuses: ["completed", "completed", "completed", "completed", "completed", "completed", "completed", "completed", "completed", "in-progress", "completed", "in-progress", "not-started", "not-started", "not-started", "not-started"],
    notes: { "task-012": "I responded to comments, but I want to make sure the reviewer sees the updates." },
    reflection: { learned: "", confusing: "", helpNeeded: "", documentation: "" }
  },
  {
    id: "stu-006",
    name: "Priya Patel",
    email: "priya.patel@suu.edu",
    mentor: "Morgan Lee",
    mentorEmail: "morgan.lee@suu.edu",
    mentorRole: "Senior Developer",
    team: "SUU IT Software Services",
    startDate: "2026-04-28",
    statuses: ["completed", "completed", "completed", "completed", "blocked", "not-started", "not-started", "not-started", "not-started", "not-started", "completed", "not-started", "not-started", "not-started", "not-started", "not-started"],
    notes: { "task-005": "npm install fails with a dependency error after switching Node versions." },
    reflection: { learned: "", confusing: "", helpNeeded: "", documentation: "" }
  },
  {
    id: "stu-007",
    name: "Jordan Smith",
    email: "jordan.smith@suu.edu",
    mentor: "Evelyn Brooks",
    mentorEmail: "evelyn.brooks@suu.edu",
    mentorRole: "Engineering Manager",
    team: "SUU IT Software Services",
    startDate: "2026-04-25",
    statuses: ["completed", "completed", "blocked", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "completed", "not-started", "not-started", "not-started", "not-started", "not-started"],
    notes: { "task-003": "I cannot access the repo yet because my GitHub organization invite is still pending." },
    reflection: { learned: "", confusing: "", helpNeeded: "", documentation: "" }
  },
  {
    id: "stu-008",
    name: "Camila Torres",
    email: "camila.torres@suu.edu",
    mentor: "Dana Rivera",
    mentorEmail: "dana.rivera@suu.edu",
    mentorRole: "Technical Lead",
    team: "SUU IT Software Services",
    startDate: "2026-04-29",
    statuses: ["completed", "in-progress", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started"],
    notes: { "task-002": "My VM is running slowly and I am still installing the required editor extensions." },
    reflection: { learned: "", confusing: "", helpNeeded: "", documentation: "" }
  },
  {
    id: "stu-009",
    name: "Noah Wilson",
    email: "noah.wilson@suu.edu",
    mentor: "Morgan Lee",
    mentorEmail: "morgan.lee@suu.edu",
    mentorRole: "Senior Developer",
    team: "SUU IT Software Services",
    startDate: "2026-04-29",
    statuses: ["in-progress", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started", "not-started"],
    notes: { "task-001": "I am just getting started and still working through the VM setup checklist." },
    reflection: { learned: "", confusing: "", helpNeeded: "", documentation: "" }
  },
  {
    id: "stu-010",
    name: "Emily Anderson",
    email: "emily.anderson@suu.edu",
    mentor: "Evelyn Brooks",
    mentorEmail: "evelyn.brooks@suu.edu",
    mentorRole: "Engineering Manager",
    team: "SUU IT Software Services",
    startDate: "2026-04-23",
    statuses: ["completed", "completed", "completed", "completed", "completed", "blocked", "completed", "completed", "in-progress", "not-started", "completed", "not-started", "not-started", "not-started", "not-started", "not-started"],
    notes: { "task-006": "The app starts, but I see a missing environment variable error on the landing page." },
    reflection: { learned: "", confusing: "", helpNeeded: "", documentation: "" }
  }
];

async function readStudents() {
  const raw = await fs.readFile(dataFile, "utf-8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.length || !parsed[0].mentorEmail) {
    return buildSeedStudents();
  }
  return parsed;
}

async function writeStudents(students) {
  await fs.writeFile(dataFile, JSON.stringify(students, null, 2));
}

function normalizeTask(task) {
  const status = task.status || (task.completed ? "completed" : "not-started");
  return {
    ...task,
    phase: phaseMap[task.phase] || task.phase,
    status,
    completed: status === "completed"
  };
}

function normalizeStudent(student) {
  const mentorName = student.mentor || "Unassigned";
  return {
    ...student,
    team: student.team || "SUU IT Software Services",
    mentor: mentorName,
    mentorEmail:
      student.mentorEmail ||
      `${mentorName.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.+|\.+$/g, "") || "mentor"}@suu.edu`,
    mentorRole: student.mentorRole || "Mentor",
    reflection: student.reflection || {
      learned: "",
      confusing: "",
      helpNeeded: "",
      documentation: ""
    },
    tasks: (student.tasks || []).map(normalizeTask)
  };
}

function createDefaultTasks() {
  return defaultTaskBlueprints.map((task, index) => ({
    id: `task-${String(index + 1).padStart(3, "0")}`,
    ...task,
    status: "not-started",
    completed: false,
    note: ""
  }));
}

function buildSeedStudents() {
  return seedProfiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: "Student Programmer",
    startDate: profile.startDate,
    mentor: profile.mentor,
    mentorEmail: profile.mentorEmail,
    mentorRole: profile.mentorRole,
    team: profile.team,
    reflection: profile.reflection,
    tasks: defaultTaskBlueprints.map((task, index) => {
      const id = `task-${String(index + 1).padStart(3, "0")}`;
      const status = profile.statuses[index];
      return {
        id,
        ...task,
        status,
        completed: status === "completed",
        note: profile.notes[id] || ""
      };
    })
  }));
}

function createStudentId(students) {
  const maxId = students.reduce((max, student) => {
    const numeric = Number(student.id.replace("stu-", ""));
    return Number.isNaN(numeric) ? max : Math.max(max, numeric);
  }, 0);

  return `stu-${String(maxId + 1).padStart(3, "0")}`;
}

function getProgress(student) {
  const total = student.tasks.length || 1;
  const completed = student.tasks.filter((task) => task.status === "completed").length;
  return Math.round((completed / total) * 100);
}

function getBlockers(student) {
  return student.tasks.filter((task) => task.status === "blocked");
}

function buildBlockerResponse({ studentName, taskTitle, taskDescription, note, action }) {
  const haystack = `${taskTitle} ${taskDescription} ${note}`.toLowerCase();

  const templates = [
    {
      keywords: ["vm", "environment", "setup"],
      summary: `The issue looks like an environment setup problem that is preventing ${studentName} from getting a stable development workflow running.`,
      possibleCauses: [
        "The VM image or environment bootstrap did not complete cleanly",
        "Required permissions or network access are still missing",
        "The installed tool versions do not match the onboarding guide"
      ],
      recommendedSteps: [
        "Restart the VM or terminal session and verify network connectivity",
        "Recheck each step in the setup guide against the current machine state",
        "Capture the exact error message or screenshot before retrying",
        "Ask the mentor to confirm required access and approved tool versions"
      ]
    },
    {
      keywords: ["clone", "repository", "repo", "github", "ssh"],
      summary: `The blocker appears tied to repository access or Git authentication rather than the coding task itself.`,
      possibleCauses: [
        "GitHub or repository access has not been granted yet",
        "SSH keys or HTTPS credentials are not configured correctly",
        "The repository URL was copied incorrectly"
      ],
      recommendedSteps: [
        "Verify the repository URL and confirm the correct org or project access",
        "Check whether the SSH key is uploaded and recognized by GitHub",
        "Try an HTTPS clone if the SSH path is failing",
        "Send the full terminal error to the mentor for faster troubleshooting"
      ]
    },
    {
      keywords: ["dependencies", "npm", "install", "package"],
      summary: `This looks like a dependency installation issue, which usually points to version mismatches or a failed package install.`,
      possibleCauses: [
        "Node.js or npm version is different from the project's expected version",
        "A previous install left a corrupted dependency tree",
        "The project is missing required environment variables or registry access"
      ],
      recommendedSteps: [
        "Run node -v and npm -v and compare them to the project requirements",
        "Review the first meaningful error in the install log instead of the final stack trace",
        "If the mentor approves, clear the local install state and reinstall dependencies",
        "Share the full install error output rather than a partial screenshot"
      ]
    },
    {
      keywords: ["pr", "pull request", "review", "branch"],
      summary: `The issue appears to be in the Git workflow or pull request process, not the implementation itself.`,
      possibleCauses: [
        "The branch was not pushed or the target branch is incorrect",
        "Required checks are failing",
        "Review feedback has not been fully addressed"
      ],
      recommendedSteps: [
        "Confirm the branch is pushed and the PR targets the correct base branch",
        "Open the failing checks and identify the first actionable error",
        "Reply to review comments with the changes made or the question still open",
        "Ask for a quick mentor review if the workflow is unclear"
      ]
    },
    {
      keywords: ["access", "internal systems", "vpn", "permission"],
      summary: `This blocker likely comes from access provisioning, which can stall onboarding even when the student is otherwise ready to move forward.`,
      possibleCauses: [
        "One or more internal systems are not provisioned yet",
        "VPN or single sign-on is not configured correctly",
        "The student has the wrong account or group membership"
      ],
      recommendedSteps: [
        "List which systems are accessible and which still fail",
        "Confirm the student is signing in with the correct account",
        "Test VPN or SSO access separately from the application workflow",
        "Escalate the missing permissions with exact system names"
      ]
    },
    {
      keywords: ["standup"],
      summary: `This is less of a technical blocker and more of a team workflow uncertainty.`,
      possibleCauses: [
        "The student is unsure what level of detail to share",
        "They do not yet have a clear update for yesterday, today, and blockers"
      ],
      recommendedSteps: [
        "Prepare one sentence for yesterday, one for today, and one for blockers",
        "Keep the update concise and focus on what changed since the last standup",
        "Mention blockers clearly so the team can unblock them early"
      ]
    }
  ];

  const matched = templates.find((template) =>
    template.keywords.some((keyword) => haystack.includes(keyword))
  );

  const fallback = {
    summary: `The blocker needs a short troubleshooting loop to separate missing context from a real technical issue.`,
    possibleCauses: [
      "The next onboarding step is not clearly defined",
      "Documentation is missing one key prerequisite",
      "A hidden access or environment issue is slowing progress"
    ],
    recommendedSteps: [
      "Write down the exact step that failed and the expected result",
      "Capture any error text, screenshot, or command output",
      "Compare the current state with the onboarding guide or teammate example",
      "Ask the mentor for a quick checkpoint with the evidence collected"
    ]
  };

  const response = matched || fallback;

  if (action === "explain") {
    return {
      title: "Task Explanation",
      summary: `This onboarding task helps ${studentName} complete a required milestone before moving deeper into the SUU IT workflow.`,
      possibleCauses: [
        "The expected outcome for the task may not be fully clear yet",
        "Documentation may be missing one concrete example or screenshot"
      ],
      recommendedSteps: [
        `Clarify the exact outcome expected for "${taskTitle}"`,
        "Use the linked documentation first, then compare with a teammate example",
        "Add a short note describing what is still unclear"
      ],
      messageToMentor: `Hi Mentor, I am working on "${taskTitle}" and would like to confirm the expected outcome before I continue. I have reviewed: ${note || "the onboarding guide so far"}. Could you help me verify the right next step?`
    };
  }

  if (action === "draft-message") {
    return {
      title: "Mentor Message Draft",
      summary: "A concise mentor message is ready to send.",
      possibleCauses: response.possibleCauses,
      recommendedSteps: [
        "Attach screenshots or command output if you already have them",
        "State what you expected to happen and what happened instead"
      ],
      messageToMentor: `Hi Mentor, I am currently working on "${taskTitle}" and need help with the next step. I tried: ${note || "the documented onboarding steps so far"}. Could you help me verify what I should do next? I can share screenshots or terminal output if needed.`
    };
  }

  return {
    title: "Blocker Help",
    summary: response.summary,
    possibleCauses: response.possibleCauses,
    recommendedSteps: response.recommendedSteps,
    messageToMentor: `Hi Mentor, I am currently blocked on "${taskTitle}". I tried: ${note || "the documented onboarding steps so far"}. Could you help me verify the next step? I can share screenshots or terminal output if helpful.`
  };
}

function buildManagerSummary(students = []) {
  const totalStudents = students.length || 1;
  const progressValues = students.map(getProgress);
  const averageProgress = Math.round(
    progressValues.reduce((sum, value) => sum + value, 0) / totalStudents
  );
  const blockedStudents = students.filter((student) => getBlockers(student).length > 0);
  const completedStudents = students.filter((student) => getProgress(student) === 100);
  const atRiskStudents = students.filter(
    (student) => getProgress(student) < 30 || getBlockers(student).length > 0
  );

  const blockedPhases = blockedStudents
    .flatMap((student) => getBlockers(student))
    .reduce((acc, task) => {
      acc[task.phase] = (acc[task.phase] || 0) + 1;
      return acc;
    }, {});

  const commonBlockedPhase = Object.entries(blockedPhases).sort((a, b) => b[1] - a[1])[0];

  const wins = [];
  if (completedStudents.length > 0) {
    wins.push(
      `${completedStudents.length} student${completedStudents.length === 1 ? "" : "s"} reached 100% onboarding completion`
    );
  }

  const prStudents = students.filter((student) =>
    student.tasks.some((task) => task.title === "Submit first PR" && task.status === "completed")
  );
  if (prStudents.length > 0) {
    wins.push(
      `${prStudents.length} student${prStudents.length === 1 ? "" : "s"} successfully submitted a first pull request`
    );
  }

  if (averageProgress >= 65) {
    wins.push(`Average onboarding progress is healthy at ${averageProgress}%`);
  }

  const risks = [];
  if (blockedStudents.length > 0) {
    risks.push(
      `${blockedStudents.length} student${blockedStudents.length === 1 ? "" : "s"} currently have active blockers`
    );
  }

  const belowThirty = students.filter((student) => getProgress(student) < 30);
  if (belowThirty.length > 0) {
    risks.push(
      `${belowThirty.length} student${belowThirty.length === 1 ? "" : "s"} remain below 30% completion and need closer follow-up`
    );
  }

  if (commonBlockedPhase) {
    risks.push(`The most common blocker phase is ${commonBlockedPhase[0]}`);
  }

  const recommendedActions = [];
  if (blockedStudents.length > 0) {
    recommendedActions.push("Pair blocked students with mentors for 15-minute troubleshooting sessions");
  }
  if (commonBlockedPhase && commonBlockedPhase[0] === phaseOrder[0]) {
    recommendedActions.push("Review environment setup documentation and permissions before the next cohort starts");
  }
  if (students.some((student) => getProgress(student) < 30)) {
    recommendedActions.push("Check in with lower-progress students and clarify the next highest-priority task");
  }
  if (recommendedActions.length === 0) {
    recommendedActions.push("Maintain the current onboarding cadence and keep documenting what is working well");
  }

  return {
    teamSnapshot: `SUU onboarding is at ${averageProgress}% average completion across ${students.length} student programmers. ${completedStudents.length} student${completedStudents.length === 1 ? "" : "s"} have finished onboarding, while ${blockedStudents.length} currently have active blockers.`,
    studentsNeedingAttention: atRiskStudents.map(
      (student) =>
        `${student.name} - ${getProgress(student)}% complete with ${getBlockers(student).length} active blocker${getBlockers(student).length === 1 ? "" : "s"}`
    ),
    commonBlockers: risks.length ? risks : ["No major recurring blocker pattern detected this week."],
    suggestedManagerActions: recommendedActions,
    winsThisWeek: wins,
    nextWeekFocus: [
      "Move blocked students through access and setup issues first",
      "Help mid-progress students reach their first PR milestone",
      "Use reflections to tighten documentation before the next onboarding cycle"
    ],
    summary: `SUU onboarding is at ${averageProgress}% average completion across ${students.length} student programmers.`,
    risks,
    recommendedActions,
    wins
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "SUU Student Onboarding API running" });
});

app.get("/api/students", async (_req, res) => {
  const students = await readStudents();
  res.json(students.map(normalizeStudent));
});

app.get("/api/students/:id", async (req, res) => {
  const students = await readStudents();
  const student = students.find((item) => item.id === req.params.id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(normalizeStudent(student));
});

app.post("/api/students", async (req, res) => {
  const {
    name,
    email,
    mentor = "Unassigned",
    mentorEmail = "mentor@suu.edu",
    mentorRole = "Mentor",
    team = "SUU IT Software Services"
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const students = await readStudents();
  const newStudent = {
    id: createStudentId(students),
    name,
    email,
    role: "Student Programmer",
    startDate: new Date().toISOString().split("T")[0],
    mentor,
    mentorEmail,
    mentorRole,
    team,
    reflection: {
      learned: "",
      confusing: "",
      helpNeeded: "",
      documentation: ""
    },
    tasks: createDefaultTasks()
  };

  students.push(newStudent);
  await writeStudents(students);

  res.status(201).json(normalizeStudent(newStudent));
});

app.patch("/api/students/:id/tasks/:taskId", async (req, res) => {
  const students = await readStudents();
  const student = students.find((item) => item.id === req.params.id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const task = student.tasks.find((item) => item.id === req.params.taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const updates = req.body;
  if (updates.status) {
    task.status = updates.status;
    task.completed = updates.status === "completed";
  }

  if (typeof updates.completed === "boolean" && !updates.status) {
    task.completed = updates.completed;
    task.status = updates.completed ? "completed" : task.status === "completed" ? "not-started" : task.status;
  }

  if (typeof updates.note === "string") {
    task.note = updates.note;
  }

  if (task.status !== "completed") {
    task.completed = false;
  }

  await writeStudents(students);
  res.json(normalizeStudent(student));
});

app.patch("/api/students/:id", async (req, res) => {
  const students = await readStudents();
  const student = students.find((item) => item.id === req.params.id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  ["name", "email", "mentor", "mentorEmail", "mentorRole", "team"].forEach((field) => {
    if (typeof req.body[field] === "string" && req.body[field].trim()) {
      student[field] = req.body[field].trim();
    }
  });

  if (req.body.reflection && typeof req.body.reflection === "object") {
    student.reflection = {
      ...(student.reflection || {}),
      ...req.body.reflection
    };
  }

  await writeStudents(students);
  res.json(normalizeStudent(student));
});

app.delete("/api/students/:id", async (req, res) => {
  const students = await readStudents();
  const nextStudents = students.filter((student) => student.id !== req.params.id);

  if (nextStudents.length === students.length) {
    return res.status(404).json({ message: "Student not found" });
  }

  await writeStudents(nextStudents);
  res.status(204).send();
});

app.get("/api/github/issues", async (_req, res, next) => {
  try {
    const config = getGitHubConfig();
    if (!config) {
      return res.status(503).json({ message: "GitHub integration is not configured" });
    }

    const issues = await fetchGitHub(
      `/repos/${config.owner}/${config.repo}/issues?state=all&per_page=50`
    );
    const normalizedIssues = issues
      .filter((issue) => !issue.pull_request)
      .map(normalizeGitHubIssue);

    res.json(normalizedIssues);
  } catch (error) {
    next(error);
  }
});

app.get("/api/github/pulls", async (_req, res, next) => {
  try {
    const config = getGitHubConfig();
    if (!config) {
      return res.status(503).json({ message: "GitHub integration is not configured" });
    }

    const pullRequests = await fetchGitHub(
      `/repos/${config.owner}/${config.repo}/pulls?state=all&per_page=50`
    );

    res.json(pullRequests.map(normalizeGitHubPullRequest));
  } catch (error) {
    next(error);
  }
});

app.get("/api/github/progress", async (_req, res, next) => {
  try {
    const config = getGitHubConfig();
    if (!config) {
      return res.status(503).json({ message: "GitHub integration is not configured" });
    }

    const [issues, pullRequests] = await Promise.all([
      fetchGitHub(`/repos/${config.owner}/${config.repo}/issues?state=all&per_page=50`),
      fetchGitHub(`/repos/${config.owner}/${config.repo}/pulls?state=all&per_page=50`)
    ]);

    res.json({
      issues: issues.filter((issue) => !issue.pull_request).map(normalizeGitHubIssue),
      pullRequests: pullRequests.map(normalizeGitHubPullRequest)
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/github/project", async (_req, res, next) => {
  try {
    res.json(await listProjectStories());
  } catch (error) {
    next(error);
  }
});

app.patch("/api/github/project/items/:itemId/status", async (req, res, next) => {
  try {
    const projectId = await resolveProjectId();
    const statusName = statusToProjectName[req.body.status] || req.body.status;

    if (!statusName) {
      return res.status(400).json({ message: "Status is required" });
    }

    await updateProjectSingleSelect(projectId, req.params.itemId, "Kanban Status", statusName);
    res.json({ itemId: req.params.itemId, status: req.body.status });
  } catch (error) {
    next(error);
  }
});

app.post("/api/github/project/issues", async (req, res, next) => {
  try {
    res.status(201).json(await createProjectStory(req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/ai/blocker-help", (req, res) => {
  res.json(buildBlockerResponse(req.body));
});

app.post("/api/ai/work-guide", async (req, res, next) => {
  try {
    const { boardJSON, phase, blockers, prs } = req.body || {};
    const prompt = `You are a senior developer mentor for a university IT team using Kanban.
The student's current board state is: ${JSON.stringify(boardJSON)}
Their onboarding phase is: ${phase}
Their open blockers are: ${JSON.stringify(blockers)}
Their recent PRs: ${JSON.stringify(prs)}

Respond with a short, direct answer (3-5 sentences max) covering:
1. The one story they should pick up next and why
2. Whether any story needs splitting (>5 days in column)
3. Any blocker they need to escalate today
Speak directly to the student. Be specific, not generic.`;

    const message = await askOpenAI(prompt);
    res.json({ message });
  } catch (error) {
    next(error);
  }
});

app.post("/api/ai/manager-summary", async (req, res, next) => {
  const { students = [], stories = [], epics = [], githubPullRequests = [] } = req.body || {};

  if (!stories.length || !epics.length) {
    return res.json(buildManagerSummary(students));
  }

  try {
    const prompt = `You are an AI work-management assistant preparing a manager weekly report for the SUU IT student programmer team.
Use all students' Kanban board states, epics on track versus at risk, stories stuck in Blocked or In Review for 3+ days, students with no activity this week, and recommended manager actions.

Students: ${JSON.stringify(students)}
Stories: ${JSON.stringify(stories)}
Epics: ${JSON.stringify(epics)}
Recent PRs: ${JSON.stringify(githubPullRequests)}

Output exactly this format:
## This Week: [Date Range]
**Wins:** [1-3 bullet points of shipped stories/PRs]
**At Risk:** [epics or students needing attention]
**Blockers to Resolve:** [specific blockers with student names]
**Recommended Actions:** [3 concrete things the manager should do Monday morning]`;

    const message = await askOpenAI(prompt);
    res.json({
      weekRange: "AI Generated",
      teamSnapshot: message,
      winsThisWeek: [message],
      atRisk: [],
      blockersToResolve: [],
      recommendedActions: []
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`SUU Student Onboarding API running on port ${PORT}`);
});
