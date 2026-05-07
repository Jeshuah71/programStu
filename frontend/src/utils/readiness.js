import { getBlockedCount, getProgressPercent } from "./progress";

export function getReadiness(student) {
  const progress = getProgressPercent(student.tasks);
  const blockers = getBlockedCount(student.tasks);
  const firstPrDone = student.tasks.some(
    (task) => task.title === "Submit first PR" && task.status === "completed"
  );
  const reviewApproved = student.tasks.some(
    (task) => task.title === "Get code review approved" && task.status === "completed"
  );
  const reflectionDone = student.tasks.some(
    (task) => task.title === "Complete onboarding reflection" && task.status === "completed"
  );

  let score = progress;
  score -= blockers * 18;
  if (firstPrDone) {
    score += 12;
  }
  if (reviewApproved) {
    score += 10;
  }
  if (reflectionDone) {
    score += 8;
  }

  score = Math.max(0, Math.min(100, score));

  if (score >= 85) {
    return { score, label: "Thunderbird Ready", tone: "ready" };
  }
  if (score >= 60) {
    return { score, label: "Almost Ready", tone: "almost" };
  }
  if (score >= 30) {
    return { score, label: "Getting Started", tone: "starting" };
  }
  return { score, label: "Not Ready", tone: "not-ready" };
}
