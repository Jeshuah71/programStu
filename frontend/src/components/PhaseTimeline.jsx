import { getPhaseTimeline } from "../utils/progress";
import StatusBadge from "./StatusBadge";

function PhaseTimeline({ tasks }) {
  const phases = getPhaseTimeline(tasks);
  const currentIndex = phases.findIndex((phase) => phase.status === "in-progress" || phase.status === "blocked");
  const highlightIndex = currentIndex === -1 ? phases.findIndex((phase) => phase.status !== "completed") : currentIndex;

  return (
    <section className="glass-panel p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-kicker">Onboarding Roadmap</p>
          <h3 className="mt-2 text-2xl font-semibold text-suu-black">Phase timeline</h3>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        {phases.map((phase, index) => {
          const active = index === highlightIndex;

          return (
            <article
              key={phase.phase}
              className={`rounded-[22px] border p-4 transition ${
                active
                  ? "border-suu-red bg-suu-red/5 shadow-card"
                  : "border-suu-black/8 bg-white"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-suu-darkGray">
                  Phase {index + 1}
                </span>
                <StatusBadge status={phase.status} />
              </div>
              <h4 className="text-base font-semibold text-suu-black">{phase.phase}</h4>
              <p className="mt-3 text-sm text-suu-darkGray">
                {phase.completed} of {phase.total} tasks completed
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default PhaseTimeline;
