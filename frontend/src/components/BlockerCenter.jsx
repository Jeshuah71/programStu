function getManagerAction(task) {
  const text = `${task.title} ${task.note}`.toLowerCase();
  if (text.includes("repo") || text.includes("github")) {
    return "Verify org access and confirm the repository URL with the mentor.";
  }
  if (text.includes("npm") || text.includes("dependency")) {
    return "Check Node version alignment and review the first failing install error.";
  }
  if (text.includes("vm") || text.includes("environment")) {
    return "Run a focused environment setup check with screenshots or terminal output.";
  }
  return "Review the note with the mentor and define the next concrete troubleshooting step.";
}

function BlockerCenter({ students }) {
  const blockers = students.flatMap((student) =>
    student.tasks
      .filter((task) => task.status === "blocked")
      .map((task) => ({
        id: `${student.id}-${task.id}`,
        studentName: student.name,
        mentor: student.mentor,
        phase: task.phase,
        taskTitle: task.title,
        note: task.note || "No blocker note added yet.",
        managerAction: getManagerAction(task)
      }))
  );

  return (
    <section className="glass-panel p-6">
      <div>
        <p className="section-kicker">Active Blocker Center</p>
        <h3 className="mt-2 text-2xl font-semibold text-suu-black">Supervisor blocker queue</h3>
        <p className="mt-2 text-sm text-suu-darkGray">
          Review blocked tasks across SUU student programmers and prioritize manager follow-up.
        </p>
      </div>

      {blockers.length ? (
        <div className="mt-5 space-y-4">
          {blockers.map((item) => (
            <article key={item.id} className="rounded-[22px] border border-suu-red/15 bg-[#fff7f7] p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-suu-black">
                    {item.studentName} · {item.taskTitle}
                  </h4>
                  <p className="mt-1 text-sm text-suu-darkGray">
                    {item.phase} · Mentor: {item.mentor}
                  </p>
                  <p className="mt-3 text-sm text-suu-darkGray">{item.note}</p>
                </div>
                <div className="max-w-sm rounded-2xl bg-white px-4 py-3 text-sm text-suu-black">
                  <span className="font-semibold text-suu-red">Suggested manager action:</span>{" "}
                  {item.managerAction}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[22px] border border-dashed border-suu-black/10 bg-white p-6 text-sm text-suu-darkGray">
          No active blockers right now.
        </div>
      )}
    </section>
  );
}

export default BlockerCenter;
