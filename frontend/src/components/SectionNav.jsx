import { useEffect, useMemo, useState } from "react";

function SectionNav({ title, items }) {
  const enabledItems = useMemo(() => items, [items]);
  const [activeId, setActiveId] = useState(enabledItems[0]?.id ?? "");

  useEffect(() => {
    if (!enabledItems.length) {
      return undefined;
    }

    const sections = enabledItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (!sections.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]?.target?.id) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.15, 0.35, 0.6]
      }
    );

    sections.forEach((section) => observer.observe(section));
    setActiveId(sections[0].id);

    return () => {
      observer.disconnect();
    };
  }, [enabledItems]);

  if (!enabledItems.length) {
    return null;
  }

  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }

  return (
    <section className="glass-panel sticky top-3 z-20 p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="section-kicker">{title}</p>
          <p className="mt-1 text-sm text-suu-darkGray">
            Jump directly to the section you need instead of scrolling through the full page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {enabledItems.map((item) => {
            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-suu-red text-white shadow-sm"
                    : "border border-suu-black/10 bg-white text-suu-darkGray hover:border-suu-red/25 hover:text-suu-red hover:shadow-sm"
                }`}
              >
                {item.label}
                {typeof item.badge !== "undefined" ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-suu-gray text-suu-black"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default SectionNav;
