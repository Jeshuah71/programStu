import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ChecklistItem from "./ChecklistItem";

function StudentChecklist({ groupedTasks, onUpdateTask, onOpenAssistant, savingTaskId }) {
  const [openPhases, setOpenPhases] = useState({});

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([phase, tasks]) => (
        <PhaseSection
          key={phase}
          phase={phase}
          tasks={tasks}
          open={openPhases[phase] ?? tasks.some((task) => task.status !== "completed")}
          onToggle={() =>
            setOpenPhases((current) => ({
              ...current,
              [phase]: !(current[phase] ?? tasks.some((task) => task.status !== "completed"))
            }))
          }
        >
          {tasks.map((task) => (
            <ChecklistItem
              key={task.id}
              task={task}
              saving={savingTaskId === task.id}
              onUpdateTask={onUpdateTask}
              onOpenAssistant={onOpenAssistant}
            />
          ))}
        </PhaseSection>
      ))}
    </div>
  );
}

function PhaseSection({ phase, tasks, open, onToggle, children }) {
  const completed = tasks.filter((task) => task.status === "completed").length;

  return (
    <section className="glass-panel p-5">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 text-left">
        <div>
          <p className="section-kicker">Onboarding Phase</p>
          <h3 className="mt-1 text-xl font-semibold text-suu-black">{phase}</h3>
          <p className="mt-2 text-sm text-suu-darkGray">
            {completed} of {tasks.length} tasks complete
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-suu-gray px-3 py-1 text-xs font-medium text-suu-darkGray">
            {tasks.length} tasks
          </div>
          <span className="rounded-full bg-white p-2 text-suu-darkGray">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </button>

      {open ? <div className="mt-4 space-y-4">{children}</div> : null}
    </section>
  );
}

export default StudentChecklist;
