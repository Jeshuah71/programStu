import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import {
  createNewStudent,
  mockGitHubIssues,
  mockGitHubPullRequests,
  mockStarterIssues,
  mockStudents
} from "./mockData";
import { mockEpics, mockStories, mockWorktrees } from "./mockWorkManagement";
import { createStoryFromForm, slugifyStory } from "./utils/workManagement";
import Layout from "./components/Layout";
import StudentView from "./components/StudentView";
import ManagerDashboard from "./components/ManagerDashboard";

function App() {
  const [students, setStudents] = useState([]);
  const [starterIssues, setStarterIssues] = useState(mockStarterIssues);
  const [githubIssues, setGitHubIssues] = useState(mockGitHubIssues);
  const [githubPullRequests, setGitHubPullRequests] = useState(mockGitHubPullRequests);
  const [epics] = useState(mockEpics);
  const [stories, setStories] = useState(mockStories);
  const [worktrees, setWorktrees] = useState(mockWorktrees);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [activeView, setActiveView] = useState("student");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [notice, setNotice] = useState("");

  function updateTaskInState(studentId, taskId, payload) {
    setStudents((current) =>
      current.map((student) => {
        if (student.id !== studentId) {
          return student;
        }

        return {
          ...student,
          tasks: student.tasks.map((task) => {
            if (task.id !== taskId) {
              return task;
            }

            const nextStatus = payload.status ?? task.status;
            return {
              ...task,
              ...payload,
              status: nextStatus,
              completed: nextStatus === "completed"
            };
          })
        };
      })
    );
  }

  function updateStudentInState(studentId, payload) {
    setStudents((current) =>
      current.map((student) =>
        student.id === studentId
          ? {
              ...student,
              ...payload
            }
          : student
      )
    );
  }

  function addStudentInState(student) {
    setStudents((current) => [...current, student]);
    setSelectedStudentId(student.id);
  }

  function deleteStudentInState(studentId) {
    const nextStudents = students.filter((student) => student.id !== studentId);
    setStudents(nextStudents);
    setSelectedStudentId((current) =>
      current === studentId ? nextStudents[0]?.id || "" : current
    );
  }

  async function loadStudents(preferredStudentId) {
    try {
      setLoading(true);
      setError("");
      const data = await api.getStudents();
      setDemoMode(false);
      setNotice("");
      setStudents(data);
      setSelectedStudentId((current) => {
        if (preferredStudentId) {
          return preferredStudentId;
        }

        if (current && data.some((student) => student.id === current)) {
          return current;
        }

        return data[0]?.id || "";
      });
    } catch (loadError) {
      const fallbackStudents = structuredClone(mockStudents);
      setStudents(fallbackStudents);
      setDemoMode(true);
      setNotice("");
      setError("");
      setSelectedStudentId((current) => preferredStudentId || current || fallbackStudents[0]?.id || "");
    } finally {
      setLoading(false);
    }
  }

  async function loadGitHubProgress() {
    try {
      const data = await api.getGitHubProgress();
      setGitHubIssues(Array.isArray(data.issues) ? data.issues : mockGitHubIssues);
      setGitHubPullRequests(
        Array.isArray(data.pullRequests) ? data.pullRequests : mockGitHubPullRequests
      );
    } catch (_error) {
      setGitHubIssues(mockGitHubIssues);
      setGitHubPullRequests(mockGitHubPullRequests);
    }
  }

  useEffect(() => {
    loadStudents();
    loadGitHubProgress();
  }, []);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || students[0] || null,
    [students, selectedStudentId]
  );

  async function handleUpdateTask(studentId, taskId, payload, localOnly = false) {
    updateTaskInState(studentId, taskId, payload);

    if (localOnly || demoMode) {
      return { mode: "demo" };
    }

    try {
      await api.updateTask(studentId, taskId, payload);
      return { mode: "api" };
    } catch (_error) {
      setNotice("Backend update failed. Changes remain visible for the demo.");
      return { mode: "local-fallback" };
    }
  }

  async function handleUpdateStudent(studentId, payload) {
    updateStudentInState(studentId, payload);

    if (demoMode) {
      return { mode: "demo" };
    }

    try {
      await api.updateStudent(studentId, payload);
      return { mode: "api" };
    } catch (_error) {
      setNotice("Backend update failed. Profile changes remain visible for the demo.");
      return { mode: "local-fallback" };
    }
  }

  async function handleCreateStudent(payload) {
    const draft = createNewStudent(payload, students.length + 1);
    addStudentInState(draft);

    if (demoMode) {
      return draft;
    }

    try {
      const created = await api.createStudent(payload);
      setStudents((current) =>
        current.map((student) => (student.id === draft.id ? created : student))
      );
      setSelectedStudentId(created.id);
      return created;
    } catch (_error) {
      setNotice("Backend create failed. Student was added locally for the demo.");
      return draft;
    }
  }

  async function handleDeleteStudent(studentId) {
    deleteStudentInState(studentId);

    if (demoMode) {
      return;
    }

    try {
      await api.deleteStudent(studentId);
    } catch (_error) {
      setNotice("Backend delete failed. The student was removed locally for the demo.");
    }
  }

  function handleMoveStory(storyId, status) {
    setStories((current) =>
      current.map((story) =>
        story.id === storyId
          ? {
              ...story,
              status,
              movedAt: new Date().toISOString()
            }
          : story
      )
    );
  }

  function handleCreateStory(form) {
    setStories((current) => [createStoryFromForm(form, students), ...current]);
  }

  async function handleCreateWorktree(story) {
    const slug = slugifyStory(story.title);
    const command = `git worktree add ../${slug} -b feat/${slug}`;
    await navigator.clipboard.writeText(command);

    setWorktrees((current) => {
      if (current.some((worktree) => worktree.storyId === story.id)) {
        return current;
      }

      return [
        {
          id: `wt-${crypto.randomUUID()}`,
          studentId: story.assigneeStudentId,
          storyId: story.id,
          path: `../${slug}`,
          branch: `feat/${slug}`,
          status: "Command copied"
        },
        ...current
      ];
    });
    setNotice(`Copied: ${command}`);
  }

  return (
    <Layout
      activeView={activeView}
      onChangeView={setActiveView}
      loading={loading}
      error={error}
      notice={notice}
      demoMode={demoMode}
    >
      {activeView === "student" ? (
        <StudentView
          students={students}
          starterIssues={starterIssues}
          githubIssues={githubIssues}
          githubPullRequests={githubPullRequests}
          epics={epics}
          stories={stories}
          worktrees={worktrees}
          selectedStudent={selectedStudent}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          onRefresh={loadStudents}
          onUpdateTask={handleUpdateTask}
          onUpdateStudent={handleUpdateStudent}
          onMoveStory={handleMoveStory}
          onCreateStory={handleCreateStory}
          onCreateWorktree={handleCreateWorktree}
          demoMode={demoMode}
        />
      ) : (
        <ManagerDashboard
          students={students}
          starterIssues={starterIssues}
          githubIssues={githubIssues}
          githubPullRequests={githubPullRequests}
          epics={epics}
          stories={stories}
          loading={loading}
          onRefresh={loadStudents}
          onUpdateTask={handleUpdateTask}
          onUpdateStudent={handleUpdateStudent}
          onCreateStudent={handleCreateStudent}
          onDeleteStudent={handleDeleteStudent}
          onUpdateStarterIssues={setStarterIssues}
          onMoveStory={handleMoveStory}
          onCreateStory={handleCreateStory}
          demoMode={demoMode}
          onSelectStudent={(studentId) => {
            setSelectedStudentId(studentId);
            setActiveView("student");
          }}
        />
      )}
    </Layout>
  );
}

export default App;
