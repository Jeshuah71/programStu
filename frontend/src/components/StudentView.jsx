import { useMemo, useState } from "react";
import { AlertTriangle, BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { api } from "../api";
import {
  getBlockedCount,
  getCurrentPhase,
  getCurrentTask,
  getNextAction,
  getProgressPercent,
  groupTasksByPhase
} from "../utils/progress";
import { getMockAssistantResponse } from "../mockAi";
import StudentSelector from "./StudentSelector";
import StudentChecklist from "./StudentChecklist";
import SUUOnboardingAssistant from "./SUUOnboardingAssistant";
import StudentProfileCard from "./StudentProfileCard";
import PhaseTimeline from "./PhaseTimeline";
import DocumentationHub from "./DocumentationHub";
import StarterIssuesPanel from "./StarterIssuesPanel";
import GitHubProgressPanel from "./GitHubProgressPanel";
import SectionNav from "./SectionNav";
import SectionAnchor from "./SectionAnchor";
import KanbanBoard from "./kanban/KanbanBoard";
import EpicsView from "./kanban/EpicsView";
import WorkGuide from "./ai/WorkGuide";
import HandbookTab from "./handbook/HandbookTab";
import WorktreeHelper from "./handbook/WorktreeHelper";

function StudentView({
  students,
  starterIssues,
  githubIssues,
  githubPullRequests,
  epics,
  stories,
  worktrees,
  selectedStudent,
  selectedStudentId,
  onSelectStudent,
  onUpdateTask,
  onUpdateStudent,
  onMoveStory,
  onCreateStory,
  onCreateWorktree,
  demoMode
}) {
  const [savingTaskId, setSavingTaskId] = useState("");
  const [assistantTask, setAssistantTask] = useState(null);
  const [assistantResult, setAssistantResult] = useState(null);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState("");
  const [showResources, setShowResources] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  const progress = selectedStudent ? getProgressPercent(selectedStudent.tasks) : 0;
  const blockers = selectedStudent ? getBlockedCount(selectedStudent.tasks) : 0;
  const currentTask = selectedStudent ? getCurrentTask(selectedStudent.tasks) : null;
  const currentPhase = selectedStudent ? getCurrentPhase(selectedStudent.tasks) : "";
  const nextAction = selectedStudent ? getNextAction(selectedStudent.tasks) : "";

  const groupedTasks = useMemo(() => {
    if (!selectedStudent) {
      return {};
    }

    return groupTasksByPhase(selectedStudent.tasks);
  }, [selectedStudent]);

  const navItems = [
    { id: "student-selector", label: "Student" },
    { id: "student-profile", label: "Profile" },
    { id: "student-focus", label: "Today" },
    { id: "student-kanban", label: "Kanban" },
    { id: "student-epics", label: "Epics" },
    { id: "student-worktrees", label: "Worktrees" },
    { id: "student-github", label: "GitHub" },
    { id: "student-roadmap", label: "Roadmap" },
    { id: "student-handbook", label: "Handbook" },
    { id: "student-resources", label: "Resources" },
    { id: "student-reflection", label: "Reflection" },
    { id: "student-checklist", label: "Checklist" }
  ];

  async function handleTaskUpdate(taskId, payload, skipSave = false) {
    if (!selectedStudent) {
      return;
    }

    if (skipSave) {
      await onUpdateTask(selectedStudent.id, taskId, payload, true);
      return;
    }

    try {
      setSavingTaskId(taskId);
      await onUpdateTask(selectedStudent.id, taskId, payload);
    } finally {
      setSavingTaskId("");
    }
  }

  async function handleOpenAssistant(task, action) {
    if (!selectedStudent) {
      return;
    }

    setAssistantTask(task);
    setAssistantResult(null);
    setAssistantError("");
    setAssistantLoading(true);

    try {
      let data;
      if (!demoMode) {
        try {
          data = await api.getBlockerHelp({
            studentName: selectedStudent.name,
            taskTitle: task.title,
            taskDescription: task.description,
            note: task.note,
            action
          });
        } catch (_error) {
          data = getMockAssistantResponse({ student: selectedStudent, task, action });
        }
      } else {
        data = getMockAssistantResponse({ student: selectedStudent, task, action });
      }
      setAssistantResult(data);
    } catch (error) {
      setAssistantError(error.message || "Unable to generate onboarding help.");
    } finally {
      setAssistantLoading(false);
    }
  }

  if (!students.length) {
    return (
      <div className="glass-panel p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-950">No students loaded</h2>
        <p className="mt-2 text-sm text-slate-500">
          Add a student from the manager dashboard to start onboarding tracking.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <SectionAnchor id="student-selector">
          <StudentSelector
            students={students}
            value={selectedStudentId}
            onChange={onSelectStudent}
          />
        </SectionAnchor>

        {selectedStudent ? (
          <>
            <SectionNav title="Student Navigation" items={navItems} />
            <SectionAnchor id="student-profile">
              <StudentProfileCard student={selectedStudent} />
            </SectionAnchor>
            <SectionAnchor id="student-focus">
              <TodayFocusCard
                currentTask={currentTask}
                currentPhase={currentPhase}
                nextAction={nextAction}
                blockers={blockers}
                progress={progress}
                onOpenAssistant={handleOpenAssistant}
              />
            </SectionAnchor>
            <SectionAnchor id="student-kanban">
              <div className="space-y-6">
                <WorkGuide
                  student={selectedStudent}
                  stories={stories}
                  epics={epics}
                  blockers={selectedStudent.tasks.filter((task) => task.status === "blocked")}
                  prs={githubPullRequests.filter((pullRequest) => pullRequest.authorStudentId === selectedStudent.id)}
                  demoMode={demoMode}
                />
                <KanbanBoard
                  mode="student"
                  students={students}
                  selectedStudent={selectedStudent}
                  stories={stories}
                  epics={epics}
                  onMoveStory={onMoveStory}
                  onCreateStory={onCreateStory}
                  onCreateWorktree={onCreateWorktree}
                />
              </div>
            </SectionAnchor>
            <SectionAnchor id="student-epics">
              <EpicsView
                mode="student"
                students={students}
                selectedStudent={selectedStudent}
                epics={epics}
                stories={stories}
                onCreateStory={onCreateStory}
              />
            </SectionAnchor>
            <SectionAnchor id="student-worktrees">
              <WorktreeHelper
                student={selectedStudent}
                stories={stories}
                worktrees={worktrees}
                onCopyCommand={onCreateWorktree}
              />
            </SectionAnchor>
            <SectionAnchor id="student-github">
              <GitHubProgressPanel
                students={students}
                githubIssues={githubIssues}
                githubPullRequests={githubPullRequests}
                selectedStudent={selectedStudent}
                compact
              />
            </SectionAnchor>
            <SectionAnchor id="student-roadmap">
              <PhaseTimeline tasks={selectedStudent.tasks} />
            </SectionAnchor>
            <SectionAnchor id="student-handbook">
              <HandbookTab student={selectedStudent} />
            </SectionAnchor>
            <div className="grid gap-6 xl:grid-cols-2">
              <StarterIssuesPanel
                starterIssues={starterIssues}
                students={students}
                selectedStudent={selectedStudent}
                compact
              />
              <SectionAnchor id="student-resources">
                <CollapsibleCard
                  title="Recommended resources"
                  kicker="Documentation Hub"
                  open={showResources}
                  onToggle={() => setShowResources((current) => !current)}
                >
                  <DocumentationHub currentPhase={currentPhase} />
                </CollapsibleCard>
              </SectionAnchor>
            </div>
            <SectionAnchor id="student-reflection">
              <CollapsibleCard
                title="Onboarding reflection"
                kicker="First Week Reflection"
                open={showReflection}
                onToggle={() => setShowReflection((current) => !current)}
              >
                <ReflectionCard key={selectedStudent.id} student={selectedStudent} onSave={onUpdateStudent} />
              </CollapsibleCard>
            </SectionAnchor>
          </>
        ) : null}

        <SectionAnchor id="student-checklist">
          <StudentChecklist
            groupedTasks={groupedTasks}
            savingTaskId={savingTaskId}
            onUpdateTask={handleTaskUpdate}
            onOpenAssistant={handleOpenAssistant}
          />
        </SectionAnchor>
      </div>

      <SUUOnboardingAssistant
        task={assistantTask}
        result={assistantResult}
        loading={assistantLoading}
        error={assistantError}
        onClose={() => {
          setAssistantTask(null);
          setAssistantResult(null);
          setAssistantError("");
        }}
      />
    </>
  );
}

function TodayFocusCard({ currentTask, currentPhase, nextAction, blockers, progress, onOpenAssistant }) {
  return (
    <section className="glass-panel p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="section-kicker">Today&apos;s Focus</p>
          <h3 className="mt-2 text-2xl font-semibold text-suu-black">
            {currentTask ? currentTask.title : "Onboarding complete"}
          </h3>
          <p className="mt-2 text-sm text-suu-darkGray">
            {currentTask
              ? currentTask.description
              : "You have completed onboarding and can move into independent starter work."}
          </p>
        </div>
        {currentTask ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary" onClick={() => onOpenAssistant(currentTask, blockers ? "blocked" : "explain")}>
              <Sparkles size={16} />
              {blockers ? "Resolve blocker" : "Explain task"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => onOpenAssistant(currentTask, "draft-message")}>
              <AlertTriangle size={16} />
              Draft mentor note
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <FocusStat label="Current phase" value={currentPhase || "Complete"} icon={CheckCircle2} />
        <FocusStat label="Next action" value={nextAction} icon={Sparkles} />
        <FocusStat label="Blockers" value={`${blockers}`} icon={AlertTriangle} />
        <FocusStat label="Recommended resource" value={currentTask?.resourceTitle || "Starter issues"} icon={BookOpen} />
      </div>

      <div className="mt-4 rounded-[18px] bg-[#faf7f6] px-4 py-3 text-sm text-suu-darkGray">
        Progress is at <span className="font-semibold text-suu-black">{progress}%</span>. Keep the current phase moving before opening more downstream tasks.
      </div>
    </section>
  );
}

function FocusStat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[18px] border border-suu-black/8 bg-white p-4">
      <div className="flex items-center gap-2 text-suu-darkGray">
        <Icon size={15} />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-suu-black">{value}</p>
    </div>
  );
}

function CollapsibleCard({ kicker, title, open, onToggle, children }) {
  return (
    <section className="glass-panel p-6">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 text-left">
        <div>
          <p className="section-kicker">{kicker}</p>
          <h3 className="mt-1 text-xl font-semibold text-suu-black">{title}</h3>
        </div>
        <span className="rounded-full bg-suu-gray px-3 py-1 text-xs font-semibold text-suu-darkGray">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

function ReflectionCard({ student, onSave }) {
  const [form, setForm] = useState(student.reflection || {
    learned: "",
    confusing: "",
    helpNeeded: "",
    documentation: ""
  });

  return (
    <div>
      <p className="mt-2 text-sm text-suu-darkGray">
        Capture what you learned, what was confusing, and what SUU IT documentation should improve for the next student programmer.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="What did you learn?" value={form.learned} onChange={(value) => setForm((current) => ({ ...current, learned: value }))} />
        <Field label="What was confusing?" value={form.confusing} onChange={(value) => setForm((current) => ({ ...current, confusing: value }))} />
        <Field label="What do you need help with?" value={form.helpNeeded} onChange={(value) => setForm((current) => ({ ...current, helpNeeded: value }))} />
        <Field label="What documentation should improve?" value={form.documentation} onChange={(value) => setForm((current) => ({ ...current, documentation: value }))} />
      </div>

      <div className="mt-5 flex justify-end">
        <button type="button" onClick={() => onSave(student.id, { reflection: form })} className="btn-primary">
          Save reflection
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label>
      <span className="label">{label}</span>
      <textarea className="field min-h-[110px] resize-none" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export default StudentView;
