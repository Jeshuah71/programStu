const documentationResources = [
  {
    id: "doc-001",
    title: "Development Environment Setup",
    category: "Environment",
    description: "VM, Node.js, editor setup, VPN access, and required SUU dev tools.",
    url: "#"
  },
  {
    id: "doc-002",
    title: "Git & Branch Naming Guide",
    category: "Git Workflow",
    description: "Branch naming patterns and commit expectations used by SUU IT Software Services.",
    url: "#"
  },
  {
    id: "doc-003",
    title: "Pull Request Checklist",
    category: "Team Workflow",
    description: "Open a clean PR with context, screenshots, and testing notes.",
    url: "#"
  },
  {
    id: "doc-004",
    title: "Code Review Expectations",
    category: "Team Workflow",
    description: "How to respond to review comments, ask clarifying questions, and close the loop.",
    url: "#"
  },
  {
    id: "doc-005",
    title: "Standup Meeting Guide",
    category: "Communication",
    description: "Share what changed yesterday, what is next today, and what needs help.",
    url: "#"
  },
  {
    id: "doc-006",
    title: "Common Errors & Fixes",
    category: "Troubleshooting",
    description: "Frequent environment, repo, package install, and PR workflow problems.",
    url: "#"
  },
  {
    id: "doc-007",
    title: "SUU IT Coding Standards",
    category: "Code Quality",
    description: "Internal conventions for readable code, testing, and maintainable pull requests.",
    url: "#"
  }
];

const taskBlueprints = [
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

function buildTasks(statuses, notes = {}) {
  return taskBlueprints.map((task, index) => {
    const id = `task-${String(index + 1).padStart(3, "0")}`;
    const status = statuses[index];
    return {
      id,
      ...task,
      status,
      completed: status === "completed",
      note: notes[id] || ""
    };
  });
}

function createReflection(learned, confusing, helpNeeded, documentation) {
  return {
    learned,
    confusing,
    helpNeeded,
    documentation
  };
}

export const mockStudents = [
  {
    id: "stu-001",
    name: "Alex Johnson",
    email: "alex.johnson@suu.edu",
    role: "Student Programmer",
    startDate: "2026-04-21",
    mentor: "Morgan Lee",
    mentorEmail: "morgan.lee@suu.edu",
    mentorRole: "Senior Developer",
    team: "SUU IT Software Services",
    reflection: createReflection(
      "I learned the PR workflow and how our internal tooling is organized.",
      "The initial environment setup guide could use one screenshot per step.",
      "None right now. I am ready for a starter issue.",
      "Add a short troubleshooting section for branch naming examples."
    ),
    tasks: buildTasks(new Array(16).fill("completed"))
  },
  {
    id: "stu-002",
    name: "Maria Lopez",
    email: "maria.lopez@suu.edu",
    role: "Student Programmer",
    startDate: "2026-04-22",
    mentor: "Dana Rivera",
    mentorEmail: "dana.rivera@suu.edu",
    mentorRole: "Technical Lead",
    team: "SUU IT Software Services",
    reflection: createReflection(
      "I learned how to move changes from a branch into a reviewed PR.",
      "It took time to understand which docs were team-wide versus project-specific.",
      "I would like feedback on my first assigned issue.",
      "Combine the PR checklist and review expectations into one launch page."
    ),
    tasks: buildTasks(
      [
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed"
      ],
      {
        "task-016": "Reflection submitted after finishing my first approved pull request."
      }
    )
  },
  {
    id: "stu-003",
    name: "Ethan Brown",
    email: "ethan.brown@suu.edu",
    role: "Student Programmer",
    startDate: "2026-04-26",
    mentor: "Morgan Lee",
    mentorEmail: "morgan.lee@suu.edu",
    mentorRole: "Senior Developer",
    team: "SUU IT Software Services",
    reflection: createReflection("", "", "", ""),
    tasks: buildTasks(
      [
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "in-progress",
        "not-started",
        "completed",
        "not-started",
        "not-started",
        "assigned",
        "not-started",
        "not-started"
      ].map((status) => (status === "assigned" ? "in-progress" : status)),
      {
        "task-009": "I am not sure which branch name format to use for my first small change."
      }
    )
  },
  {
    id: "stu-004",
    name: "Sofia Martinez",
    email: "sofia.martinez@suu.edu",
    role: "Student Programmer",
    startDate: "2026-04-24",
    mentor: "Evelyn Brooks",
    mentorEmail: "evelyn.brooks@suu.edu",
    mentorRole: "Engineering Manager",
    team: "SUU IT Software Services",
    reflection: createReflection("", "", "", ""),
    tasks: buildTasks(
      [
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "in-progress",
        "completed",
        "not-started",
        "not-started",
        "in-progress",
        "not-started",
        "not-started"
      ],
      {
        "task-010": "Waiting for code review feedback before I move the PR forward."
      }
    )
  },
  {
    id: "stu-005",
    name: "Daniel Kim",
    email: "daniel.kim@suu.edu",
    role: "Student Programmer",
    startDate: "2026-04-27",
    mentor: "Dana Rivera",
    mentorEmail: "dana.rivera@suu.edu",
    mentorRole: "Technical Lead",
    team: "SUU IT Software Services",
    reflection: createReflection("", "", "", ""),
    tasks: buildTasks(
      [
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "in-progress",
        "completed",
        "in-progress",
        "not-started",
        "not-started",
        "not-started",
        "not-started"
      ],
      {
        "task-012": "I responded to comments, but I want to make sure the reviewer sees the updates."
      }
    )
  },
  {
    id: "stu-006",
    name: "Priya Patel",
    email: "priya.patel@suu.edu",
    role: "Student Programmer",
    startDate: "2026-04-28",
    mentor: "Morgan Lee",
    mentorEmail: "morgan.lee@suu.edu",
    mentorRole: "Senior Developer",
    team: "SUU IT Software Services",
    reflection: createReflection("", "", "", ""),
    tasks: buildTasks(
      [
        "completed",
        "completed",
        "completed",
        "completed",
        "blocked",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "completed",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started"
      ],
      {
        "task-005": "npm install fails with a dependency error after switching Node versions."
      }
    )
  },
  {
    id: "stu-007",
    name: "Jordan Smith",
    email: "jordan.smith@suu.edu",
    role: "Student Programmer",
    startDate: "2026-04-25",
    mentor: "Evelyn Brooks",
    mentorEmail: "evelyn.brooks@suu.edu",
    mentorRole: "Engineering Manager",
    team: "SUU IT Software Services",
    reflection: createReflection("", "", "", ""),
    tasks: buildTasks(
      [
        "completed",
        "completed",
        "blocked",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "completed",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started"
      ],
      {
        "task-003": "I cannot access the repo yet because my GitHub organization invite is still pending."
      }
    )
  },
  {
    id: "stu-008",
    name: "Camila Torres",
    email: "camila.torres@suu.edu",
    role: "Student Programmer",
    startDate: "2026-04-29",
    mentor: "Dana Rivera",
    mentorEmail: "dana.rivera@suu.edu",
    mentorRole: "Technical Lead",
    team: "SUU IT Software Services",
    reflection: createReflection("", "", "", ""),
    tasks: buildTasks(
      [
        "completed",
        "in-progress",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started"
      ],
      {
        "task-002": "My VM is running slowly and I am still installing the required editor extensions."
      }
    )
  },
  {
    id: "stu-009",
    name: "Noah Wilson",
    email: "noah.wilson@suu.edu",
    role: "Student Programmer",
    startDate: "2026-04-29",
    mentor: "Morgan Lee",
    mentorEmail: "morgan.lee@suu.edu",
    mentorRole: "Senior Developer",
    team: "SUU IT Software Services",
    reflection: createReflection("", "", "", ""),
    tasks: buildTasks(
      [
        "in-progress",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started"
      ],
      {
        "task-001": "I am just getting started and still working through the VM setup checklist."
      }
    )
  },
  {
    id: "stu-010",
    name: "Emily Anderson",
    email: "emily.anderson@suu.edu",
    role: "Student Programmer",
    startDate: "2026-04-23",
    mentor: "Evelyn Brooks",
    mentorEmail: "evelyn.brooks@suu.edu",
    mentorRole: "Engineering Manager",
    team: "SUU IT Software Services",
    reflection: createReflection("", "", "", ""),
    tasks: buildTasks(
      [
        "completed",
        "completed",
        "completed",
        "completed",
        "completed",
        "blocked",
        "completed",
        "completed",
        "in-progress",
        "not-started",
        "completed",
        "not-started",
        "not-started",
        "not-started",
        "not-started",
        "not-started"
      ],
      {
        "task-006": "The app starts, but I see a missing environment variable error on the landing page."
      }
    )
  }
];

export const mockStarterIssues = [
  {
    id: "issue-001",
    title: "Update README setup instructions",
    difficulty: "Easy",
    estimatedTime: "30 min",
    skills: ["Git", "Docs"],
    assignedStudentId: "stu-003",
    status: "Assigned"
  },
  {
    id: "issue-002",
    title: "Fix small UI spacing issue",
    difficulty: "Easy",
    estimatedTime: "45 min",
    skills: ["React", "CSS"],
    assignedStudentId: "stu-004",
    status: "Assigned"
  },
  {
    id: "issue-003",
    title: "Add comments to utility function",
    difficulty: "Easy",
    estimatedTime: "25 min",
    skills: ["JavaScript"],
    assignedStudentId: null,
    status: "Open"
  },
  {
    id: "issue-004",
    title: "Add validation to a form",
    difficulty: "Medium",
    estimatedTime: "60 min",
    skills: ["React", "Forms"],
    assignedStudentId: "stu-010",
    status: "Assigned"
  },
  {
    id: "issue-005",
    title: "Write a small test",
    difficulty: "Medium",
    estimatedTime: "75 min",
    skills: ["Testing", "API"],
    assignedStudentId: null,
    status: "Open"
  },
  {
    id: "issue-006",
    title: "Improve error message copy",
    difficulty: "Easy",
    estimatedTime: "20 min",
    skills: ["UX", "React"],
    assignedStudentId: "stu-001",
    status: "Done"
  }
];

export { documentationResources, taskBlueprints };

export function createNewStudent(payload, nextNumber) {
  return {
    id: `stu-${String(nextNumber).padStart(3, "0")}`,
    name: payload.name,
    email: payload.email,
    role: "Student Programmer",
    startDate: new Date().toISOString().split("T")[0],
    mentor: payload.mentor || "Unassigned",
    mentorEmail: payload.mentorEmail || "mentor@suu.edu",
    mentorRole: payload.mentorRole || "Mentor",
    team: payload.team || "SUU IT Software Services",
    reflection: createReflection("", "", "", ""),
    tasks: buildTasks(new Array(taskBlueprints.length).fill("not-started"))
  };
}
