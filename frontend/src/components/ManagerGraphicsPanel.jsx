import { getBlockedCount, getCurrentPhase, getProgressPercent } from "../utils/progress";
import { getReadiness } from "../utils/readiness";

function ManagerGraphicsPanel({ students }) {
  const total = students.length || 1;
  const complete = students.filter((student) => getProgressPercent(student.tasks) === 100).length;
  const blocked = students.filter((student) => getBlockedCount(student.tasks) > 0).length;
  const onTrack = students.filter((student) => {
    const progress = getProgressPercent(student.tasks);
    return progress >= 30 && progress < 100 && getBlockedCount(student.tasks) === 0;
  }).length;
  const atRisk = students.filter((student) => {
    const progress = getProgressPercent(student.tasks);
    return progress < 30 || getBlockedCount(student.tasks) > 0;
  }).length;

  const phaseCounts = students.reduce((acc, student) => {
    const phase = getCurrentPhase(student.tasks);
    acc[phase] = (acc[phase] || 0) + 1;
    return acc;
  }, {});

  const readinessCounts = students.reduce((acc, student) => {
    const readiness = getReadiness(student).label;
    acc[readiness] = (acc[readiness] || 0) + 1;
    return acc;
  }, {});

  const phaseEntries = Object.entries(phaseCounts).sort((a, b) => b[1] - a[1]);
  const readinessEntries = [
    ["Thunderbird Ready", readinessCounts["Thunderbird Ready"] || 0],
    ["Almost Ready", readinessCounts["Almost Ready"] || 0],
    ["Getting Started", readinessCounts["Getting Started"] || 0],
    ["Not Ready", readinessCounts["Not Ready"] || 0]
  ];
  const mentorCounts = students.reduce((acc, student) => {
    acc[student.mentor] = (acc[student.mentor] || 0) + 1;
    return acc;
  }, {});
  const mentorEntries = Object.entries(mentorCounts).sort((a, b) => b[1] - a[1]);

  return (
    <section className="glass-panel p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-kicker">Dashboard Graphics</p>
          <h2 className="mt-2 text-2xl font-semibold text-suu-black">Visual team snapshot</h2>
          <p className="mt-2 text-sm text-suu-darkGray">
            Quick graphics for supervisor demos: progress mix, current phase load, and readiness distribution.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
        <article className="rounded-[22px] border border-suu-black/8 bg-[#faf7f6] p-5">
          <h3 className="text-base font-semibold text-suu-black">Progress mix</h3>
          <div className="mt-5 overflow-hidden rounded-full bg-white">
            <div className="flex h-5 w-full">
              <div className="bg-suu-black" style={{ width: `${(complete / total) * 100}%` }} />
              <div className="bg-suu-red" style={{ width: `${(onTrack / total) * 100}%` }} />
              <div className="bg-suu-redAlt/70" style={{ width: `${(blocked / total) * 100}%` }} />
              <div className="bg-suu-gray" style={{ width: `${(atRisk / total) * 100}%` }} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Legend label="Complete" value={complete} tone="bg-suu-black" />
            <Legend label="On Track" value={onTrack} tone="bg-suu-red" />
            <Legend label="Blocked" value={blocked} tone="bg-[#f28b82]" />
            <Legend label="At Risk" value={atRisk} tone="bg-suu-gray" />
          </div>
        </article>

        <article className="rounded-[22px] border border-suu-black/8 bg-[#faf7f6] p-5">
          <h3 className="text-base font-semibold text-suu-black">Current phase load</h3>
          <div className="mt-5 space-y-3">
            {phaseEntries.map(([phase, count]) => (
              <div key={phase}>
                <div className="mb-1 flex items-center justify-between text-sm text-suu-darkGray">
                  <span>{phase}</span>
                  <span className="font-semibold text-suu-black">{count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-suu-red via-suu-redAlt to-suu-black"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[22px] border border-suu-black/8 bg-[#faf7f6] p-5">
          <h3 className="text-base font-semibold text-suu-black">Readiness distribution</h3>
          <div className="mt-5 space-y-3">
            {readinessEntries.map(([label, count]) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-32 text-sm text-suu-darkGray">{label}</div>
                <div className="flex-1 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-4 rounded-full ${
                      label === "Thunderbird Ready"
                        ? "bg-suu-red"
                        : label === "Almost Ready"
                          ? "bg-suu-black"
                          : label === "Getting Started"
                            ? "bg-suu-darkGray"
                            : "bg-[#f28b82]"
                    }`}
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
                <div className="w-8 text-right text-sm font-semibold text-suu-black">{count}</div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[22px] border border-suu-black/8 bg-[#faf7f6] p-5">
          <h3 className="text-base font-semibold text-suu-black">Mentor workload</h3>
          <div className="mt-5 space-y-3">
            {mentorEntries.map(([mentor, count]) => (
              <div key={mentor}>
                <div className="mb-1 flex items-center justify-between text-sm text-suu-darkGray">
                  <span>{mentor}</span>
                  <span className="font-semibold text-suu-black">{count} students</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-suu-red"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function Legend({ label, value, tone }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${tone}`} />
      <span className="text-suu-darkGray">{label}</span>
      <span className="ml-auto font-semibold text-suu-black">{value}</span>
    </div>
  );
}

export default ManagerGraphicsPanel;
