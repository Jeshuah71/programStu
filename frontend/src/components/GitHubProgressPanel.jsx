import {
  AlertOctagon,
  CheckCircle2,
  Clock3,
  GitPullRequest,
  ListChecks,
  MessageSquareWarning
} from "lucide-react";

const attentionReviewStates = new Set(["Changes requested"]);
const reviewQueueStates = new Set(["Waiting for review", "Approved"]);

function getStudent(students, studentId) {
  return students.find((student) => student.id === studentId);
}

function getDaysSinceUpdate(updatedAt) {
  const updated = new Date(updatedAt);
  const now = new Date();
  return Math.max(0, Math.floor((now - updated) / 86400000));
}

function formatUpdatedAt(updatedAt) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(updatedAt));
}

function getNextAction(issue, pullRequest) {
  if (!issue && !pullRequest) {
    return "Pick a starter issue or confirm the next assignment.";
  }

  if (issue?.status === "Blocked") {
    return "Manager or mentor should unblock access, setup, or requirements.";
  }

  if (!pullRequest) {
    return issue?.assigneeStudentId
      ? "Open a small PR that links this issue."
      : "Assign this issue to a ready student.";
  }

  if (pullRequest.checksState === "Failing") {
    return "Fix failing checks before asking for final review.";
  }

  if (pullRequest.reviewState === "Changes requested") {
    return "Address review comments and reply in Slack when updates are pushed.";
  }

  if (pullRequest.reviewState === "Waiting for review") {
    return "Reviewer should look at the PR or confirm review timing.";
  }

  if (pullRequest.reviewState === "Approved" && pullRequest.status !== "Merged") {
    return "Merge when checks pass and branch is current.";
  }

  if (pullRequest.status === "Merged") {
    return "Pick the next issue or document the lesson learned.";
  }

  return "Keep the PR moving with a focused update today.";
}

function getStatusTone(status) {
  if (status === "Merged" || status === "Approved" || status === "Passing") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  if (status === "Changes requested" || status === "Blocked" || status === "Failing") {
    return "bg-rose-50 text-rose-700 ring-rose-100";
  }

  if (status === "Waiting for review" || status === "Needs review" || status === "Pending") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function buildStudentWork(students, issues, pullRequests) {
  const existingStudentWork = students.map((student) => {
    const assignedIssues = issues.filter((issue) => issue.assigneeStudentId === student.id);
    const studentPullRequests = pullRequests.filter((pullRequest) => pullRequest.authorStudentId === student.id);
    const activePullRequest =
      studentPullRequests.find((pullRequest) => pullRequest.status !== "Merged") || studentPullRequests[0] || null;
    const activeIssue =
      assignedIssues.find((issue) => issue.status !== "Merged") ||
      assignedIssues.find((issue) => issue.number === activePullRequest?.linkedIssueNumber) ||
      assignedIssues[0] ||
      null;
    const latestUpdatedAt = [activeIssue?.updatedAt, activePullRequest?.updatedAt]
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0];
    const stale = latestUpdatedAt ? getDaysSinceUpdate(latestUpdatedAt) >= 3 : true;
    const needsAttention =
      activeIssue?.status === "Blocked" ||
      activePullRequest?.checksState === "Failing" ||
      attentionReviewStates.has(activePullRequest?.reviewState) ||
      stale;

    return {
      student,
      issue: activeIssue,
      pullRequest: activePullRequest,
      latestUpdatedAt,
      stale,
      needsAttention,
      nextAction: getNextAction(activeIssue, activePullRequest)
    };
  });

  const externalLogins = new Set(
    [
      ...issues
        .filter((issue) => !issue.assigneeStudentId && issue.assigneeLogin)
        .map((issue) => issue.assigneeLogin),
      ...pullRequests
        .filter((pullRequest) => !pullRequest.authorStudentId && pullRequest.authorLogin)
        .map((pullRequest) => pullRequest.authorLogin)
    ].filter(Boolean)
  );

  const externalWork = [...externalLogins].map((login) => {
    const assignedIssues = issues.filter((issue) => issue.assigneeLogin === login);
    const studentPullRequests = pullRequests.filter((pullRequest) => pullRequest.authorLogin === login);
    const activePullRequest =
      studentPullRequests.find((pullRequest) => pullRequest.status !== "Merged") || studentPullRequests[0] || null;
    const activeIssue =
      assignedIssues.find((issue) => issue.status !== "Merged") ||
      assignedIssues.find((issue) => issue.number === activePullRequest?.linkedIssueNumber) ||
      assignedIssues[0] ||
      null;
    const latestUpdatedAt = [activeIssue?.updatedAt, activePullRequest?.updatedAt]
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0];
    const stale = latestUpdatedAt ? getDaysSinceUpdate(latestUpdatedAt) >= 3 : true;

    return {
      student: {
        id: `github-${login}`,
        name: `@${login}`,
        mentor: "GitHub account"
      },
      issue: activeIssue,
      pullRequest: activePullRequest,
      latestUpdatedAt,
      stale,
      needsAttention:
        activeIssue?.status === "Blocked" ||
        activePullRequest?.checksState === "Failing" ||
        attentionReviewStates.has(activePullRequest?.reviewState) ||
        stale,
      nextAction: getNextAction(activeIssue, activePullRequest)
    };
  });

  return [...existingStudentWork, ...externalWork];
}

function GitHubProgressPanel({
  students,
  githubIssues,
  githubPullRequests,
  selectedStudent = null,
  compact = false
}) {
  const studentWork = buildStudentWork(students, githubIssues, githubPullRequests);
  const visibleWork = selectedStudent
    ? studentWork.filter((work) => work.student.id === selectedStudent.id)
    : studentWork;
  const selectedWork = visibleWork[0];
  const openPullRequests = githubPullRequests.filter((pullRequest) => pullRequest.status === "Open");
  const waitingReview = openPullRequests.filter((pullRequest) =>
    reviewQueueStates.has(pullRequest.reviewState)
  );
  const changesRequested = openPullRequests.filter((pullRequest) =>
    attentionReviewStates.has(pullRequest.reviewState)
  );
  const failingChecks = openPullRequests.filter((pullRequest) => pullRequest.checksState === "Failing");
  const staleWork = studentWork.filter((work) => work.stale && (work.issue || work.pullRequest));
  const recentlyMerged = githubPullRequests.filter((pullRequest) => pullRequest.status === "Merged");

  if (compact) {
    return (
      <section className="glass-panel p-6">
        <PanelHeader
          kicker="GitHub Progress"
          title="Current GitHub work"
          icon={GitPullRequest}
        />

        {selectedWork?.issue || selectedWork?.pullRequest ? (
          <div className="mt-5 space-y-4">
            <WorkCard work={selectedWork} compact />
          </div>
        ) : (
          <EmptyState message="No GitHub issue or PR is assigned yet. Pick a starter issue when this student is ready for independent work." />
        )}
      </section>
    );
  }

  return (
    <section className="glass-panel p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <PanelHeader
          kicker="GitHub Progress Radar"
          title="Student work across issues and PRs"
          icon={GitPullRequest}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <RadarStat label="Open PRs" value={openPullRequests.length} icon={GitPullRequest} />
          <RadarStat label="Waiting Review" value={waitingReview.length} icon={MessageSquareWarning} />
          <RadarStat label="Needs Attention" value={changesRequested.length + failingChecks.length} icon={AlertOctagon} />
          <RadarStat label="Merged" value={recentlyMerged.length} icon={CheckCircle2} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <QueueColumn title="Needs attention" icon={AlertOctagon}>
          {studentWork
            .filter((work) => work.needsAttention)
            .map((work) => (
              <WorkCard key={work.student.id} work={work} compact />
            ))}
        </QueueColumn>

        <QueueColumn title="Review queue" icon={MessageSquareWarning}>
          {studentWork
            .filter((work) => reviewQueueStates.has(work.pullRequest?.reviewState))
            .map((work) => (
              <WorkCard key={work.student.id} work={work} compact />
            ))}
        </QueueColumn>

        <QueueColumn title="Recently merged" icon={CheckCircle2}>
          {studentWork
            .filter((work) => work.pullRequest?.status === "Merged")
            .map((work) => (
              <WorkCard key={work.student.id} work={work} compact />
            ))}
        </QueueColumn>
      </div>

      <div className="mt-6 overflow-x-auto rounded-[20px] border border-suu-black/8">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[1.1fr_1.3fr_1fr_1fr] gap-4 bg-[#faf7f6] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-suu-darkGray">
            <span>Student</span>
            <span>Issue / PR</span>
            <span>Status</span>
            <span>Next action</span>
          </div>
          <div className="divide-y divide-suu-black/8 bg-white">
            {studentWork.map((work) => (
              <WorkRow key={work.student.id} work={work} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PanelHeader({ kicker, title, icon: Icon }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-2xl bg-suu-black p-3 text-white">
        <Icon size={18} />
      </div>
      <div>
        <p className="section-kicker">{kicker}</p>
        <h3 className="mt-1 text-2xl font-semibold text-suu-black">{title}</h3>
      </div>
    </div>
  );
}

function RadarStat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[18px] border border-suu-black/8 bg-[#faf7f6] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-suu-darkGray">{label}</p>
        <Icon size={16} className="text-suu-red" />
      </div>
      <p className="mt-2 text-2xl font-semibold text-suu-black">{value}</p>
    </div>
  );
}

function QueueColumn({ title, icon: Icon, children }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;

  return (
    <div className="rounded-[20px] border border-suu-black/8 bg-[#faf7f6] p-4">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-suu-red" />
        <h4 className="font-semibold text-suu-black">{title}</h4>
      </div>
      <div className="mt-4 space-y-3">
        {items?.length ? items : <EmptyState message="Nothing in this queue right now." compact />}
      </div>
    </div>
  );
}

function WorkCard({ work, compact = false }) {
  const { student, issue, pullRequest, latestUpdatedAt, stale, nextAction } = work;

  return (
    <article className="rounded-[18px] border border-suu-black/8 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-suu-black">{student.name}</h4>
          <p className="mt-1 text-sm text-suu-darkGray">
            {pullRequest ? `PR #${pullRequest.number}` : issue ? `Issue #${issue.number}` : "No GitHub work"}
          </p>
        </div>
        {stale ? <StatusPill label="Stale" /> : null}
      </div>

      <p className="mt-3 text-sm font-semibold text-suu-black">
        {pullRequest?.title || issue?.title || "Ready for assignment"}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {issue ? <StatusPill label={issue.status} /> : null}
        {pullRequest ? <StatusPill label={pullRequest.reviewState} /> : null}
        {pullRequest ? <StatusPill label={pullRequest.checksState} /> : null}
      </div>

      <p className="mt-3 text-sm leading-6 text-suu-darkGray">{nextAction}</p>

      {latestUpdatedAt ? (
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-suu-darkGray">
          <Clock3 size={14} />
          Updated {formatUpdatedAt(latestUpdatedAt)}
        </p>
      ) : null}

      {!compact && issue?.labels?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {issue.labels.map((label) => (
            <span key={label} className="rounded-full bg-[#faf7f6] px-3 py-1 text-xs font-semibold text-suu-darkGray">
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function WorkRow({ work }) {
  const { student, issue, pullRequest, nextAction, latestUpdatedAt } = work;

  return (
    <div className="grid grid-cols-[1.1fr_1.3fr_1fr_1fr] gap-4 px-4 py-4 text-sm">
      <div>
        <p className="font-semibold text-suu-black">{student.name}</p>
        <p className="mt-1 text-xs text-suu-darkGray">{student.mentor}</p>
      </div>
      <div>
        <p className="font-semibold text-suu-black">
          {pullRequest ? `PR #${pullRequest.number}: ${pullRequest.title}` : issue ? `Issue #${issue.number}: ${issue.title}` : "No assignment"}
        </p>
        <p className="mt-1 text-xs text-suu-darkGray">
          {pullRequest?.repository || issue?.repository || "Ready for GitHub work"}
          {latestUpdatedAt ? ` · ${formatUpdatedAt(latestUpdatedAt)}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {issue ? <StatusPill label={issue.status} /> : <StatusPill label="Unassigned" />}
        {pullRequest ? <StatusPill label={pullRequest.reviewState} /> : null}
      </div>
      <p className="text-sm leading-6 text-suu-darkGray">{nextAction}</p>
    </div>
  );
}

function StatusPill({ label }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusTone(label)}`}>
      {label}
    </span>
  );
}

function EmptyState({ message, compact = false }) {
  return (
    <div className={`rounded-[18px] border border-dashed border-suu-black/10 bg-white ${compact ? "p-3" : "p-4"} text-sm leading-6 text-suu-darkGray`}>
      <div className="flex items-start gap-2">
        <ListChecks size={16} className="mt-1 text-suu-red" />
        <span>{message}</span>
      </div>
    </div>
  );
}

export default GitHubProgressPanel;
