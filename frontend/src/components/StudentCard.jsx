import { Mail, TriangleAlert } from "lucide-react";
import { getBlockedCount, getProgressPercent, getTasksRemaining } from "../utils/progress";
import { getStudentHealth } from "../utils/status";
import { getReadiness } from "../utils/readiness";
import ProgressBar from "./ProgressBar";
import ReadinessBadge from "./ReadinessBadge";

function StudentCard({ student, onOpen }) {
  const progress = getProgressPercent(student.tasks);
  const blockers = getBlockedCount(student.tasks);
  const remaining = getTasksRemaining(student.tasks);
  const health = getStudentHealth(student, progress, blockers);
  const readiness = getReadiness(student);

  return (
    <button
      type="button"
      onClick={() => onOpen(student)}
      className="glass-panel w-full p-5 text-left transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-suu-black">{student.name}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-suu-darkGray">
            <Mail size={14} />
            {student.email}
          </p>
          <p className="mt-3 text-sm text-suu-darkGray">
            {student.team} · Mentor: {student.mentor}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${health.className}`}>
            {health.label}
          </span>
          <ReadinessBadge readiness={readiness} />
        </div>
      </div>

      <div className="mt-5">
        <ProgressBar value={progress} label="Progress" small />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-suu-darkGray">
        <span>{remaining} tasks remaining</span>
        <span className="inline-flex items-center gap-1.5">
          <TriangleAlert size={14} className={blockers ? "text-suu-red" : "text-suu-darkGray/30"} />
          {blockers} blockers
        </span>
      </div>

      <div className="mt-4 border-t border-suu-black/8 pt-4 text-xs uppercase tracking-[0.18em] text-suu-darkGray">
        Started {student.startDate}
      </div>
    </button>
  );
}

export default StudentCard;
