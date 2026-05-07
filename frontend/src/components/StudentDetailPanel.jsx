import { useMemo } from "react";
import { Trash2, X } from "lucide-react";
import { getBlockedCount, getProgressPercent, groupTasksByPhase } from "../utils/progress";
import { getReadiness } from "../utils/readiness";
import ProgressBar from "./ProgressBar";
import StatusBadge from "./StatusBadge";
import ReadinessBadge from "./ReadinessBadge";
import { statusOptions } from "../utils/status";

function StudentDetailPanel({ student, onClose, onUpdateTask, onDelete }) {
  const groupedTasks = useMemo(() => groupTasksByPhase(student?.tasks || []), [student]);
  const progress = student ? getProgressPercent(student.tasks) : 0;
  const blockers = student ? getBlockedCount(student.tasks) : 0;
  const readiness = student ? getReadiness(student) : null;

  if (!student) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="mx-auto flex max-h-[92vh] max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="section-kicker">
              Student Detail
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-semibold text-suu-black">{student.name}</h3>
              {readiness ? <ReadinessBadge readiness={readiness} /> : null}
            </div>
            <p className="mt-1 text-sm text-suu-darkGray">
              {student.email} · {student.team} · Mentor: {student.mentor} · {student.mentorRole}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close student details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          <div className="mb-6 grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl bg-[#faf7f6] p-5">
              <ProgressBar value={progress} label="Overall progress" />
              <p className="mt-3 text-sm text-suu-darkGray">
                {blockers > 0
                  ? `${blockers} active blocker${blockers === 1 ? "" : "s"} need manager follow-up.`
                  : "No active blockers reported right now."}
              </p>
            </div>
            <div className="rounded-3xl bg-suu-black p-5 text-sm text-white">
              <p className="font-semibold">Last recommended action</p>
              <p className="mt-2 leading-6">
                {blockers > 0
                  ? "Review blocked tasks first, confirm exact error details, and pair with the mentor on next steps."
                  : progress < 30
                    ? "Clarify the next milestone and confirm the student can complete one concrete task today."
                    : progress === 100
                      ? "Celebrate completion and transition the student to regular sprint work."
                      : "Maintain momentum by confirming the next workflow milestone and expected delivery."}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {Object.entries(groupedTasks).map(([phase, tasks]) => (
              <section key={phase} className="rounded-3xl border border-slate-200 p-5">
                <h4 className="text-lg font-semibold text-suu-black">{phase}</h4>
                <div className="mt-4 space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`rounded-3xl border p-4 ${
                        task.status === "blocked"
                          ? "border-amber-200 bg-amber-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h5 className="text-base font-semibold text-suu-black">{task.title}</h5>
                            <StatusBadge status={task.status} />
                          </div>
                          <p className="mt-2 text-sm text-suu-darkGray">{task.description}</p>
                          {task.note ? (
                            <p className="mt-3 rounded-2xl bg-white/80 px-3 py-2 text-sm text-suu-darkGray">
                              <span className="font-semibold text-suu-black">Student note:</span>{" "}
                              {task.note}
                            </p>
                          ) : null}
                        </div>
                        <label className="text-sm font-medium text-suu-darkGray lg:min-w-[220px]">
                          Update status
                          <select
                            className="field mt-2"
                            value={task.status}
                            onChange={(event) =>
                              onUpdateTask(student.id, task.id, {
                                status: event.target.value,
                                note: task.note
                              })
                            }
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  ))}
                  {phase === "Week 2: Independent Starter Issue" && student.reflection ? (
                    <div className="rounded-3xl border border-suu-black/8 bg-[#faf7f6] p-4">
                      <h5 className="text-base font-semibold text-suu-black">Reflection</h5>
                      <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm text-suu-darkGray">
                        <p><span className="font-semibold text-suu-black">Learned:</span> {student.reflection.learned || "No reflection saved yet."}</p>
                        <p><span className="font-semibold text-suu-black">Confusing:</span> {student.reflection.confusing || "No reflection saved yet."}</p>
                        <p><span className="font-semibold text-suu-black">Help needed:</span> {student.reflection.helpNeeded || "No reflection saved yet."}</p>
                        <p><span className="font-semibold text-suu-black">Docs to improve:</span> {student.reflection.documentation || "No reflection saved yet."}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={() => onDelete(student)}
            className="inline-flex items-center gap-2 rounded-2xl border border-suu-red/20 px-4 py-2.5 text-sm font-semibold text-suu-red transition hover:bg-[#fff7f7]"
          >
            <Trash2 size={16} />
            Delete Student
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailPanel;
