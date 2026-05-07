import { Clipboard, Sparkles, X } from "lucide-react";

function BlockerAssistant({ task, result, loading, error, onClose }) {
  async function handleCopy() {
    if (result?.messageToMentor) {
      await navigator.clipboard.writeText(result.messageToMentor);
    }
  }

  return (
    <aside className="glass-panel sticky top-6 p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 ring-1 ring-inset ring-violet-200">
            <Sparkles size={14} />
            AI Blocker Assistant
          </p>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">
            {task ? task.title : "Select a task"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Describe what is blocking you. The assistant suggests next steps and a message
            you can send to your mentor.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close blocker assistant"
        >
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-700">Analyzing blocker...</p>
          <p className="mt-2 text-sm text-slate-500">
            Reviewing the task, current note, and common onboarding issues.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!loading && !error && result ? (
        <div className="space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Summary
            </h4>
            <p className="mt-2 text-sm leading-6 text-slate-700">{result.summary}</p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Possible Causes
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {result.possibleCauses.map((item) => (
                <li key={item} className="rounded-2xl bg-slate-50 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Recommended Steps
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {result.recommendedSteps.map((item) => (
                <li key={item} className="rounded-2xl bg-sky-50 px-3 py-2 text-sky-900">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-950 p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
                Suggested Message to Mentor
              </h4>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                <Clipboard size={14} />
                Copy
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-100">{result.messageToMentor}</p>
          </section>
        </div>
      ) : null}

      {!loading && !result && !error ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          Select a blocked task or add a note to get tailored troubleshooting help.
        </div>
      ) : null}
    </aside>
  );
}

export default BlockerAssistant;
