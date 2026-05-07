import { Sparkles } from "lucide-react";

function StarterIssuesPanel({ starterIssues, students, selectedStudent, compact = false }) {
  const recommended =
    selectedStudent &&
    starterIssues.find(
      (issue) =>
        issue.status === "Open" &&
        (issue.skills.includes("React") || issue.skills.includes("Git") || issue.skills.includes("UX"))
    );

  if (compact && selectedStudent) {
    return (
      <section className="glass-panel p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-suu-black p-3 text-white">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="section-kicker">Starter Issues</p>
            <h3 className="mt-1 text-xl font-semibold text-suu-black">Recommended next starter issue</h3>
          </div>
        </div>

        {recommended ? (
          <div className="mt-5 rounded-[20px] border border-suu-black/8 bg-[#faf7f6] p-4">
            <h4 className="text-lg font-semibold text-suu-black">{recommended.title}</h4>
            <p className="mt-2 text-sm text-suu-darkGray">
              Difficulty: {recommended.difficulty} · Estimated time: {recommended.estimatedTime}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {recommended.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-suu-darkGray">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[20px] border border-dashed border-suu-black/10 bg-white p-4 text-sm text-suu-darkGray">
            Keep moving through the onboarding roadmap. Starter issue recommendations unlock once the student is closer to independent contribution.
          </div>
        )}
      </section>
    );
  }

  const openCount = starterIssues.filter((issue) => issue.status === "Open").length;
  const assignedCount = starterIssues.filter((issue) => issue.status === "Assigned").length;
  const doneCount = starterIssues.filter((issue) => issue.status === "Done").length;

  return (
    <section className="glass-panel p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="section-kicker">Starter Issues</p>
          <h3 className="mt-2 text-2xl font-semibold text-suu-black">Manager starter issue overview</h3>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="rounded-full bg-suu-gray px-3 py-1 font-semibold text-suu-black">Open {openCount}</span>
          <span className="rounded-full bg-suu-black px-3 py-1 font-semibold text-white">Assigned {assignedCount}</span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">Done {doneCount}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {starterIssues.map((issue) => {
          const student = students.find((entry) => entry.id === issue.assignedStudentId);
          return (
            <article key={issue.id} className="rounded-[22px] border border-suu-black/8 bg-[#faf7f6] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-suu-black">{issue.title}</h4>
                  <p className="mt-1 text-sm text-suu-darkGray">
                    {issue.difficulty} · {issue.estimatedTime}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${issue.status === "Done" ? "bg-emerald-50 text-emerald-700" : issue.status === "Assigned" ? "bg-suu-black text-white" : "bg-white text-suu-red ring-1 ring-inset ring-suu-red/20"}`}>
                  {issue.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {issue.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-suu-darkGray">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-suu-darkGray">
                {student ? `Assigned to ${student.name}` : "Unassigned and ready for a student above 70% progress."}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default StarterIssuesPanel;
