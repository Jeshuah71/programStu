import { daysAgo } from "./utils/workManagement";

export const mockEpics = [
  {
    id: "epic-fraud-reporting",
    title: "Fraud Reporting Intake",
    description: "Build a clearer intake path for suspicious account activity reports from campus stakeholders.",
    startDate: "2026-04-28",
    endDate: "2026-06-14",
    owner: "Morgan Lee"
  },
  {
    id: "epic-onboarding-automation",
    title: "Onboarding Automation",
    description: "Reduce setup friction by automating repeatable student programmer onboarding checks.",
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    owner: "Dana Rivera"
  },
  {
    id: "epic-reporting-dashboard",
    title: "Operations Reporting Dashboard",
    description: "Give managers lightweight visibility into work movement, review queues, and blocked work.",
    startDate: "2026-05-06",
    endDate: "2026-07-10",
    owner: "Evelyn Brooks"
  }
];

export const mockStories = [
  {
    id: "story-101",
    title: "Draft fraud report intake story map",
    epicId: "epic-fraud-reporting",
    assigneeStudentId: "stu-001",
    artifact: "Doc",
    storyType: "Spike",
    status: "done",
    estimateDays: 2,
    movedAt: daysAgo(4),
    overview: "Investigate the current intake process and document the smallest workflow that helps stakeholders report fraud concerns clearly.",
    why: "The team needs shared context before building intake UI.",
    problem: "Reports arrive through inconsistent channels.",
    requestedBy: "Security operations",
    acceptanceCriteria: ["Current intake paths are documented", "Risks and open questions are listed"],
    artifactLink: "https://docs.example.edu/fraud-intake-map",
    verification: "Mentor approved the discovery doc."
  },
  {
    id: "story-102",
    title: "Add fraud report form validation",
    epicId: "epic-fraud-reporting",
    assigneeStudentId: "stu-003",
    artifact: "PR",
    storyType: "Story",
    status: "ready",
    estimateDays: 3,
    movedAt: daysAgo(1),
    overview: "Add required field and format validation to the fraud report form so reports arrive with enough context for triage.",
    why: "Triage loses time chasing missing details.",
    problem: "Incomplete submissions delay security review.",
    requestedBy: "Security operations",
    acceptanceCriteria: ["Required fields show clear errors", "Email fields reject invalid formats", "Tests cover the validation helper"],
    dependencies: "Story map discovery doc",
    artifactLink: "",
    verification: "PR with form tests and screenshots."
  },
  {
    id: "story-103",
    title: "Connect fraud report submission to queue",
    epicId: "epic-fraud-reporting",
    assigneeStudentId: "stu-004",
    artifact: "PR",
    storyType: "Story",
    status: "in-review",
    estimateDays: 4,
    movedAt: daysAgo(5),
    overview: "Send validated fraud reports to the service queue with a normalized payload.",
    why: "The intake form needs to create actionable work for staff.",
    problem: "Reports are not reliably visible in the queue.",
    requestedBy: "Security operations",
    acceptanceCriteria: ["Queue payload includes reporter, category, and notes", "Submission failure displays a retry state"],
    dependencies: "Queue API token",
    artifactLink: "https://github.com/suu-it/service-desk/pull/142",
    verification: "PR linked to test queue evidence."
  },
  {
    id: "story-201",
    title: "Script local environment verification",
    epicId: "epic-onboarding-automation",
    assigneeStudentId: "stu-006",
    artifact: "Runbook",
    storyType: "Story",
    status: "blocked",
    estimateDays: 4,
    movedAt: daysAgo(6),
    overview: "Create a repeatable runbook for checking Node, npm, Git, VPN, and repo access.",
    why: "Students hit the same setup blockers in their first week.",
    problem: "Mentors spend time rediscovering environment issues.",
    requestedBy: "Student mentors",
    acceptanceCriteria: ["Runbook covers required versions", "Failure output tells students what to send mentors"],
    blockedReason: "Needs final approved Node version from platform team.",
    artifactLink: "",
    verification: "Runbook tested by one new student."
  },
  {
    id: "story-202",
    title: "Create first PR checklist issue template",
    epicId: "epic-onboarding-automation",
    assigneeStudentId: "stu-005",
    artifact: "Config",
    storyType: "Story",
    status: "in-progress",
    estimateDays: 6,
    movedAt: daysAgo(7),
    overview: "Add a GitHub issue template that guides students through their first PR checklist.",
    why: "The checklist should live where the work starts.",
    problem: "Students miss PR context and testing notes.",
    requestedBy: "Dana Rivera",
    acceptanceCriteria: ["Template includes summary, testing, screenshots, and mentor questions", "Template renders correctly in GitHub"],
    artifactLink: "https://github.com/suu-it/student-portal/pull/118",
    verification: "Merged template config."
  },
  {
    id: "story-203",
    title: "Document worktree workflow for starter issues",
    epicId: "epic-onboarding-automation",
    assigneeStudentId: "stu-008",
    artifact: "Doc",
    storyType: "Story",
    status: "ready",
    estimateDays: 2,
    movedAt: daysAgo(0),
    overview: "Write a starter guide showing how to create one worktree per story.",
    why: "Students need a clean way to switch between onboarding and starter issue work.",
    problem: "Branch switching creates confusion and unstaged changes.",
    requestedBy: "Mentors",
    acceptanceCriteria: ["Guide includes copy-paste command", "Guide explains where to run the command"],
    artifactLink: "",
    verification: "Doc reviewed by one mentor."
  },
  {
    id: "story-301",
    title: "Add review queue chart to manager dashboard",
    epicId: "epic-reporting-dashboard",
    assigneeStudentId: "stu-010",
    artifact: "Dashboard",
    storyType: "Story",
    status: "in-progress",
    estimateDays: 3,
    movedAt: daysAgo(2),
    overview: "Show manager review load by status so stale PRs are easier to spot.",
    why: "Managers need a quick daily scan of review health.",
    problem: "Review bottlenecks are hidden in GitHub.",
    requestedBy: "Evelyn Brooks",
    acceptanceCriteria: ["Chart groups open PRs by review state", "Stale review count is visible"],
    artifactLink: "",
    verification: "Dashboard screenshot and PR."
  },
  {
    id: "story-302",
    title: "Backfill weekly activity query",
    epicId: "epic-reporting-dashboard",
    assigneeStudentId: "stu-002",
    artifact: "Query",
    storyType: "Story",
    status: "done",
    estimateDays: 2,
    movedAt: daysAgo(10),
    overview: "Create a query that finds students with no issue or PR movement this week.",
    why: "Managers need to notice quiet weeks earlier.",
    problem: "No-activity students are found manually.",
    requestedBy: "Evelyn Brooks",
    acceptanceCriteria: ["Query returns student, last activity date, and assigned mentor", "Query excludes archived students"],
    artifactLink: "https://queries.example.edu/student-weekly-activity",
    verification: "Query result reviewed in manager meeting."
  },
  {
    id: "story-303",
    title: "Refine blocker escalation labels",
    epicId: "epic-reporting-dashboard",
    assigneeStudentId: "stu-007",
    artifact: "Config",
    storyType: "Story",
    status: "backlog",
    estimateDays: 2,
    movedAt: daysAgo(3),
    overview: "Define labels that distinguish access, environment, review, and dependency blockers.",
    why: "Blocker type should make the manager action obvious.",
    problem: "Current blocker notes are too broad.",
    requestedBy: "Mentor group",
    acceptanceCriteria: ["Labels are documented", "Examples show when to use each label"],
    artifactLink: "",
    verification: "Config PR or admin screenshot."
  }
];

export const mockWorktrees = [
  {
    id: "wt-001",
    studentId: "stu-003",
    storyId: "story-102",
    path: "../fraud-report-validation",
    branch: "feat/fraud-report-validation",
    status: "Ready to create"
  },
  {
    id: "wt-002",
    studentId: "stu-005",
    storyId: "story-202",
    path: "../first-pr-template",
    branch: "feat/first-pr-template",
    status: "Active"
  },
  {
    id: "wt-003",
    studentId: "stu-010",
    storyId: "story-301",
    path: "../review-queue-chart",
    branch: "feat/review-queue-chart",
    status: "Active"
  }
];

