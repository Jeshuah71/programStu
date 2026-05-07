function ProgressBar({ value, label, small = false }) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-suu-darkGray">{label}</span>
        <span className="font-semibold text-suu-black">{value}%</span>
      </div>
      <div className={`w-full overflow-hidden rounded-full bg-suu-gray ${small ? "h-2.5" : "h-3"}`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-suu-red via-suu-redAlt to-suu-black transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
