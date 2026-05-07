import { Clipboard, Sparkles, X } from "lucide-react";

function SUUOnboardingAssistant({ task, result, loading, error, onClose }) {
  if (!task && !loading && !error && !result) {
    return null;
  }

  async function handleCopy() {
    if (result?.messageToMentor) {
      await navigator.clipboard.writeText(result.messageToMentor);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-suu-black/40 p-4 backdrop-blur-sm">
      <div className="mx-auto mt-8 max-w-3xl">
        <aside className="glass-panel max-h-[86vh] overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-suu-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-suu-red">
                <Sparkles size={14} />
                SUU Onboarding Assistant
              </span>
              <h3 className="mt-3 text-xl font-semibold text-suu-black">
                {task ? task.title : "Select a task"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-suu-darkGray">
                Explain onboarding steps, troubleshoot blockers, or draft a polished message to the assigned mentor.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl p-2 text-suu-darkGray transition hover:bg-suu-gray hover:text-suu-black"
              aria-label="Close onboarding assistant"
            >
              <X size={18} />
            </button>
          </div>

          {loading ? (
            <div className="mt-5 rounded-[22px] bg-[#faf7f6] p-5 text-sm text-suu-darkGray">
              Analyzing the onboarding step and preparing SUU-specific guidance...
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-[22px] border border-suu-red/20 bg-[#fff7f7] p-4 text-sm text-suu-red">
              {error}
            </div>
          ) : null}

          {!loading && !error && result ? (
            <div className="mt-5 space-y-4">
              <section className="rounded-[22px] border border-suu-black/8 bg-white p-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-suu-darkGray">
                  {result.title || "Summary"}
                </h4>
                <p className="mt-3 text-sm leading-6 text-suu-black">{result.summary}</p>
              </section>

              <section className="rounded-[22px] border border-suu-black/8 bg-white p-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-suu-darkGray">
                  Key context
                </h4>
                <ul className="mt-3 space-y-2">
                  {result.possibleCauses.map((item) => (
                    <li key={item} className="rounded-2xl bg-[#faf7f6] px-3 py-2 text-sm text-suu-darkGray">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[22px] border border-suu-black/8 bg-white p-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-suu-darkGray">
                  Suggested next steps
                </h4>
                <ul className="mt-3 space-y-2">
                  {result.recommendedSteps.map((item) => (
                    <li key={item} className="rounded-2xl bg-suu-red/5 px-3 py-2 text-sm text-suu-black">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[22px] bg-suu-black p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                    Draft mentor message
                  </h4>
                  <button type="button" onClick={handleCopy} className="btn-tertiary border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                    <Clipboard size={14} />
                    Copy
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/95">{result.messageToMentor}</p>
              </section>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

export default SUUOnboardingAssistant;
