import { Plus } from "lucide-react";
import { KANBAN_COLUMNS } from "../../utils/workManagement";

function EpicCard({ epic, stories, onAddStory }) {
  const done = stories.filter((story) => story.status === "done").length;
  const total = stories.length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1B4F72]">{epic.owner}</p>
          <h3 className="mt-2 text-xl font-semibold text-suu-black">{epic.title}</h3>
          <p className="mt-2 text-sm leading-6 text-suu-darkGray">{epic.description}</p>
          <p className="mt-3 text-xs font-semibold text-slate-500">
            {formatDate(epic.startDate)} - {formatDate(epic.endDate)}
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => onAddStory(epic.id)}>
          <Plus size={16} />
          Add Story
        </button>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
          <span>{done} of {total} stories done</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-[#1B4F72]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {stories.map((story) => {
          const column = KANBAN_COLUMNS.find((item) => item.id === story.status);
          return (
            <li key={story.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="min-w-0 truncate font-semibold text-suu-black">{story.title}</span>
              <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-white" style={{ backgroundColor: column?.color || "#6B7280" }}>
                {column?.title || story.status}
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

export default EpicCard;

