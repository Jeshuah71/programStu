import { ChevronRight, Mail, TriangleAlert } from "lucide-react";
import {
  getBlockedCount,
  getCurrentPhase,
  getNextAction,
  getProgressPercent
} from "../utils/progress";
import { getReadiness } from "../utils/readiness";
import { getStudentHealth } from "../utils/status";
import ReadinessBadge from "./ReadinessBadge";

function ManagerStudentTable({ students, onOpen }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-suu-black/8">
      <div className="hidden grid-cols-[1.45fr_.85fr_.8fr_1fr_1.05fr_.6fr] gap-4 bg-[#faf7f6] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-suu-darkGray lg:grid">
        <span>Student</span>
        <span>Progress</span>
        <span>Blockers</span>
        <span>Current Phase</span>
        <span>Next Action</span>
        <span className="text-right">Open</span>
      </div>

      <div className="divide-y divide-suu-black/8 bg-white">
        {students.map((student) => {
          const progress = getProgressPercent(student.tasks);
          const blockers = getBlockedCount(student.tasks);
          const readiness = getReadiness(student);
          const health = getStudentHealth(student, progress, blockers);
          const currentPhase = getCurrentPhase(student.tasks);
          const nextAction = getNextAction(student.tasks);

          return (
            <button
              key={student.id}
              type="button"
              onClick={() => onOpen(student)}
              className="grid w-full gap-3 px-5 py-4 text-left transition duration-200 hover:bg-[#fcfbfb] hover:shadow-[inset_4px_0_0_0_#DB0000] lg:grid-cols-[1.45fr_.85fr_.8fr_1fr_1.05fr_.6fr] lg:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-suu-black">{student.name}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${health.className}`}>
                    {health.label}
                  </span>
                  <ReadinessBadge readiness={readiness} />
                </div>
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-suu-darkGray">
                  <Mail size={14} />
                  {student.email}
                </p>
                <p className="mt-1 text-sm text-suu-darkGray">Mentor: {student.mentor}</p>
              </div>

              <div>
                <p className="text-lg font-semibold text-suu-black">{progress}%</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-suu-gray">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-suu-red via-suu-redAlt to-suu-black"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="text-sm text-suu-darkGray">
                <p className={`inline-flex items-center gap-1.5 ${blockers ? "text-suu-red" : ""}`}>
                  <TriangleAlert size={14} />
                  {blockers}
                </p>
              </div>

              <div className="text-sm font-medium text-suu-black">{currentPhase}</div>
              <div className="text-sm text-suu-darkGray">{nextAction}</div>

              <div className="flex justify-end">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-suu-black/10 px-3 py-2 text-sm font-semibold text-suu-black transition duration-200 hover:border-suu-red/30 hover:text-suu-red">
                  Open
                  <ChevronRight size={15} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ManagerStudentTable;
