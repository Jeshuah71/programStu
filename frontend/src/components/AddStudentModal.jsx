import { useState } from "react";
import { UserPlus, X } from "lucide-react";

const defaultForm = {
  name: "",
  email: "",
  mentor: "",
  mentorEmail: "",
  mentorRole: "",
  team: ""
};

function AddStudentModal({ open, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  if (!open) {
    return null;
  }

  function validate() {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    await onSubmit(form);
    setForm(defaultForm);
    setErrors({});
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-xl rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="section-kicker">
              Add Student
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-suu-black">Create new onboarding profile</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close add student modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label htmlFor="student-name" className="label">
              Name
            </label>
            <input
              id="student-name"
              className="field"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            {errors.name ? <p className="mt-2 text-sm text-suu-red">{errors.name}</p> : null}
          </div>

          <div>
            <label htmlFor="student-email" className="label">
              Email
            </label>
            <input
              id="student-email"
              className="field"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            {errors.email ? <p className="mt-2 text-sm text-suu-red">{errors.email}</p> : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="student-mentor" className="label">
                Mentor
              </label>
              <input
                id="student-mentor"
                className="field"
                value={form.mentor}
                onChange={(event) => setForm((current) => ({ ...current, mentor: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="student-mentor-email" className="label">
                Mentor Email
              </label>
              <input
                id="student-mentor-email"
                className="field"
                value={form.mentorEmail}
                onChange={(event) => setForm((current) => ({ ...current, mentorEmail: event.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="student-mentor-role" className="label">
                Mentor Role
              </label>
              <input
                id="student-mentor-role"
                className="field"
                value={form.mentorRole}
                onChange={(event) => setForm((current) => ({ ...current, mentorRole: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="student-team" className="label">
                Team
              </label>
              <input
                id="student-team"
                className="field"
                value={form.team}
                onChange={(event) => setForm((current) => ({ ...current, team: event.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={submitting} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
              <UserPlus size={16} />
              {submitting ? "Creating..." : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudentModal;
