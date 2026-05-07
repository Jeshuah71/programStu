import { Sparkles } from "lucide-react";

function ManagerSummaryPanel({ summary, loading, onGenerate }) {
  async function handleCopy() {
    if (!summary) {
      return;
    }

    const report = [
      "SUU Student Programmer Weekly Report",
      "",
      `Team Snapshot: ${summary.teamSnapshot}`,
      "",
      "Students Needing Attention:",
      ...summary.studentsNeedingAttention.map((item) => `- ${item}`),
      "",
      "Common Blockers:",
      ...summary.commonBlockers.map((item) => `- ${item}`),
      "",
      "Suggested Manager Actions:",
      ...summary.suggestedManagerActions.map((item) => `- ${item}`),
      "",
      "Wins This Week:",
      ...summary.winsThisWeek.map((item) => `- ${item}`),
      "",
      "Next Week Focus:",
      ...summary.nextWeekFocus.map((item) => `- ${item}`)
    ].join("\n");

    await navigator.clipboard.writeText(report);
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="section-kicker">
            Weekly AI Summary
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-suu-black">Manager weekly report</h3>
          <p className="mt-2 text-sm leading-6 text-suu-darkGray">
            Generate a quick weekly summary of onboarding progress, risks, wins, and
            recommended next actions.
          </p>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onGenerate} disabled={loading} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
            <Sparkles size={16} />
            {loading ? "Generating..." : "Generate Weekly AI Summary"}
          </button>
          {summary ? (
            <button type="button" onClick={handleCopy} className="btn-secondary">
              Copy Report
            </button>
          ) : null}
        </div>
      </div>

      {summary ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-suu-darkGray">
              Team Snapshot
            </h4>
            <p className="mt-3 text-sm leading-7 text-suu-black">{summary.teamSnapshot}</p>
          </section>
          <SummaryList title="Students Needing Attention" items={summary.studentsNeedingAttention} tone="rose" />
          <SummaryList title="Wins This Week" items={summary.winsThisWeek} tone="emerald" />
          <SummaryList title="Common Blockers" items={summary.commonBlockers} tone="sky" />
          <SummaryList title="Suggested Manager Actions" items={summary.suggestedManagerActions} tone="sky" />
          <SummaryList title="Next Week Focus" items={summary.nextWeekFocus} tone="sky" spanFull />
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-suu-black/10 bg-[#faf7f6] p-6 text-sm text-suu-darkGray">
          No summary generated yet. Use the AI summary button to prepare a manager-ready weekly
          update.
        </div>
      )}
    </div>
  );
}

function SummaryList({ title, items = [], tone, spanFull = false }) {
  const toneClasses = {
    rose: "bg-[#fff7f7] text-suu-red",
    emerald: "bg-emerald-50 text-emerald-800",
    sky: "bg-[#faf7f6] text-suu-black"
  };

  return (
    <section className={`rounded-3xl border border-slate-200 bg-white p-5 ${spanFull ? "lg:col-span-2" : ""}`}>
      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-suu-darkGray">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className={`rounded-2xl px-3 py-2 text-sm ${toneClasses[tone]}`}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ManagerSummaryPanel;
