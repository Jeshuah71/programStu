import { getBlockedCount, getProgressPercent, onboardingTimeline } from "./utils/progress";

function detectTopic(task) {
  const haystack = `${task.title} ${task.description} ${task.note || ""}`.toLowerCase();

  if (haystack.includes("vm") || haystack.includes("environment")) {
    return {
      causes: [
        "The VM image may not have completed setup cleanly",
        "A required tool version may not match the SUU onboarding guide",
        "VPN or internal network access may not be available yet"
      ],
      steps: [
        "Restart the VM and confirm the network adapter is working",
        "Compare installed tool versions with the SUU setup guide",
        "Capture the exact error text or screenshot before retrying",
        "Ask the mentor to verify access and approved versions"
      ]
    };
  }

  if (haystack.includes("repo") || haystack.includes("clone") || haystack.includes("github")) {
    return {
      causes: [
        "GitHub organization access may still be pending",
        "SSH or HTTPS credentials may not be configured correctly",
        "The repository URL may not match the expected SUU org path"
      ],
      steps: [
        "Confirm GitHub access and check for a pending invite",
        "Verify SSH keys or try HTTPS as a fallback",
        "Copy the full terminal error into your note for the mentor",
        "Ask the mentor to confirm the exact repo URL"
      ]
    };
  }

  if (haystack.includes("npm") || haystack.includes("dependencies") || haystack.includes("install")) {
    return {
      causes: [
        "Node or npm versions may not match the project requirements",
        "A previous install may have left a bad dependency state",
        "Environment variables or registry access may be missing"
      ],
      steps: [
        "Check node -v and npm -v against the setup guide",
        "Review the first meaningful install error, not just the final stack trace",
        "If approved, retry the install after clearing the local dependency state",
        "Send the full install error to the mentor"
      ]
    };
  }

  if (haystack.includes("pr") || haystack.includes("pull request") || haystack.includes("review")) {
    return {
      causes: [
        "The branch may not be pushed or the base branch may be wrong",
        "Required checks may still be failing",
        "Review feedback may need a follow-up reply or clarification"
      ],
      steps: [
        "Confirm the branch is pushed and the PR targets the correct base branch",
        "Open the first failing check and read the earliest actionable error",
        "Reply to review comments with what changed or where you are still stuck",
        "Ask the mentor for a quick review checkpoint"
      ]
    };
  }

  return {
    causes: [
      "The next onboarding step may not be fully clear",
      "A prerequisite may still be missing",
      "Documentation may need one more example for this task"
    ],
    steps: [
      "Write down the exact step you expected to complete",
      "Capture the output or screenshot that proves where it stopped",
      "Compare your current state to the nearest matching guide",
      "Ask the mentor for a short checkpoint with that evidence"
    ]
  };
}

export function getMockAssistantResponse({ student, task, action }) {
  const topic = detectTopic(task);
  const baseMessage = `Hi ${student.mentor}, I am currently working on "${task.title}" and need help with the next step. I tried: ${task.note || "the documented onboarding steps so far"}. Could you help me verify what I should do next? I can share screenshots or terminal output if needed.`;

  if (action === "explain") {
    return {
      title: "Task Explanation",
      summary: `This task helps ${student.name} build the next piece of the SUU onboarding workflow and reduces friction before independent work begins.`,
      possibleCauses: [
        `This task sits in the "${task.phase}" milestone and unlocks the next onboarding phase.`,
        "Managers use it to confirm the student can move through the workflow without hidden blockers."
      ],
      recommendedSteps: [
        `Focus on the expected outcome for "${task.title}" before worrying about edge cases.`,
        "Use the linked documentation first, then compare with a teammate example if anything is unclear.",
        "Add a short note in the task so the mentor can quickly spot where progress slowed down."
      ],
      messageToMentor: baseMessage
    };
  }

  if (action === "draft-message") {
    return {
      title: "Mentor Message Draft",
      summary: "A concise message is ready to send to the assigned mentor.",
      possibleCauses: topic.causes,
      recommendedSteps: [
        "Send the draft after adding any screenshots or error output you already have.",
        "Mention what you expected to happen and what happened instead."
      ],
      messageToMentor: baseMessage
    };
  }

  return {
    title: "Blocker Help",
    summary: `The issue appears to be preventing ${student.name} from moving through the ${task.phase} milestone cleanly.`,
    possibleCauses: topic.causes,
    recommendedSteps: topic.steps,
    messageToMentor: baseMessage
  };
}

export function getMockManagerSummary(students) {
  const totalStudents = students.length || 1;
  const averageProgress = Math.round(
    students.reduce((sum, student) => sum + getProgressPercent(student.tasks), 0) / totalStudents
  );
  const completed = students.filter((student) => getProgressPercent(student.tasks) === 100);
  const needingAttention = students.filter(
    (student) => getProgressPercent(student.tasks) < 30 || getBlockedCount(student.tasks) > 0
  );
  const blockers = students.flatMap((student) =>
    student.tasks
      .filter((task) => task.status === "blocked")
      .map((task) => ({ student: student.name, phase: task.phase, title: task.title }))
  );

  const phaseCounts = blockers.reduce((acc, blocker) => {
    acc[blocker.phase] = (acc[blocker.phase] || 0) + 1;
    return acc;
  }, {});

  const commonBlockers = Object.entries(phaseCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([phase, count]) => `${phase}: ${count} blocker${count === 1 ? "" : "s"}`);

  return {
    teamSnapshot: `SUU onboarding health is at ${averageProgress}% average completion across ${students.length} student programmers. ${completed.length} students are Thunderbird Ready or fully complete, while ${needingAttention.length} need follow-up or blocker support.`,
    studentsNeedingAttention: needingAttention.map(
      (student) =>
        `${student.name} - ${getProgressPercent(student.tasks)}% complete with ${getBlockedCount(student.tasks)} active blocker${getBlockedCount(student.tasks) === 1 ? "" : "s"}`
    ),
    commonBlockers:
      commonBlockers.length > 0
        ? commonBlockers
        : [`No repeated blocker phase detected across ${onboardingTimeline.length} onboarding milestones.`],
    suggestedManagerActions: [
      "Run a short unblock session for students waiting on access, npm setup, or PR workflow help.",
      "Pair lower-progress students with mentors for the next highest-priority task.",
      "Update documentation where multiple students hit the same phase friction."
    ],
    winsThisWeek: [
      `${completed.length} students are fully onboarded and ready for independent starter issues.`,
      `${students.filter((student) => student.tasks.some((task) => task.title === "Submit first PR" && task.status === "completed")).length} students reached the first PR milestone.`,
      `Team average progress remains at ${averageProgress}%.`
    ],
    nextWeekFocus: [
      "Move blocked students through access and dependency issues first.",
      "Help mid-progress students ship their first PR and close review feedback.",
      "Use reflections to tighten unclear setup and workflow documentation."
    ]
  };
}
