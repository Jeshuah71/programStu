import { useMemo, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import StoryCreateModal from "./StoryCreateModal";
import { KANBAN_COLUMNS, getDaysInColumn } from "../../utils/workManagement";

function KanbanBoard({
  mode,
  students,
  selectedStudent,
  stories,
  epics,
  onMoveStory,
  onCreateStory,
  onCreateWorktree
}) {
  const [studentFilter, setStudentFilter] = useState("all");
  const [epicFilter, setEpicFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showDoneAll, setShowDoneAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const visibleStories = useMemo(() => {
    const now = Date.now();
    return stories.filter((story) => {
      if (mode === "student" && selectedStudent && story.assigneeStudentId !== selectedStudent.id) {
        return false;
      }
      if (mode === "manager" && studentFilter !== "all" && story.assigneeStudentId !== studentFilter) {
        return false;
      }
      if (epicFilter !== "all" && story.epicId !== epicFilter) {
        return false;
      }
      if (assigneeFilter !== "all" && story.assigneeStudentId !== assigneeFilter) {
        return false;
      }
      if (statusFilter !== "all" && story.status !== statusFilter) {
        return false;
      }
      if (story.status === "done" && !showDoneAll) {
        const moved = new Date(story.movedAt).getTime();
        if (Number.isFinite(moved) && now - moved > 14 * 86400000) {
          return false;
        }
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const epic = epics.find((item) => item.id === story.epicId);
        return `${story.title} ${epic?.title || ""}`.toLowerCase().includes(query);
      }
      return true;
    });
  }, [stories, mode, selectedStudent, studentFilter, epicFilter, assigneeFilter, statusFilter, showDoneAll, search, epics]);

  function handleDragEnd(event) {
    const storyId = event.active?.id;
    const nextStatus = event.over?.id;
    const story = stories.find((item) => item.id === storyId);
    if (!story || !nextStatus || story.status === nextStatus) {
      return;
    }
    onMoveStory(storyId, nextStatus);
    if (nextStatus === "done") {
      setCelebrating(true);
      window.setTimeout(() => setCelebrating(false), 900);
    }
  }

  const readyStories = visibleStories.filter((story) => story.status === "ready").length;
  const staleStories = visibleStories.filter((story) => story.status !== "done" && getDaysInColumn(story) >= 3).length;

  return (
    <section className="glass-panel relative overflow-hidden p-5">
      {celebrating ? (
        <div className="pointer-events-none absolute right-8 top-6 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
          Done
        </div>
      ) : null}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="section-kicker">Kanban Work Board</p>
          <h2 className="mt-2 text-2xl font-semibold text-suu-black">
            {mode === "student" ? `${selectedStudent?.name || "Student"} stories` : "Team stories"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-suu-darkGray">
            Pull refined work into progress, keep WIP visible, and surface stale or blocked stories before they drift.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[#1B4F72]/10 px-3 py-2 text-sm font-semibold text-[#1B4F72]">{readyStories} ready</span>
          <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{staleStories} stale</span>
          <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Add Story
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-[1.3fr_repeat(4,minmax(150px,1fr))]">
        <label className="relative">
          <span className="label">Search stories</span>
          <Search className="pointer-events-none absolute left-4 top-[46px] text-slate-400" size={16} />
          <input className="field pl-11" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Title or epic" />
        </label>

        {mode === "manager" ? (
          <FilterSelect label="Student" value={studentFilter} onChange={setStudentFilter} options={students.map((student) => [student.id, student.name])} />
        ) : null}
        <FilterSelect label="Epic" value={epicFilter} onChange={setEpicFilter} options={epics.map((epic) => [epic.id, epic.title])} />
        {mode === "manager" ? (
          <FilterSelect label="Assignee" value={assigneeFilter} onChange={setAssigneeFilter} options={students.map((student) => [student.id, student.name])} />
        ) : null}
        <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={KANBAN_COLUMNS.map((column) => [column.id, column.title])} />
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <SlidersHorizontal size={14} />
        Done defaults to stories moved in the last 14 days.
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="mt-5 flex gap-4 overflow-x-auto pb-3">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              stories={visibleStories.filter((story) => story.status === column.id)}
              epics={epics}
              students={students}
              showDoneAll={showDoneAll}
              onToggleDone={() => setShowDoneAll((current) => !current)}
              onCreateWorktree={mode === "student" ? onCreateWorktree : null}
            />
          ))}
        </div>
      </DndContext>

      <StoryCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(form) => {
          onCreateStory(form);
          setModalOpen(false);
        }}
        epics={epics}
        students={mode === "student" && selectedStudent ? [selectedStudent] : students}
        defaultStudentId={selectedStudent?.id || students[0]?.id}
      />
    </section>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label>
      <span className="label">{label}</span>
      <select className="field" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="all">All</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

export default KanbanBoard;
