function StudentSelector({ students, value, onChange }) {
  return (
    <div className="glass-panel p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <label htmlFor="student-selector" className="label">
        Student
      </label>
      <p className="mb-4 text-sm text-suu-darkGray">
        Select your name to view your onboarding roadmap and update your progress.
      </p>
      <select
        id="student-selector"
        className="field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.name} · {student.email}
          </option>
        ))}
      </select>
    </div>
  );
}

export default StudentSelector;
