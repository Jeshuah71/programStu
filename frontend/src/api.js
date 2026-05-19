const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const REQUEST_TIMEOUT_MS = 6000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options,
      signal: options.signal || controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Backend request timed out");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  getHealth: () => request("/health"),
  getStudents: () => request("/students"),
  getStudent: (id) => request(`/students/${id}`),
  createStudent: (payload) =>
    request("/students", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateStudent: (id, payload) =>
    request(`/students/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  deleteStudent: (id) =>
    request(`/students/${id}`, {
      method: "DELETE"
    }),
  updateTask: (studentId, taskId, payload) =>
    request(`/students/${studentId}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  getGitHubIssues: () => request("/github/issues"),
  getGitHubPullRequests: () => request("/github/pulls"),
  getGitHubProgress: () => request("/github/progress"),
  getBlockerHelp: (payload) =>
    request("/ai/blocker-help", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  generateManagerSummary: (payload) =>
    request("/ai/manager-summary", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getWorkGuide: (payload) =>
    request("/ai/work-guide", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  generateKanbanManagerSummary: (payload) =>
    request("/ai/manager-summary", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
