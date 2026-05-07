const tones = {
  ready: "bg-suu-red text-white",
  almost: "bg-suu-black text-white",
  starting: "bg-suu-gray text-suu-black",
  "not-ready": "bg-white text-suu-red ring-1 ring-inset ring-suu-red/30"
};

function ReadinessBadge({ readiness }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[readiness.tone]}`}>
      {readiness.label}
    </span>
  );
}

export default ReadinessBadge;
