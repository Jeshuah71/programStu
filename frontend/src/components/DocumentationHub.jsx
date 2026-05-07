import { BookMarked } from "lucide-react";
import { documentationResources } from "../mockData";

function DocumentationHub({ currentPhase }) {
  const prioritized = [
    ...documentationResources.filter((resource) =>
      currentPhase ? resource.title.toLowerCase().includes(currentPhase.toLowerCase().split(":")[0].toLowerCase()) : false
    ),
    ...documentationResources.filter((resource) =>
      !(currentPhase ? resource.title.toLowerCase().includes(currentPhase.toLowerCase().split(":")[0].toLowerCase()) : false)
    )
  ].slice(0, 6);

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-suu-red/10 p-3 text-suu-red">
          <BookMarked size={18} />
        </div>
        <div>
          <p className="section-kicker">Documentation Hub</p>
          <h3 className="mt-1 text-xl font-semibold text-suu-black">Recommended resources</h3>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {prioritized.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            className="block rounded-[18px] border border-suu-black/8 bg-[#faf7f6] p-3 transition hover:border-suu-red/25 hover:bg-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-suu-black">{resource.title}</h4>
                <p className="mt-1 text-sm text-suu-darkGray">{resource.description}</p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-suu-darkGray">
                {resource.category}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default DocumentationHub;
