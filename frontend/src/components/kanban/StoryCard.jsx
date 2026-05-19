import { CSS } from "@dnd-kit/utilities";
import { useDraggable } from "@dnd-kit/core";
import { AlertTriangle, Clock } from "lucide-react";
import ArtifactBadge from "../shared/ArtifactBadge";
import EpicBadge from "../shared/EpicBadge";
import StaleBadge from "../shared/StaleBadge";
import { COLUMN_BY_ID, getDaysInColumn, getStudentInitials, isStoryStale } from "../../utils/workManagement";

function StoryCard({ story, epic, assignee, onCreateWorktree }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: story.id,
    data: { storyId: story.id, status: story.status }
  });
  const column = COLUMN_BY_ID[story.status] || COLUMN_BY_ID.backlog;
  const blocked = story.status === "blocked";
  const stale = isStoryStale(story);
  const days = getDaysInColumn(story);
  const style = {
    transform: CSS.Translate.toString(transform),
    borderLeftColor: blocked ? "#DC2626" : column.color
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`touch-none rounded-lg border border-slate-200 border-l-4 p-3 shadow-sm transition duration-200 ${
        stale ? "bg-slate-50" : "bg-white"
      } ${isDragging ? "z-20 scale-[1.02] opacity-80 shadow-lg" : "hover:-translate-y-0.5 hover:shadow-md"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold leading-5 text-suu-black">{story.title}</h4>
        <StaleBadge visible={stale} />
      </div>

      <div className="mt-3">
        <EpicBadge epic={epic} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ArtifactBadge artifact={story.artifact} storyType={story.storyType} />
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          <Clock size={12} />
          {days}d
        </span>
        {story.estimateDays > 5 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-800">
            <AlertTriangle size={12} />
            Split?
          </span>
        ) : null}
      </div>

      {blocked ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
          {story.blockedReason || "Blocked work needs mentor attention."}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1B4F72] text-xs font-bold text-white">
            {getStudentInitials(assignee?.name)}
          </span>
          <span className="truncate text-xs font-semibold text-slate-600">{assignee?.name || "Unassigned"}</span>
        </div>
        {onCreateWorktree ? (
          <button
            type="button"
            className="shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-suu-red hover:text-suu-red"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onCreateWorktree(story);
            }}
          >
            Worktree
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default StoryCard;

