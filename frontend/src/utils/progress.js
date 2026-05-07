export function getCompletedCount(tasks = []) {
  return tasks.filter((task) => task.status === "completed").length;
}

export function getProgressPercent(tasks = []) {
  if (!tasks.length) {
    return 0;
  }

  return Math.round((getCompletedCount(tasks) / tasks.length) * 100);
}

export function getTasksRemaining(tasks = []) {
  return Math.max(tasks.length - getCompletedCount(tasks), 0);
}

export function getBlockedCount(tasks = []) {
  return tasks.filter((task) => task.status === "blocked").length;
}

export function groupTasksByPhase(tasks = []) {
  return tasks.reduce((acc, task) => {
    if (!acc[task.phase]) {
      acc[task.phase] = [];
    }

    acc[task.phase].push(task);
    return acc;
  }, {});
}

export const onboardingTimeline = [
  "Day 1: Access & Environment",
  "Day 2: Repository Setup",
  "Day 3: Git Workflow",
  "Week 1: First Pull Request",
  "Week 2: Independent Starter Issue"
];

export function getPhaseTimeline(tasks = []) {
  return onboardingTimeline.map((phase, index) => {
    const phaseTasks = tasks.filter((task) => task.phase === phase);
    const completed = phaseTasks.filter((task) => task.status === "completed").length;
    const blocked = phaseTasks.filter((task) => task.status === "blocked").length;
    const inProgress = phaseTasks.filter((task) => task.status === "in-progress").length;

    let status = "not-started";
    if (completed === phaseTasks.length && phaseTasks.length > 0) {
      status = "completed";
    } else if (blocked > 0) {
      status = "blocked";
    } else if (inProgress > 0 || completed > 0) {
      status = "in-progress";
    }

    return {
      phase,
      index,
      total: phaseTasks.length,
      completed,
      blocked,
      status
    };
  });
}

export function getCurrentTask(tasks = []) {
  return (
    tasks.find((task) => task.status === "blocked") ||
    tasks.find((task) => task.status === "in-progress") ||
    tasks.find((task) => task.status === "not-started") ||
    null
  );
}

export function getCurrentPhase(tasks = []) {
  return getCurrentTask(tasks)?.phase || onboardingTimeline[onboardingTimeline.length - 1];
}

export function getNextAction(tasks = []) {
  const blockedTask = tasks.find((task) => task.status === "blocked");
  if (blockedTask) {
    return `Unblock "${blockedTask.title}"`;
  }

  const inProgressTask = tasks.find((task) => task.status === "in-progress");
  if (inProgressTask) {
    return `Finish "${inProgressTask.title}"`;
  }

  const nextTask = tasks.find((task) => task.status === "not-started");
  if (nextTask) {
    return `Start "${nextTask.title}"`;
  }

  return "Ready for a starter issue";
}
