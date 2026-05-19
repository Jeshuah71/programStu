import { useDroppable } from "@dnd-kit/core";
import StoryCard from "./StoryCard";

function KanbanColumn({ column, stories, epics, students, showDoneAll, onToggleDone, onCreateWorktree }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const wipText = column.wipLimit ? `${stories.length}/${column.wipLimit}` : `${stories.length}`;
  const overLimit = column.wipLimit && stories.length > column.wipLimit;

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-[360px] w-[280px] shrink-0 flex-col rounded-lg border border-slate-200 bg-white shadow-card transition ${
        isOver ? "ring-4 ring-suu-red/10" : ""
      }`}
    >
      <div className="h-1.5 rounded-t-lg" style={{ backgroundColor: column.color }} />
      <header className="border-b border-slate-100 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-suu-black">{column.title}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">{column.description}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${overLimit ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>
            {wipText}
          </span>
        </div>
        {column.id === "done" ? (
          <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
            <input type="checkbox" checked={showDoneAll} onChange={onToggleDone} />
            Show all done
          </label>
        ) : null}
      </header>

      <div className="flex flex-1 flex-col gap-3 p-3">
        {stories.length ? (
          stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              epic={epics.find((epic) => epic.id === story.epicId)}
              assignee={students.find((student) => student.id === story.assigneeStudentId)}
              onCreateWorktree={onCreateWorktree}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
            No stories here.
          </div>
        )}
      </div>
    </section>
  );
}

export default KanbanColumn;

