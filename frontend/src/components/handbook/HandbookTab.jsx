import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";

const sections = [
  {
    id: "how-we-work",
    title: "How We Work",
    body: "We use Kanban to make work visible and reduce hidden queues. Pull from Refined / Ready when you have capacity, respect WIP limits, and move cards as soon as the work state changes."
  },
  {
    id: "epic-vs-story",
    title: "Epic vs Story",
    body: "An epic is the larger outcome, such as Fraud Reporting Intake. A story is one deliverable inside that epic, such as adding form validation, and it should produce exactly one artifact."
  },
  {
    id: "story-anatomy",
    title: "Story Anatomy",
    body: "Use Overview, Requirements, and Outcomes. Example: Overview explains why fraud reports need validation, Requirements list independently verifiable checks, and Outcomes link the PR plus verification notes."
  },
  {
    id: "git-workflow",
    title: "Git Workflow",
    body: "Use feat/story-slug branches, one worktree per active story, small commits with clear messages, and PR descriptions that include summary, testing, screenshots, and open questions."
  },
  {
    id: "getting-unstuck",
    title: "Getting Unstuck",
    body: "Ask for help when you have a specific error, missing access, unclear requirement, or a blocker that has lasted more than a day. A good blocker says what you tried, what happened, and what decision or access you need."
  },
  {
    id: "code-review",
    title: "Code Review",
    body: "Reviewers look for correctness, readability, tests, security, and maintainability. Respond to feedback with what changed or what needs discussion; approved means the reviewer is comfortable with the code merging."
  },
  {
    id: "definition-of-done",
    title: "Definition of Done",
    body: "Done means merged or delivered, verified, documented where needed, and no hidden follow-up. If follow-up exists, create a new story instead of burying it in a comment."
  }
];

function HandbookTab({ student }) {
  const storageKey = `suu-handbook-read-${student?.id || "demo"}`;
  const [openId, setOpenId] = useState(sections[0].id);
  const [readIds, setReadIds] = useState([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    setReadIds(saved ? JSON.parse(saved) : []);
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(readIds));
  }, [readIds, storageKey]);

  const readCount = useMemo(() => readIds.length, [readIds]);

  function toggleRead(sectionId) {
    setReadIds((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId]
    );
  }

  return (
    <section className="glass-panel p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="section-kicker">Student Handbook</p>
          <h2 className="mt-2 text-2xl font-semibold text-suu-black">Team work guide</h2>
          <p className="mt-2 text-sm leading-6 text-suu-darkGray">Read the team workflow guide and track your progress locally.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
          <CheckCircle2 size={16} />
          {readCount} of {sections.length} sections read
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {sections.map((section) => {
          const open = openId === section.id;
          const read = readIds.includes(section.id);
          return (
            <article key={section.id} className="rounded-lg border border-slate-200 bg-white">
              <button type="button" className="flex w-full items-center justify-between gap-3 p-4 text-left" onClick={() => setOpenId(open ? "" : section.id)}>
                <span className="font-semibold text-suu-black">{section.title}</span>
                <ChevronDown size={18} className={`shrink-0 transition ${open ? "rotate-180" : ""}`} />
              </button>
              {open ? (
                <div className="border-t border-slate-100 p-4">
                  <p className="text-sm leading-7 text-suu-darkGray">{section.body}</p>
                  <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-suu-black">
                    <input type="checkbox" checked={read} onChange={() => toggleRead(section.id)} />
                    Mark as read
                  </label>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <section className="mt-5 rounded-lg border border-slate-200 bg-[#faf7f6] p-4">
        <p className="section-kicker">CLI Setup</p>
        <h3 className="mt-2 text-lg font-semibold text-suu-black">GitHub CLI and Claude Code</h3>
        <p className="mt-2 text-sm leading-6 text-suu-darkGray">
          Use these commands to inspect project work, create a story issue with the template, and mark work done from your terminal.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-suu-black p-4 text-xs leading-6 text-white">{`gh project item-list 8 --owner suu-itadm

gh issue create --title "Story: add fraud report validation" --body-file story-template.md --label story

gh project item-edit --id ITEM_ID --project-id 8 --field-id STATUS_FIELD_ID --single-select-option-id DONE_OPTION_ID

claude "Use the Story Anatomy template to draft acceptance criteria for this issue."`}</pre>
      </section>
    </section>
  );
}

export default HandbookTab;

