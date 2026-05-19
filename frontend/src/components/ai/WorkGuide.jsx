import { useState } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import { api } from "../../api";
import { getMockWorkGuide } from "../../mockAi";
import { buildWorkGuideContext } from "../../utils/workManagement";

function WorkGuide({ student, stories, epics, blockers, prs, demoMode }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk() {
    if (!student) {
      return;
    }
    setLoading(true);
    setError("");
    const studentStories = stories.filter((story) => story.assigneeStudentId === student.id);
    const context = buildWorkGuideContext({ stories, epics, student, blockers, prs });

    try {
      let data;
      if (!demoMode) {
        try {
          data = await api.getWorkGuide(context);
        } catch (_error) {
          data = getMockWorkGuide({ student, stories: studentStories, epics, blockers });
        }
      } else {
        data = getMockWorkGuide({ student, stories: studentStories, epics, blockers });
      }
      setResult(data);
    } catch (guideError) {
      setError(guideError.message || "Unable to generate work guidance.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass-panel p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="section-kicker">Claude Work Guide</p>
          <h2 className="mt-2 text-2xl font-semibold text-suu-black">What should I work on?</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-suu-darkGray">
            Uses your Kanban state, onboarding phase, blockers, and recent PRs to recommend one next story.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={handleAsk} disabled={loading}>
          <Sparkles size={16} />
          {loading ? "Asking Claude..." : "What should I work on?"}
        </button>
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 bg-[#faf7f6] p-4">
        {error ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-suu-red">
            <AlertTriangle size={16} />
            {error}
          </p>
        ) : result ? (
          <p className="text-sm leading-7 text-suu-black">{result.message || result.summary || result.recommendation}</p>
        ) : (
          <p className="text-sm leading-7 text-suu-darkGray">Click the button for a short, specific recommendation based on your current board.</p>
        )}
      </div>
    </section>
  );
}

export default WorkGuide;

