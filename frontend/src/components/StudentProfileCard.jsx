import { Mail, MessageSquareMore, ShieldCheck, Users } from "lucide-react";
import { getBlockedCount, getProgressPercent, getTasksRemaining } from "../utils/progress";
import { getReadiness } from "../utils/readiness";
import ProgressBar from "./ProgressBar";

function StudentProfileCard({ student }) {
  const progress = getProgressPercent(student.tasks);
  const remaining = getTasksRemaining(student.tasks);
  const blockers = getBlockedCount(student.tasks);
  const readiness = getReadiness(student);

  return (
    <section className="glass-panel overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-suu-red via-suu-redAlt to-suu-black" />
      <div className="p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="section-kicker">Student Profile</p>
            <h2 className="mt-2 text-3xl font-semibold text-suu-black">{student.name}</h2>
            <p className="mt-1 text-sm text-suu-darkGray">{student.email}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-suu-darkGray">
              <span className="rounded-full bg-suu-gray px-3 py-1">Started {student.startDate}</span>
              <span className="rounded-full bg-suu-gray px-3 py-1">{student.team}</span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3">
            <a
              href={`mailto:${student.mentorEmail}?subject=Onboarding Help Needed`}
              className="btn-primary"
            >
              <MessageSquareMore size={16} />
              Message Mentor
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[22px] bg-[#faf7f6] p-5">
            <ProgressBar value={progress} label="T-Bird onboarding progress" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label="Tasks Remaining" value={`${remaining}`} icon={Users} />
              <Metric label="Blockers" value={`${blockers}`} icon={ShieldCheck} />
              <Metric label="Readiness Score" value={`${readiness.score}`} icon={Mail} />
            </div>
          </div>

          <div className="rounded-[22px] bg-suu-black p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
              Assigned Mentor
            </p>
            <h3 className="mt-3 text-xl font-semibold">{student.mentor}</h3>
            <p className="mt-1 text-sm text-white/80">{student.mentorRole}</p>
            <a href={`mailto:${student.mentorEmail}`} className="mt-4 inline-block text-sm text-white/90 underline">
              {student.mentorEmail}
            </a>
            {progress === 100 ? (
              <p className="mt-5 rounded-2xl bg-white/10 px-3 py-3 text-sm text-white">
                Onboarding complete. This student is Thunderbird Ready for team contribution.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="flex items-center gap-2 text-suu-darkGray">
        <Icon size={16} />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-2 text-xl font-semibold text-suu-black">{value}</p>
    </div>
  );
}

export default StudentProfileCard;
