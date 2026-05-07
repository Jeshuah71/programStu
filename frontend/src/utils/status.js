import { AlertTriangle, CheckCircle2, Clock3, PauseCircle } from "lucide-react";

export const statusOptions = [
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "blocked", label: "Blocked" }
];

export function getStatusMeta(status) {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
        icon: CheckCircle2
      };
    case "in-progress":
      return {
        label: "In Progress",
        className: "bg-suu-black/5 text-suu-black ring-1 ring-inset ring-suu-black/10",
        icon: Clock3
      };
    case "blocked":
      return {
        label: "Blocked",
        className: "bg-suu-red/10 text-suu-red ring-1 ring-inset ring-suu-red/20",
        icon: AlertTriangle
      };
    default:
      return {
        label: "Not Started",
        className: "bg-suu-gray text-suu-darkGray ring-1 ring-inset ring-suu-darkGray/10",
        icon: PauseCircle
      };
  }
}

export function getStudentHealth(_student, progress, blockers) {
  if (progress === 100) {
    return {
      label: "Complete",
      className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
    };
  }

  if (blockers > 0) {
    return {
      label: "Blocked",
      className: "bg-suu-red/10 text-suu-red ring-1 ring-inset ring-suu-red/20"
    };
  }

  if (progress < 30) {
    return {
      label: "Needs Attention",
      className: "bg-white text-suu-red ring-1 ring-inset ring-suu-red/30"
    };
  }

  return {
    label: "On Track",
    className: "bg-white text-suu-black ring-1 ring-inset ring-suu-black/15"
  };
}
