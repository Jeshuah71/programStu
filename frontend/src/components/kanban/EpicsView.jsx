import { useState } from "react";
import EpicCard from "./EpicCard";
import StoryCreateModal from "./StoryCreateModal";

function EpicsView({ mode, students, selectedStudent, epics, stories, onCreateStory }) {
  const [modalEpicId, setModalEpicId] = useState("");
  const visibleStories =
    mode === "student" && selectedStudent
      ? stories.filter((story) => story.assigneeStudentId === selectedStudent.id)
      : stories;
  const visibleEpicIds = new Set(visibleStories.map((story) => story.epicId));
  const visibleEpics = epics.filter((epic) => mode === "manager" || visibleEpicIds.has(epic.id));

  return (
    <section className="glass-panel p-5">
      <div>
        <p className="section-kicker">Epic Hierarchy</p>
        <h2 className="mt-2 text-2xl font-semibold text-suu-black">
          {mode === "student" ? "Your epics and stories" : "Team epics and stories"}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-suu-darkGray">
          Each story has exactly one epic parent and one artifact. Use this view to keep story work tied to outcomes.
        </p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {visibleEpics.map((epic) => (
          <EpicCard
            key={epic.id}
            epic={epic}
            stories={visibleStories.filter((story) => story.epicId === epic.id)}
            onAddStory={setModalEpicId}
          />
        ))}
      </div>

      <StoryCreateModal
        open={Boolean(modalEpicId)}
        onClose={() => setModalEpicId("")}
        onSubmit={(form) => {
          onCreateStory({ ...form, epicId: modalEpicId });
          setModalEpicId("");
        }}
        epics={epics.filter((epic) => epic.id === modalEpicId)}
        students={mode === "student" && selectedStudent ? [selectedStudent] : students}
        defaultStudentId={selectedStudent?.id || students[0]?.id}
      />
    </section>
  );
}

export default EpicsView;

