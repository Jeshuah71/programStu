import { getStatusMeta } from "../utils/status";

function StatusBadge({ status }) {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
      <Icon size={14} />
      {meta.label}
    </span>
  );
}

export default StatusBadge;
