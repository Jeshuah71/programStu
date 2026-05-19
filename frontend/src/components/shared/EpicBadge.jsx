function EpicBadge({ epic }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full bg-[#1B4F72]/10 px-2.5 py-1 text-xs font-semibold text-[#1B4F72]">
      <span className="truncate">{epic?.title || "No epic"}</span>
    </span>
  );
}

export default EpicBadge;

