function StaleBadge({ visible }) {
  if (!visible) {
    return null;
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
      Stale
    </span>
  );
}

export default StaleBadge;

