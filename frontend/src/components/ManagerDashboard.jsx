import { useMemo, useState } from "react";
import {
  AlertOctagon,
  CircleCheckBig,
  Search,
  ShieldAlert,
  TrendingUp,
  UserPlus
} from "lucide-react";
import { api } from "../api";
import { getMockManagerSummary } from "../mockAi";
import { getBlockedCount, getProgressPercent } from "../utils/progress";
import StatCard from "./StatCard";
import ManagerSummaryPanel from "./ManagerSummaryPanel";
import StudentCard from "./StudentCard";
import StudentDetailPanel from "./StudentDetailPanel";
import AddStudentModal from "./AddStudentModal";
import BlockerCenter from "./BlockerCenter";
import StarterIssuesPanel from "./StarterIssuesPanel";
import ManagerStudentTable from "./ManagerStudentTable";
import ManagerGraphicsPanel from "./ManagerGraphicsPanel";
import GitHubProgressPanel from "./GitHubProgressPanel";
import SectionNav from "./SectionNav";
import SectionAnchor from "./SectionAnchor";

function ManagerDashboard({
  students,
  starterIssues,
  githubIssues,
  githubPullRequests,
  onUpdateTask,
  onCreateStudent,
  onDeleteStudent,
  demoMode
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("highest-progress");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const stats = useMemo(() => {
    const total = students.length;
    const averageProgress = total
      ? Math.round(
          students.reduce((sum, student) => sum + getProgressPercent(student.tasks), 0) / total
        )
      : 0;
    const completed = students.filter((student) => getProgressPercent(student.tasks) === 100).length;
    const activeBlockers = students.reduce((sum, student) => sum + getBlockedCount(student.tasks), 0);
    const openPullRequests = githubPullRequests.filter((pullRequest) => pullRequest.status === "Open");
    const waitingReview = openPullRequests.filter((pullRequest) =>
      ["Waiting for review", "Approved"].includes(pullRequest.reviewState)
    ).length;
    const needsAttention = openPullRequests.filter(
      (pullRequest) =>
        pullRequest.reviewState === "Changes requested" || pullRequest.checksState === "Failing"
    ).length;
    const merged = githubPullRequests.filter((pullRequest) => pullRequest.status === "Merged").length;
    const atRisk = students.filter((student) => {
      const progress = getProgressPercent(student.tasks);
      return progress < 30 || getBlockedCount(student.tasks) > 0;
    }).length;

    return {
      total,
      averageProgress,
      completed,
      activeBlockers,
      atRisk,
      openPullRequests: openPullRequests.length,
      waitingReview,
      needsAttention,
      merged
    };
  }, [students, githubPullRequests]);

  const filteredStudents = useMemo(() => {
    let list = [...students];

    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter(
        (student) =>
          student.name.toLowerCase().includes(query) || student.email.toLowerCase().includes(query)
      );
    }

    list = list.filter((student) => {
      const progress = getProgressPercent(student.tasks);
      const blockers = getBlockedCount(student.tasks);

      if (filter === "blocked") {
        return blockers > 0;
      }
      if (filter === "complete") {
        return progress === 100;
      }
      if (filter === "on-track") {
        return progress >= 30 && progress < 100 && blockers === 0;
      }
      if (filter === "at-risk") {
        return progress < 30 || blockers > 0;
      }
      return true;
    });

    list.sort((a, b) => {
      if (sort === "lowest-progress") {
        return getProgressPercent(a.tasks) - getProgressPercent(b.tasks);
      }
      if (sort === "most-blockers") {
        return getBlockedCount(b.tasks) - getBlockedCount(a.tasks);
      }
      if (sort === "newest-start-date") {
        return new Date(b.startDate) - new Date(a.startDate);
      }
      return getProgressPercent(b.tasks) - getProgressPercent(a.tasks);
    });

    return list;
  }, [students, filter, search, sort]);

  async function handleGenerateSummary() {
    try {
      setSummaryLoading(true);
      let data;
      if (!demoMode) {
        try {
          data = await api.generateManagerSummary({ students });
          if (!data?.teamSnapshot) {
            data = getMockManagerSummary(students);
          }
        } catch (_error) {
          data = getMockManagerSummary(students);
        }
      } else {
        data = getMockManagerSummary(students);
      }
      setSummary(data);
    } finally {
      setSummaryLoading(false);
    }
  }

  async function handleAddStudent(form) {
    try {
      setSubmitting(true);
      await onCreateStudent(form);
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateTask(studentId, taskId, payload) {
    await onUpdateTask(studentId, taskId, payload);
    setSelectedStudent((current) =>
      current
        ? {
            ...current,
            tasks: current.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    ...payload,
                    status: payload.status ?? task.status,
                    completed: (payload.status ?? task.status) === "completed"
                  }
                : task
            )
          }
        : current
    );
  }

  async function handleDeleteStudent(student) {
    if (!window.confirm(`Delete ${student.name} from the onboarding hub?`)) {
      return;
    }

    await onDeleteStudent(student.id);
    setSelectedStudent(null);
  }

  const filters = [
    ["all", "All"],
    ["blocked", "Blocked"],
    ["on-track", "On Track"],
    ["complete", "Complete"],
    ["at-risk", "At Risk"]
  ];

  const navItems = [
    { id: "manager-summary", label: "Weekly Report" },
    { id: "manager-github", label: "GitHub Progress", badge: stats.openPullRequests },
    { id: "manager-graphics", label: "Graphics", badge: 4 },
    { id: "manager-blockers", label: "Blockers", badge: stats.activeBlockers },
    { id: "manager-issues", label: "Starter Issues", badge: githubIssues.length },
    { id: "manager-operations", label: "Operations", badge: filteredStudents.length }
  ];

  return (
    <div className="space-y-6">
      <SectionNav title="Manager Navigation" items={navItems} />

      <section className="glass-panel p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="section-kicker">Supervisor Quick Actions</p>
            <h2 className="mt-2 text-2xl font-semibold text-suu-black">See GitHub progress without digging through Slack</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-suu-darkGray">
              Jump to review queues, blockers, reporting, or student operations. Use this dashboard to see who moved work forward and who needs help.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <QuickJumpCard
              title="Open PRs"
              value={stats.openPullRequests}
              caption="Student pull requests"
              onClick={() => document.getElementById("manager-github")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            />
            <QuickJumpCard
              title="Waiting Review"
              value={stats.waitingReview}
              caption="Ready for reviewer action"
              onClick={() => document.getElementById("manager-github")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            />
            <QuickJumpCard
              title="Needs Attention"
              value={stats.needsAttention}
              caption="Review or check failures"
              onClick={() => document.getElementById("manager-github")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            />
            <QuickJumpCard
              title="Weekly Report"
              value={summary ? "Ready" : "Draft"}
              caption="Manager summary section"
              onClick={() => document.getElementById("manager-summary")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Students"
          value={stats.total}
          caption="Active onboarding profiles"
          icon={TrendingUp}
          tone="sky"
        />
        <StatCard
          title="Open PRs"
          value={stats.openPullRequests}
          caption="Student work in review"
          icon={CircleCheckBig}
          tone="emerald"
        />
        <StatCard
          title="Waiting Review"
          value={stats.waitingReview}
          caption="PRs ready for reviewer action"
          icon={CircleCheckBig}
          tone="emerald"
        />
        <StatCard
          title="Needs Attention"
          value={stats.needsAttention}
          caption="Changes requested or checks failing"
          icon={AlertOctagon}
          tone="amber"
        />
        <StatCard
          title="Merged Work"
          value={stats.merged}
          caption="Completed GitHub work"
          icon={ShieldAlert}
          tone="rose"
        />
      </section>

      <SectionAnchor id="manager-summary">
        <ManagerSummaryPanel
          summary={summary}
          loading={summaryLoading}
          onGenerate={handleGenerateSummary}
        />
      </SectionAnchor>

      <SectionAnchor id="manager-github">
        <GitHubProgressPanel
          students={students}
          githubIssues={githubIssues}
          githubPullRequests={githubPullRequests}
        />
      </SectionAnchor>

      <SectionAnchor id="manager-graphics">
        <ManagerGraphicsPanel students={students} />
      </SectionAnchor>

      <SectionAnchor id="manager-blockers">
        <BlockerCenter students={students} />
      </SectionAnchor>
      <SectionAnchor id="manager-issues">
        <StarterIssuesPanel starterIssues={starterIssues} students={students} />
      </SectionAnchor>

      <SectionAnchor id="manager-operations">
        <section className="glass-panel p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="section-kicker">
              Manager Dashboard
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-suu-black">Student operations overview</h2>
            <p className="mt-2 text-sm leading-6 text-suu-darkGray">
              Scan current phase, blockers, and next actions quickly before opening a detailed student view.
            </p>
          </div>

          <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
            <UserPlus size={16} />
            Add Student
          </button>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_auto_auto]">
          <label className="relative block">
            <span className="label">Search students</span>
            <Search className="pointer-events-none absolute left-4 top-[46px] text-slate-400" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="field pl-11"
              placeholder="Search by name or email"
            />
          </label>

          <label>
            <span className="label">Filter</span>
            <div className="flex flex-wrap gap-2 rounded-3xl bg-slate-100 p-2">
              {filters.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    filter === value ? "bg-suu-red text-white shadow-sm" : "text-suu-darkGray"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </label>

          <label>
            <span className="label">Sort</span>
            <select className="field min-w-[220px]" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="highest-progress">Highest progress</option>
              <option value="lowest-progress">Lowest progress</option>
              <option value="most-blockers">Most blockers</option>
              <option value="newest-start-date">Newest start date</option>
            </select>
          </label>
        </div>

        {filteredStudents.length ? (
          <div className="mt-6 space-y-6">
            <ManagerStudentTable students={filteredStudents} onOpen={setSelectedStudent} />
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-suu-black">Visual student cards</h3>
                <p className="text-sm text-suu-darkGray">Secondary view for presentation context.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {filteredStudents.map((student) => (
                  <StudentCard key={student.id} student={student} onOpen={setSelectedStudent} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-suu-black/10 bg-[#faf7f6] p-8 text-center text-sm text-suu-darkGray">
            No students match the current filter or search query.
          </div>
        )}
        </section>
      </SectionAnchor>

      <AddStudentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddStudent}
        submitting={submitting}
      />

      <StudentDetailPanel
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onUpdateTask={handleUpdateTask}
        onDelete={handleDeleteStudent}
      />
    </div>
  );
}

function QuickJumpCard({ title, value, caption, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[20px] border border-suu-black/8 bg-[#faf7f6] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-suu-red/25 hover:bg-white hover:shadow-md"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-suu-darkGray">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-suu-black">{value}</p>
      <p className="mt-1 text-sm text-suu-darkGray">{caption}</p>
    </button>
  );
}

export default ManagerDashboard;
