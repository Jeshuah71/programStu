import { useMemo, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { ARTIFACT_TYPES, STORY_TYPES } from "../../utils/workManagement";

const emptyForm = {
  title: "",
  epicId: "",
  assigneeStudentId: "",
  artifact: "PR",
  storyType: "Story",
  estimateDays: 2,
  overview: "",
  why: "",
  problem: "",
  requestedBy: "",
  acceptanceCriteria: "",
  constraints: "",
  dependencies: "",
  artifactLink: "",
  verification: "",
  followUp: ""
};

function StoryCreateModal({ open, onClose, onSubmit, epics, students, defaultStudentId }) {
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);

  const workingForm = useMemo(
    () => ({
      ...form,
      epicId: form.epicId || epics[0]?.id || "",
      assigneeStudentId: form.assigneeStudentId || defaultStudentId || students[0]?.id || "",
      artifact: form.storyType === "Spike" ? "Doc" : form.artifact
    }),
    [form, epics, students, defaultStudentId]
  );

  if (!open) {
    return null;
  }

  const requiredMissing =
    !workingForm.title.trim() ||
    !workingForm.epicId ||
    !workingForm.assigneeStudentId ||
    !workingForm.artifact ||
    !workingForm.overview.trim() ||
    !workingForm.why.trim() ||
    !workingForm.problem.trim() ||
    !workingForm.requestedBy.trim() ||
    !workingForm.acceptanceCriteria.trim() ||
    !workingForm.verification.trim();

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setTouched(true);
    if (requiredMissing) {
      return;
    }
    onSubmit(workingForm);
    setForm(emptyForm);
    setTouched(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="section-kicker">Story Anatomy</p>
            <h3 className="mt-2 text-xl font-semibold text-suu-black">Create a story</h3>
            <p className="mt-1 text-sm text-slate-600">Every story needs exactly one epic parent and one verifiable artifact.</p>
          </div>
          <button type="button" className="btn-tertiary px-3" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="label">Story title</span>
            <input className="field" value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Add fraud report form validation" />
          </label>
          <Select label="Epic parent" value={workingForm.epicId} onChange={(value) => updateField("epicId", value)} options={epics.map((epic) => [epic.id, epic.title])} />
          <Select label="Assigned to" value={workingForm.assigneeStudentId} onChange={(value) => updateField("assigneeStudentId", value)} options={students.map((student) => [student.id, student.name])} />
          <Select label="Story type" value={workingForm.storyType} onChange={(value) => updateField("storyType", value)} options={STORY_TYPES.map((type) => [type, type])} />
          <Select label="Artifact" value={workingForm.artifact} onChange={(value) => updateField("artifact", value)} disabled={workingForm.storyType === "Spike"} options={ARTIFACT_TYPES.map((type) => [type, type])} />
          <label>
            <span className="label">Estimate days</span>
            <input className="field" type="number" min="1" value={workingForm.estimateDays} onChange={(event) => updateField("estimateDays", event.target.value)} />
          </label>
          {Number(workingForm.estimateDays) > 5 ? (
            <div className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">
              <AlertTriangle size={16} />
              Consider splitting this story.
            </div>
          ) : null}
        </div>

        <TemplateSection title="Overview" subtitle="What and why">
          <TextArea label="One paragraph context" value={form.overview} onChange={(value) => updateField("overview", value)} />
          <TextArea label="Why are we doing this?" value={form.why} onChange={(value) => updateField("why", value)} />
          <TextArea label="What problem does it solve?" value={form.problem} onChange={(value) => updateField("problem", value)} />
          <TextArea label="Who asked for it?" value={form.requestedBy} onChange={(value) => updateField("requestedBy", value)} rows={2} />
        </TemplateSection>

        <TemplateSection title="Requirements" subtitle="What done looks like">
          <TextArea label="Acceptance criteria checklist" value={form.acceptanceCriteria} onChange={(value) => updateField("acceptanceCriteria", value)} placeholder="- Each item independently verifiable" />
          <TextArea label="Constraints" value={form.constraints} onChange={(value) => updateField("constraints", value)} rows={2} />
          <TextArea label="Dependencies linked explicitly" value={form.dependencies} onChange={(value) => updateField("dependencies", value)} rows={2} />
        </TemplateSection>

        <TemplateSection title="Outcomes" subtitle="Artifact and verification">
          <TextArea label="Artifact link" value={form.artifactLink} onChange={(value) => updateField("artifactLink", value)} rows={2} />
          <TextArea label="What verifiable artifact signals this is done?" value={form.verification} onChange={(value) => updateField("verification", value)} />
          <TextArea label="Follow-up worth tracking" value={form.followUp} onChange={(value) => updateField("followUp", value)} rows={2} />
        </TemplateSection>

        <footer className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          {touched && requiredMissing ? (
            <p className="text-sm font-semibold text-suu-red">Complete the required story anatomy fields before creating the story.</p>
          ) : (
            <p className="text-sm text-slate-500">Spike cards always produce a Doc artifact.</p>
          )}
          <div className="flex gap-2">
            <button type="button" className="btn-tertiary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Create Story</button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function TemplateSection({ title, subtitle, children }) {
  return (
    <section className="border-t border-slate-100 p-5">
      <div className="mb-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-suu-black">{title}</h4>
        <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Select({ label, value, onChange, options, disabled }) {
  return (
    <label>
      <span className="label">{label}</span>
      <select className="field" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 3, placeholder = "" }) {
  return (
    <label>
      <span className="label">{label}</span>
      <textarea className="field min-h-[88px]" rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

export default StoryCreateModal;

