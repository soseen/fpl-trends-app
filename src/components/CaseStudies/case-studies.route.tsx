import { Link } from "react-router-dom";

const CASE_STUDIES = [
  {
    number: 1,
    title: "Sampling managers",
    description:
      "How My Trends builds a representative manager sample, estimates range rank, and keeps the population current.",
    to: "/case-studies/manager-sampling",
  },
  {
    number: 2,
    title: "Estimating rank gain and loss",
    description:
      "How player points become relative rank impact using nearby managers, effective ownership, and a score-to-rank curve.",
    to: "/case-studies/rank-gain-loss",
  },
] as const;

const CaseStudies: React.FC = () => (
  <article className="mx-auto w-full max-w-[1120px] pb-12 text-text">
    <h1 className="inline-block border-b-2 border-highlight pb-2 pt-5 text-2xl font-semibold text-text md:mt-2 md:text-3xl">
      Case studies
    </h1>

    <div className="mt-7 space-y-3">
      {CASE_STUDIES.map((study) => (
        <Link
          key={study.to}
          to={study.to}
          className="group grid grid-cols-[32px_1fr] gap-3 border-l-2 border-highlight bg-secondary px-4 py-4 shadow-sm transition-colors hover:bg-accent4/80 md:gap-5 md:px-5 md:py-5"
        >
          <span className="font-mono text-sm text-highlight">{study.number}.</span>
          <div>
            <h2 className="text-lg font-semibold text-text transition-colors group-hover:text-highlight">
              {study.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text/60">
              {study.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  </article>
);

export default CaseStudies;
