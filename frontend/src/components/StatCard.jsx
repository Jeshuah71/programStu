function StatCard({ title, value, caption, icon: Icon, tone = "sky" }) {
  const tones = {
    sky: "from-suu-black/8 to-suu-darkGray/8 text-suu-black",
    emerald: "from-suu-red/8 to-suu-black/8 text-suu-black",
    amber: "from-suu-red/12 to-suu-redAlt/10 text-suu-red",
    rose: "from-suu-red/12 to-suu-redAlt/10 text-suu-red"
  };

  return (
    <div className="glass-panel relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tones[tone].split(" ")[0]} ${tones[tone].split(" ")[1]}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-suu-darkGray">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-suu-black">{value}</p>
          <p className="mt-2 text-sm text-suu-darkGray">{caption}</p>
        </div>
        <div className={`rounded-2xl bg-gradient-to-br p-3 ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default StatCard;
