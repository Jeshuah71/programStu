const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

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
  getBlockerHelp: (payload) =>
    request("/ai/blocker-help", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  generateManagerSummary: (payload) =>
    request("/ai/manager-summary", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
