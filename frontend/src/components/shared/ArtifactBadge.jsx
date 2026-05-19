const artifactClasses = {
  PR: "bg-blue-50 text-blue-700 ring-blue-100",
  Doc: "bg-amber-50 text-amber-800 ring-amber-100",
  Query: "bg-violet-50 text-violet-700 ring-violet-100",
  Config: "bg-slate-100 text-slate-700 ring-slate-200",
  Runbook: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Dashboard: "bg-rose-50 text-rose-700 ring-rose-100"
};

function ArtifactBadge({ artifact, storyType }) {
  if (storyType === "Spike") {
    return (
      <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800 ring-1 ring-orange-200">
        Spike
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${artifactClasses[artifact] || artifactClasses.PR}`}>
      {artifact}
    </span>
  );
}

export default ArtifactBadge;

