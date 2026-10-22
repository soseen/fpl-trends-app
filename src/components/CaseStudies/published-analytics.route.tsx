import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "problem", title: "The Problem" },
  { id: "diagnosis", title: "What Was Going Wrong" },
  { id: "architecture", title: "Calculate, Publish, Read" },
  { id: "calculations", title: "Keeping the Maths Consistent" },
  { id: "validation", title: "Checking the Source Data" },
  { id: "recovery", title: "Handling Failures" },
  { id: "results", title: "Production Results" },
  { id: "limits", title: "What This Does Not Prove" },
] as const;

const Section = ({ index, children }: { index: number; children: ReactNode }) => {
  const section = SECTIONS[index];
  if (!section) return null;
  return (
    <section
      id={section.id}
      className="scroll-mt-36 border-t border-accent4 pt-8 first:border-t-0 first:pt-0"
    >
      <h2 className="text-xl font-semibold text-highlight md:text-2xl">
        {index + 1}. {section.title}
      </h2>
      <div className="mt-4 space-y-5 text-sm leading-7 text-text/70 md:text-base">
        {children}
      </div>
    </section>
  );
};

const Note = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="border-l-2 border-magenta bg-primary px-4 py-3 md:px-5">
    <p className="font-semibold text-text">{title}</p>
    <div className="mt-2 text-sm leading-6 text-text/65">{children}</div>
  </div>
);

const ResultsTable = ({
  headings,
  rows,
  caption,
}: {
  headings: readonly [string, string];
  rows: ReadonlyArray<readonly [string, string]>;
  caption: string;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-left text-sm">
      <caption className="pb-3 text-left text-xs leading-6 text-text/55">
        {caption}
      </caption>
      <thead>
        <tr className="border-y border-accent4 text-text">
          {headings.map((heading) => (
            <th key={heading} scope="col" className="px-3 py-3 font-semibold">
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-b border-accent4/60">
            <th scope="row" className="px-3 py-3 font-normal text-text/75">
              {label}
            </th>
            <td className="px-3 py-3 font-mono text-highlight">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PublishedAnalyticsCaseStudy: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (first) setActiveSection(first.target.id);
      },
      { rootMargin: "-22% 0px -68% 0px", threshold: 0 },
    );
    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <article className="mx-auto w-full max-w-[1120px] pb-12 text-text">
      <div className="pt-5 md:pt-7">
        <Link
          to="/case-studies"
          className="text-sm text-text/60 transition-colors hover:text-text"
        >
          Back to case studies
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-text md:text-3xl">
          Case study - Rebuilding My Trends around published analytics
        </h1>
        <p className="mt-3 text-xs text-text/50">
          Engineering notes · Production rollout on 22 October 2026
        </p>
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-12">
        <aside className="border-y border-accent4 py-4 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:self-start lg:overflow-y-auto lg:border-y-0 lg:border-r lg:py-0 lg:pr-5">
          <nav aria-label="Case study table of contents">
            <p className="mb-3 text-sm font-semibold text-text">Table of contents</p>
            <ol className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {SECTIONS.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={activeSection === section.id ? "location" : undefined}
                    className={cn(
                      "block border-l-2 px-3 py-1.5 text-sm transition-colors",
                      activeSection === section.id
                        ? "border-magenta text-text"
                        : "border-transparent text-text/55 hover:border-accent hover:text-text",
                    )}
                  >
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="min-w-0 max-w-4xl space-y-12 md:space-y-16">
          <Section index={0}>
            <p>
              My Trends was asking the backend to do too much while a manager waited.
              Opening a gameweek range triggered several calculations against a large
              manager dataset. Small responses could take more than half a minute.
            </p>
            <ResultsTable
              headings={["Original request", "Response time"]}
              rows={[
                ["Manager comparison", "15.86 s"],
                ["Team impact", "36.08 s"],
                ["Captain impact", "35.93 s"],
              ]}
              caption="The browser network trace that prompted the redesign, for GW3–7. These are individual endpoint timings."
            />
            <p>
              We rebuilt the page around published results. Shared population calculations
              now run in a background worker, and the API reads one saved analysis for a
              manager and gameweek range. A prepared response contains all seven sections
              the page needs.
            </p>
            <Note title="The measured change">
              After deployment, prepared bundles returned in about 360 ms at the 95th
              percentile in a public HTTPS check with 20 concurrent requests. That is a
              prepared-data measurement; a new manager still needs background preparation
              before their first result is available.
            </Note>
          </Section>

          <Section index={1}>
            <p>
              The production export contained 5.21 million manager records, and the
              database occupied about 20 GB after only seven gameweeks. Much of the work
              involved repeatedly reading or rebuilding large collections of history,
              picks, transfers and cumulative totals.
            </p>
            <p>
              The API and ingestion jobs shared the same database and disk. Expensive
              population queries competed with page requests, while adding more cached
              endpoints did not address the amount of underlying work. A faster individual
              query would still leave that growth pattern in place.
            </p>
            <p>
              Correctness also needed its own checks. Successfully returning JSON did not
              establish that a stored manager score agreed with their final squad, or that
              both sides of a comparison used the same definition of points.
            </p>
          </Section>

          <Section index={2}>
            <ol className="space-y-4 border-l border-accent4 pl-5">
              {[
                [
                  "Collect a bounded sample",
                  "A seeded draw selects standings pages: up to 10,000 managers from the Top 10k, 10,000 from the next 90k, and 20,000 from the remaining population.",
                ],
                [
                  "Build shared gameweek benchmarks",
                  "The worker prepares range score distributions, comparison metrics, captain statistics and effective ownership. Every published gameweek contains its supported start ranges.",
                ],
                [
                  "Publish a complete generation",
                  "A validated, immutable generation becomes current in one transaction. Its compressed source input and checksum are retained for replay.",
                ],
                [
                  "Prepare the manager’s analysis",
                  "A background job resolves the manager’s FPL data and calculates all seven sections against a pinned set of benchmark generations.",
                ],
                [
                  "Read the saved result",
                  "The HTTP request performs bounded lookups. An unprepared range returns a preparation state and the page polls; an existing result stays visible during refresh.",
                ],
              ].map(([title, description], index) => (
                <li key={title}>
                  <p className="font-semibold text-text">
                    <span className="mr-2 font-mono text-highlight">{index + 1}.</span>
                    {title}
                  </p>
                  <p className="mt-1">{description}</p>
                </li>
              ))}
            </ol>
            <p>
              The keys matter: season, manager ID and both range endpoints identify a
              saved analysis. Its revision includes the calculation version, the selected
              benchmark generations and the bulk-data refresh version. A result for GW3–7
              cannot accidentally become the answer for GW1–7.
            </p>
            <Note title="A replacement sample does not erase a usable result">
              Recollecting a finished gameweek happens incrementally. Its previous
              publication stays available until the replacement draw is complete,
              preserving comparison and ownership coverage during the transition.
            </Note>
          </Section>

          <Section index={3}>
            <ul className="list-disc space-y-3 pl-5">
              <li>
                <strong className="text-text">Points include transfer hits.</strong> The
                manager and comparison groups use net points. Raw transfer value uses the
                same IN-minus-OUT window on both sides, with Wildcard and Free Hit
                transfers excluded.
              </li>
              <li>
                <strong className="text-text">EO uses actual multipliers.</strong> Full
                squads retain bench zeroes, autosubs, promoted vice-captains, Bench Boost
                and Triple Captain. Population weights reflect each source stratum;
                effective sample size does not replace the population denominator.
              </li>
              <li>
                <strong className="text-text">The range defines the cohort.</strong> Top
                10k and Top 100k comparisons use rank before the selected range. Ranges
                beginning at GW1 use rank at the range end. Captain benchmarks combine
                independently collected gameweek samples.
              </li>
              <li>
                <strong className="text-text">Rank effects remain nonlinear.</strong>{" "}
                Weighted score distributions retain negative scores and tied-score
                midranks. Full-season ranges prefer official rank, and rank impact still
                uses a score-to-rank curve rather than a fixed places-per-point
                multiplier.
              </li>
            </ul>
            <p>
              The statistical background is explained in the studies on{" "}
              <Link
                to="/case-studies/manager-sampling"
                className="text-highlight hover:underline"
              >
                manager sampling
              </Link>{" "}
              and{" "}
              <Link
                to="/case-studies/rank-gain-loss"
                className="text-highlight hover:underline"
              >
                rank gain and loss
              </Link>
              . This redesign changes where the work happens and how its inputs are
              checked, while preserving those core questions.
            </p>
          </Section>

          <Section index={4}>
            <p>
              The rollout uncovered a real historical defect: 12,743 of the 40,000
              selected GW6 records had scores that disagreed with their stored squads.
              Replaying a calculation would have reproduced that defect, so replay alone
              was not enough.
            </p>
            <p>
              We refreshed official history and squads for the entire selected GW6 roster,
              rebuilt the benchmark, and audited the published inputs again. All 40,000
              GW6 squads then reconciled, as did every selected squad in the other six
              gameweeks. A finalized gameweek now rejects publication when a complete
              sampled squad has a known score mismatch with manager history.
            </p>
            <ResultsTable
              headings={["Validation", "Release evidence"]}
              rows={[
                ["Automated checks", "82 tests passed; no skips"],
                ["GW6 source repair", "40,000 histories and squads refreshed"],
                ["GW6 score mismatches after repair", "0"],
                ["Reproducibility", "All seven published GWs replayed"],
              ]}
              caption="Checks performed during the production release. Replay verifies reproducibility; official score reconciliation and independent reference examples check different failure modes."
            />
            <p>
              Tests cover manually expanded weighted populations, transfer windows, chip
              and vice-captain cases, late entrants, missing data and nonlinear rank
              effects. PostgreSQL integration tests exercise publication, exclusive job
              claims, timeouts, failed refreshes and season resets. Generated runtime
              contracts validate responses in both the API and SPA.
            </p>
            <Note title="Missing data is not zero">
              Thin historical cohorts can leave comparison cells unavailable. Those cells
              remain dashes, while an actual zero remains zero. The page labels its
              indicator sample coverage rather than claiming a measured accuracy
              percentage for every range.
            </Note>
          </Section>

          <Section index={5}>
            <p>
              Jobs have renewable leases, bounded retries and ownership checks before
              publication. A worker that loses its lease cannot overwrite a newer result.
              FPL rate limits trigger a Retry-After cooldown, and section failures retain
              earlier successful data with its original timestamp.
            </p>
            <p>
              Serving queries have two-second statement deadlines and a separate
              four-connection read pool. Worker memory limits and a disk-headroom check
              contain expensive preparation. Structured request and job logs, readiness
              probes and log rotation make failures inspectable.
            </p>
            <p>
              Working facts can be pruned only after finalized replay archives exist for
              every played gameweek and the latest sample is complete. Retired aggregate
              tables were cleared after cutover and a successful restore drill; they are
              no longer rebuilt by recurring ingestion.
            </p>
            <Note title="Replay input is not an independent backup">
              It lives in PostgreSQL too. The release used a separate compressed export
              and restored it into a new database before cleanup. Recurring off-server
              backups and external alert delivery still require configured services; local
              readiness monitoring is active.
            </Note>
          </Section>

          <Section index={6}>
            <ResultsTable
              headings={["Production check", "Observed result"]}
              rows={[
                ["Prepared bundle, median", "270 ms"],
                ["Prepared bundle, 95th percentile", "360 ms"],
                ["Prepared bundle, maximum", "367 ms"],
                ["Public HTTPS requests / concurrency", "40 / 20"],
                ["Free production disk space", "About 5.7 GB → 8.8 GB"],
              ]}
              caption="Measured on 22 October 2026. Two waves of 20 concurrent requests from a developer workstation to the public HTTPS API, with fresh prepared GW3–7 bundles and all seven sections validated. Timings include reading and decoding the response."
            />
            <p>
              The original trace measured separate endpoints; this check measured a
              combined prepared response. It is evidence of the new serving path, not a
              controlled speedup ratio or a page-render benchmark. Cold preparation,
              upstream availability and browser rendering remain separate measurements.
            </p>
            <p>
              The public page also passed a browser check with its comparison table
              rendered, no runtime exceptions and no failed network responses. Checks
              against real managers covered a late entrant and histories containing all
              four chips, alongside full-season official-rank comparisons.
            </p>
          </Section>

          <Section index={7}>
            <p>
              Bounded samples make the workload predictable; they do not remove sampling
              error. New draws retain their standings-page clusters, while historical
              legacy samples have selection and provenance limitations. Held-out rank
              audits report empirical error, not a guaranteed interval for arbitrary
              partial ranges, where no public census answer exists.
            </p>
            <p>
              A new manager can still wait on FPL, a replacement sample still takes time
              to collect, and a database or host outage still needs recovery. The change
              gives those operations a bounded place to run, explicit failure states and
              reproducible inputs, while keeping prepared reads independent of
              population-sized calculations.
            </p>
          </Section>
        </div>
      </div>
    </article>
  );
};

export default PublishedAnalyticsCaseStudy;
