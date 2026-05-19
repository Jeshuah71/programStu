export const KANBAN_COLUMNS = [
  {
    id: "backlog",
    title: "Backlog",
    color: "#6B7280",
    description: "Raw ideas and stakeholder asks awaiting refinement"
  },
  {
    id: "ready",
    title: "Refined / Ready",
    color: "#1B4F72",
    description: "Scope clear, ready to be picked up"
  },
  {
    id: "blocked",
    title: "Blocked",
    color: "#EA580C",
    description: "Active work with a blocker",
    wipLimit: 2
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "#2563EB",
    description: "PR open or artifact being built",
    wipLimit: 3
  },
  {
    id: "in-review",
    title: "In Review",
    color: "#F97316",
    description: "Waiting on reviewer or external dependency"
  },
  {
    id: "done",
    title: "Done",
    color: "#16A34A",
    description: "Merged or delivered"
  }
];

export const ARTIFACT_TYPES = ["PR", "Doc", "Query", "Config", "Runbook", "Dashboard"];
export const STORY_TYPES = ["Story", "Spike"];

export const COLUMN_BY_ID = KANBAN_COLUMNS.reduce((acc, column) => {
  acc[column.id] = column;
  return acc;
}, {});

const today = new Date();

export function daysAgo(days) {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function getDaysInColumn(story) {
  if (!story?.movedAt) {
    return 0;
  }

  const moved = new Date(story.movedAt);
  if (Number.isNaN(moved.getTime())) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - moved.getTime()) / 86400000));
}

export function isStoryStale(story) {
  return story.status !== "done" && getDaysInColumn(story) >= 3;
}

export function slugifyStory(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function getStudentInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function buildWorkGuideContext({ stories, epics, student, blockers, prs }) {
  const studentStories = stories.filter((story) => story.assigneeStudentId === student?.id);
  return {
    boardJSON: {
      student: student?.name,
      stories: studentStories.map((story) => ({
        id: story.id,
        title: story.title,
        epic: epics.find((epic) => epic.id === story.epicId)?.title || "Unknown epic",
        status: story.status,
        artifact: story.artifact,
        storyType: story.storyType,
        estimateDays: story.estimateDays,
        daysInColumn: getDaysInColumn(story),
        blockedReason: story.blockedReason || ""
      }))
    },
    phase: student?.tasks?.find((task) => !task.completed)?.phase || "Independent work",
    blockers,
    prs
  };
}

export function createStoryFromForm(form, students) {
  const assignee = students.find((student) => student.id === form.assigneeStudentId) || students[0];
  return {
    id: `story-${crypto.randomUUID()}`,
    title: form.title.trim(),
    epicId: form.epicId,
    assigneeStudentId: assignee?.id || "",
    artifact: form.storyType === "Spike" ? "Doc" : form.artifact,
    storyType: form.storyType,
    status: "backlog",
    estimateDays: Number(form.estimateDays) || 1,
    movedAt: new Date().toISOString(),
    overview: form.overview.trim(),
    why: form.why.trim(),
    problem: form.problem.trim(),
    requestedBy: form.requestedBy.trim(),
    acceptanceCriteria: form.acceptanceCriteria
      .split("\n")
      .map((item) => item.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean),
    constraints: form.constraints.trim(),
    dependencies: form.dependencies.trim(),
    artifactLink: form.artifactLink.trim(),
    verification: form.verification.trim(),
    followUp: form.followUp.trim()
  };
}

