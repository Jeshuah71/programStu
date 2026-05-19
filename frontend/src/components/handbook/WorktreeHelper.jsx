import { Clipboard, GitBranch } from "lucide-react";
import { slugifyStory } from "../../utils/workManagement";

function getCommand(story) {
  const slug = slugifyStory(story?.title || "story-name");
  return `git worktree add ../${slug} -b feat/${slug}`;
}

function WorktreeHelper({ student, stories, worktrees, onCopyCommand }) {
  const studentStories = stories.filter((story) => story.assigneeStudentId === student?.id && story.status !== "done");
  const studentWorktrees = worktrees.filter((worktree) => worktree.studentId === student?.id);

  return (
    <section className="glass-panel p-5">
      <div>
        <p className="section-kicker">Git Worktrees</p>
        <h2 className="mt-2 text-2xl font-semibold text-suu-black">My Worktrees</h2>
        <p className="mt-2 text-sm leading-6 text-suu-darkGray">Keep each story in its own branch and directory so context switching stays clean.</p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-suu-black">Active worktrees</h3>
          <div className="mt-3 space-y-2">
            {studentWorktrees.length ? (
              studentWorktrees.map((worktree) => {
                const story = stories.find((item) => item.id === worktree.storyId);
                return (
                  <div key={worktree.id} className="rounded-lg bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-suu-black">
                      <GitBranch size={15} />
                      {worktree.branch}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{worktree.path} maps to {story?.title || "Unknown story"}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">No active worktrees are configured for this student yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-suu-black">Create worktree for this story</h3>
          <div className="mt-3 space-y-2">
            {studentStories.slice(0, 4).map((story) => (
              <button
                key={story.id}
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-suu-black hover:border-suu-red"
                onClick={() => onCopyCommand(story)}
              >
                <span className="min-w-0 truncate">{story.title}</span>
                <Clipboard size={15} className="shrink-0 text-suu-red" />
              </button>
            ))}
          </div>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-suu-black p-3 text-xs text-white">{getCommand(studentStories[0])}</pre>
        </div>
      </div>
    </section>
  );
}

export { getCommand as getWorktreeCommand };
export default WorktreeHelper;

