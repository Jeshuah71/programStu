import { BookOpenText, CheckCircle2, MessageSquareQuote, Sparkles, TriangleAlert } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { statusOptions } from "../utils/status";

function ChecklistItem({ task, onUpdateTask, onOpenAssistant, saving }) {
  
  return (
    <article className="rounded-3xl border border-suu-black/8 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-suu-red/15 hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                task.status === "completed"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-suu-gray text-suu-darkGray"
              }`}
            >
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h4 className="text-base font-semibold text-suu-black">{task.title}</h4>
              <p className="text-sm text-suu-darkGray">{task.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={task.status} />
            <a
              href={task.resourceUrl}
              className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-sm font-medium text-suu-red transition duration-200 hover:bg-suu-red/5 hover:text-suu-redAlt"
            >
              <BookOpenText size={16} />
              {task.resourceTitle}
            </a>
          </div>
        </div>

        <div className="grid gap-3 lg:min-w-[260px]">
          <label className="text-sm font-medium text-suu-darkGray">
            Status
            <select
              className="field mt-2"
              value={task.status}
              disabled={saving}
              onChange={(event) =>
                onUpdateTask(task.id, { status: event.target.value, note: task.note })
              }
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4">
        <label className="label" htmlFor={`note-${task.id}`}>
          Notes, blocker details, or reflection context
        </label>
        <textarea
          id={`note-${task.id}`}
          rows="3"
          className="field resize-none"
          placeholder="Add context, questions, or troubleshooting notes."
          value={task.note}
          onChange={(event) => onUpdateTask(task.id, { note: event.target.value }, true)}
          onBlur={(event) => onUpdateTask(task.id, { note: event.target.value, status: task.status })}
        />
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => onOpenAssistant(task, "explain")}
          className="btn-tertiary"
        >
          <Sparkles size={16} />
          Explain this task
        </button>
        <button
          type="button"
          onClick={() => onOpenAssistant(task, "blocked")}
          className="btn-primary"
        >
          <TriangleAlert size={16} />
          I&apos;m blocked
        </button>
        <button
          type="button"
          onClick={() => onOpenAssistant(task, "draft-message")}
          className="btn-secondary"
        >
          <MessageSquareQuote size={16} />
          Draft mentor message
        </button>
      </div>
    </article>
  );
}

export default ChecklistItem;
