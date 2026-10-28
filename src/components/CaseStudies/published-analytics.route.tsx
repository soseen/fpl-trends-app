import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useActiveSection } from "./use-active-section";

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
  const activeSection = useActiveSection(SECTIONS);

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
          Engineering notes · Scalable analytics, reliable calculations and recovery
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
              An analytics page can return very little data while asking its database to
              do an enormous amount of work. In My Trends, opening a gameweek range
              triggered population-wide calculations for comparisons, team impact and
              captain impact. Requests could take tens of seconds, and the work grew as
              the season progressed.
            </p>
            <p>
              The architectural problem went beyond a slow query. Repeating shared
              calculations on every request tied response times to dataset growth and made
              ordinary browsing compete with data collection. Caching individual endpoints
              could only postpone that pressure.
            </p>
            <Note title="The design goal">
              Calculate shared analytics in the background, validate and publish them,
              then serve a saved analysis for each manager and gameweek range. Prepared
              results should be quick to read, while preparation has its own progress,
              resource limits and failure handling.
            </Note>
          </Section>

          <Section index={1}>
            <p>
              Storage and computation were growing together. Manager history, picks and
              transfers accumulated every gameweek, while overlapping aggregate tables
              stored information that could be derived from the same inputs. Range queries
              repeatedly read or rebuilt those large collections.
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
                  "A seeded draw selects standings pages across rank bands, with explicit limits on collection size. Population weights preserve each band's contribution to the overall estimate.",
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
              benchmark generations and the bulk-data refresh version. Changing either
              range endpoint selects a different analysis; changing an input version
              triggers preparation against the updated data.
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
              Reproducibility and correctness need separate checks. Replaying stored
              inputs can reliably reproduce a wrong answer if manager history and squad
              data disagree. We therefore reconcile complete sampled squads with official
              manager scores before treating a finalized benchmark as publishable.
            </p>
            <p>
              Historical inconsistencies require refreshing the affected source data and
              rebuilding the benchmark. A finalized gameweek rejects publication when a
              complete sampled squad has a known score mismatch with manager history.
              Keeping the previous valid generation available lets that repair happen
              without publishing a partial replacement.
            </p>
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
              Serving queries have short statement deadlines and a separate, bounded read
              pool. Worker memory limits and a disk-headroom check contain expensive
              preparation. Structured request and job logs, readiness probes and log
              rotation make failures inspectable.
            </p>
            <p>
              Bulk refreshes are serialized across HTTP and scheduled callers. Updates
              publish atomically using stable source keys, so a failed refresh leaves a
              complete previous snapshot available. Nullable source fields, such as dates
              for postponed fixtures, remain valid throughout that process.
            </p>
            <p>
              Working facts can be pruned only after finalized replay archives exist for
              every played gameweek and the latest sample is complete. Retired aggregate
              tables were cleared after cutover and a successful restore drill; they are
              no longer rebuilt by recurring ingestion.
            </p>
            <Note title="Replay input is not an independent backup">
              It lives in PostgreSQL too. A separate database export was successfully
              restored before removing redundant storage. Recurring off-server backups and
              external alert delivery still require configured services; local readiness
              monitoring is active.
            </Note>
          </Section>

          <Section index={6}>
            <ResultsTable
              headings={["Area", "Observed improvement"]}
              rows={[
                ["Prepared API responses", "Sub-second reads"],
                ["Database storage", "About 15% reclaimed"],
                ["Request-time work", "Bounded lookups of saved results"],
                ["Failed refreshes", "Previous successful results retained"],
              ]}
              caption="Results from production validation. Response timings cover prepared analyses over public HTTPS; storage savings came from removing retired aggregate data."
            />
            <p>
              Requests that previously performed expensive calculations now read one
              prepared response containing all seven sections. Production checks observed
              sub-second responses under concurrent requests, compared with the earlier
              waits of tens of seconds. These observations cover the API serving path;
              first-time preparation and browser rendering have separate costs.
            </p>
            <p>
              Removing redundant aggregates also reduced storage without discarding the
              published benchmarks needed by the page. Browser checks and real-manager
              audits cover the comparison table, late entrants, chip histories and
              full-season official-rank comparisons alongside the automated tests.
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
