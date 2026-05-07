import { LayoutDashboard, UserRound } from "lucide-react";

function Header({ activeView, onChangeView }) {
  const tabs = [
    { id: "student", label: "Student View", icon: UserRound },
    { id: "manager", label: "Manager Dashboard", icon: LayoutDashboard }
  ];

  return (
    <header className="mb-6 overflow-hidden rounded-[24px] shadow-card">
      <div className="bg-suu-red px-5 py-4 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div
              className="leading-none text-white"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 400,
                fontSize: "4.4rem",
                letterSpacing: "-0.055em",
                lineHeight: 0.85
              }}
            >
              SUU
            </div>
            <div className="h-16 w-px bg-white/35" />
            <div className="text-[0.95rem] font-semibold uppercase tracking-[0.16em] leading-6 text-white/95 sm:text-[1.05rem]">
              <div>Southern</div>
              <div>Utah</div>
              <div>University</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/95">
            SUU IT
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-none border-0">
        <div className="h-1.5 bg-gradient-to-r from-suu-red via-suu-redAlt to-suu-black" />
        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-suu-black sm:text-4xl">
              SUU Student Programmer Onboarding Hub
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-suu-darkGray sm:text-base">
              Help new student developers become productive members of SUU IT through guided
              setup, team workflows, and blocker support.
            </p>
          </div>

          <nav
            className="inline-flex rounded-2xl bg-suu-gray p-1.5"
            aria-label="View switcher"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeView === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeView(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-suu-red text-white shadow-sm"
                      : "text-suu-darkGray hover:text-suu-black"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-suu-black/8 bg-[#faf7f6] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-suu-darkGray">
          SUU IT · Thunderbird Ready onboarding progress
        </div>
      </div>
    </header>
  );
}

export default Header;
