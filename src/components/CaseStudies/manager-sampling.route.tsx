import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useActiveSection } from "./use-active-section";

type TocItem = {
  id: string;
  number: number;
  label: string;
};

type SectionProps = {
  id: string;
  number: number;
  title: string;
  children: ReactNode;
};

const TOC_ITEMS: TocItem[] = [
  { id: "problem", number: 1, label: "The Problem" },
  { id: "strategy", number: 2, label: "Sampling Strategy" },
  { id: "algorithm", number: 3, label: "The Rank Algorithm" },
  { id: "accuracy", number: 4, label: "Accuracy and Bias" },
  { id: "freshness", number: 5, label: "Keeping Data Fresh" },
  { id: "storage", number: 6, label: "Data and Storage" },
  { id: "performance", number: 7, label: "Performance and Caching" },
  { id: "lessons", number: 8, label: "Problems We Solved" },
];

const Section = ({ id, number, title, children }: SectionProps) => (
  <section
    id={id}
    className="scroll-mt-36 border-t border-accent4 pt-8 first:border-t-0 first:pt-0"
  >
    <h2 className="text-xl font-semibold text-highlight md:text-2xl">
      {number}. {title}
    </h2>
    <div className="mt-4 space-y-5 text-sm leading-7 text-text/70 md:text-base">
      {children}
    </div>
  </section>
);

const Subheading = ({ children }: { children: ReactNode }) => (
  <h3 className="pt-1 text-base font-semibold text-text md:text-lg">{children}</h3>
);

const TechnicalNote = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="border-l-2 border-magenta bg-primary px-4 py-3 md:px-5">
    <p className="font-semibold text-text">{title}</p>
    <div className="mt-2 text-sm leading-6 text-text/65">{children}</div>
  </div>
);

const TableOfContents = ({
  activeSection,
  onSectionClick,
}: ReturnType<typeof useActiveSection>) => (
  <nav aria-label="Case study table of contents">
    <p className="mb-3 text-sm font-semibold text-text">Table of contents</p>
    <ol className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-1">
      {TOC_ITEMS.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={onSectionClick}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "block border-l-2 px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "border-magenta text-text"
                  : "border-transparent text-text/55 hover:border-accent hover:text-text",
              )}
            >
              {item.number}. {item.label}
            </a>
          </li>
        );
      })}
    </ol>
  </nav>
);

const ManagerSamplingCaseStudy: React.FC = () => {
  const contents = useActiveSection(TOC_ITEMS);

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
          Case study - Sampling managers on My Trends route
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-12">
        <aside className="border-y border-accent4 py-4 lg:sticky lg:top-36 lg:max-h-[calc(100vh-10rem)] lg:self-start lg:overflow-y-auto lg:border-y-0 lg:border-r lg:py-0 lg:pr-5">
          <TableOfContents {...contents} />
        </aside>

        <div className="min-w-0 max-w-4xl space-y-12 md:space-y-16">
          <Section id="problem" number={1} title="The Problem">
            <p>
              FPL publishes a cumulative overall rank after each gameweek. My Trends also
              lets a manager select an arbitrary range and asks how their net points
              compare with the rest of the ranked field during only those gameweeks.
            </p>
            <p>
              There is no official leaderboard for every possible range. Fetching every
              manager while a user waits would be slow, expensive and hard on the FPL API.
              We instead collect a bounded population sample and publish the shared
              calculations before the page requests them.
            </p>
            <TechnicalNote title="Where this fits in the current architecture">
              This study explains sample selection and weighted range-rank estimation. The{" "}
              <Link
                to="/case-studies/rank-gain-loss"
                className="text-highlight hover:underline"
              >
                rank-impact study
              </Link>{" "}
              uses the same published data for ownership and player effects. The{" "}
              <Link
                to="/case-studies/published-analytics"
                className="text-highlight hover:underline"
              >
                architecture study
              </Link>{" "}
              explains the worker, publication and prepared-result pipeline that serves
              both.
            </TechnicalNote>
          </Section>

          <Section id="strategy" number={2} title="Sampling Strategy">
            <p>
              The Overall standings are split into three source strata. Each has a fixed
              collection cap, so the sample stays bounded as the ranked population grows.
              These collection strata are separate from the finer rank bands used for
              nearby-manager effective ownership.
            </p>
            <div className="overflow-x-auto border border-accent4">
              <table className="w-full min-w-[600px] text-left text-sm">
                <caption className="px-4 py-3 text-left text-xs text-text/55">
                  Current draw targets. A smaller ranked field can produce fewer managers.
                </caption>
                <thead className="bg-primary text-text">
                  <tr className="border-b border-accent4">
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Stratum
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Overall rank
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Collection cap
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Population represented
                    </th>
                  </tr>
                </thead>
                <tbody className="text-text/65">
                  {[
                    ["A", "1�10,000", "10,000", "The top 10k"],
                    ["B", "10,001�100,000", "10,000", "The next 90k"],
                    ["C", "100,001 to the ranked tail", "20,000", "The remaining field"],
                  ].map(([stratum, ranks, cap, population]) => (
                    <tr key={stratum} className="border-b border-accent4 last:border-b-0">
                      <th scope="row" className="px-4 py-3 font-medium text-text">
                        {stratum}
                      </th>
                      <td className="px-4 py-3">{ranks}</td>
                      <td className="px-4 py-3 font-mono text-highlight">{cap}</td>
                      <td className="px-4 py-3">{population}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Subheading>Seeded page draws</Subheading>
            <p>
              Managers are selected from standings pages rather than random entry IDs.
              Within each stratum, a seeded permutation draws pages without replacement.
              The season, gameweek, population bound and saved cursor make a draw
              reproducible when collection resumes. The top stratum can cover all its
              pages; the other two select bounded subsets.
            </p>
            <p>
              This avoids a sequential walk that initially sees only the strongest part of
              the tail. Managers on one standings page are still a cluster, however: they
              are not independent random observations. Statistical error estimates must
              respect that sampling design.
            </p>
            <Subheading>Who belongs in the sample?</Subheading>
            <p>
              Every ranked manager is eligible, including inactive teams. Filtering out
              unusually managed teams would change the population we claim to represent.
              Each gameweek has its own draw, so a manager may appear in one gameweek and
              not the next. Current standings membership is not retroactively applied to
              historical samples.
            </p>
            <TechnicalNote title="Historical provenance still matters">
              Earlier retained generations can contain legacy selection limitations.
              Replaying those inputs preserves their provenance; it does not turn an old
              draw into a new randomized one. New collection uses the bounded seeded
              design.
            </TechnicalNote>
          </Section>

          <Section id="algorithm" number={3} title="The Rank Algorithm">
            <p>
              The worker builds a score histogram for every supported start range in a
              published end-gameweek benchmark. Each sampled manager contributes net
              points, including transfer-hit costs. Negative scores and tied scores stay
              in the distribution.
            </p>
            <ol className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-text">
              <li>Calculate the manager&apos;s net points in the selected range.</li>
              <li>Count higher scores and ties within each source stratum.</li>
              <li>
                Scale each count to that stratum&apos;s population at the range end.
              </li>
              <li>
                Combine the weighted counts and add one for the manager&apos;s position.
              </li>
            </ol>
            <pre className="overflow-x-auto border border-accent4 bg-primary p-4 text-sm text-text/75">
              <code>rank = 1 + sum((higher + ties / 2) / sample_size x population)</code>
            </pre>
            <Subheading>A worked example</Subheading>
            <p>
              These illustrative counts show why a smaller tail sample can represent a
              much larger population without overwhelming the elite cohorts.
            </p>
            <div className="overflow-x-auto border border-accent4">
              <table className="w-full min-w-[660px] text-left text-sm tabular-nums">
                <thead className="bg-primary text-text">
                  <tr className="border-b border-accent4">
                    {[
                      "Stratum",
                      "Sample",
                      "Higher",
                      "Tied",
                      "Population",
                      "Estimated ahead",
                    ].map((label, index) => (
                      <th
                        key={label}
                        scope="col"
                        className={cn(
                          "px-4 py-3 font-semibold",
                          index > 0 && "text-right",
                        )}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-text/65">
                  {[
                    ["A", "10,000", "7,800", "200", "10,000", "7,900"],
                    ["B", "10,000", "5,000", "200", "90,000", "45,900"],
                    ["C", "20,000", "7,200", "160", "12,000,000", "4,368,000"],
                  ].map(([stratum, ...values]) => (
                    <tr key={stratum} className="border-b border-accent4">
                      <th scope="row" className="px-4 py-3 font-medium text-text">
                        {stratum}
                      </th>
                      {values.map((value, index) => (
                        <td key={index} className="px-4 py-3 text-right">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-primary text-text">
                  <tr>
                    <th scope="row" colSpan={5} className="px-4 py-3 font-semibold">
                      Estimated range rank
                    </th>
                    <td className="px-4 py-3 text-right font-semibold text-highlight">
                      4,421,801
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p>
              Half-weighted ties estimate the middle of a tied group. Full-season ranges
              prefer the official FPL rank when it exists; an arbitrary partial range
              remains an estimate. A missing populated stratum makes the estimate
              unavailable rather than silently giving that population zero influence.
            </p>
          </Section>

          <Section id="accuracy" number={4} title="Accuracy and Bias">
            <p>
              Sample size alone does not establish accuracy. Selection, source coverage,
              population weights and the meaning of a range all need independent checks.
            </p>
            <Subheading>Weights follow the source population</Subheading>
            <p>
              Each sampled manager represents the size of their source stratum divided by
              its observed sample size. The same population weighting is used for shared
              comparison metrics and ownership calculations. Oversampling elite managers
              therefore does not make their preferences dominate the whole game.
            </p>
            <Subheading>Use the right historical population</Subheading>
            <p>
              A range uses the ranked field at its ending gameweek. Later entrants do not
              inflate an earlier leaderboard. Managers who joined during the range can
              contribute their played gameweeks; a missing internal history record is
              treated as incomplete data, not an invented zero-point performance.
            </p>
            <Subheading>Compare against independent references</Subheading>
            <p>
              Full-season estimates can be checked against official ranks. Held-out audits
              report observed error, while manually expanded weighted populations test the
              formula independently. Neither proves a guaranteed error interval for every
              partial range, where an official census answer is unavailable.
            </p>
            <TechnicalNote title="Coverage is not a probability of correctness">
              My Trends labels its indicator sample coverage. Effective sample size
              measures how much information unequal weights provide; it is a coverage
              gate, not the population denominator or an accuracy percentage. Thin
              comparison cohorts remain unavailable instead of displaying fabricated
              zeroes.
            </TechnicalNote>
          </Section>

          <Section id="freshness" number={5} title="Keeping Data Fresh">
            <p>
              Scheduled collection works in bounded batches. Persisted cursors resume the
              same draw across runs, and a process lock prevents overlapping collectors.
              Upstream rate limits trigger cooldowns rather than an unbounded retry storm.
            </p>
            <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-text">
              <li>
                Collect the selected standings pages, manager history, full squads and
                transfer coverage.
              </li>
              <li>
                Refresh provisional inputs while a gameweek is live, then complete a
                finalized draw.
              </li>
              <li>
                Enqueue background benchmark preparation instead of rebuilding legacy
                aggregate tables.
              </li>
              <li>
                Validate complete squads against official net scores and retain compressed
                replay input.
              </li>
              <li>
                Publish a complete immutable generation by atomically changing its current
                pointer.
              </li>
            </ol>
            <TechnicalNote title="A refresh does not erase the previous generation">
              An existing publication stays available while replacement data is collected
              and checked. Manager analyses pin their benchmark generations, so one
              response cannot mix half of an old sample with half of a new one. Live
              results remain provisional until their inputs are finalized.
            </TechnicalNote>
          </Section>

          <Section id="storage" number={6} title="Data and Storage">
            <p>
              PostgreSQL separates temporary working facts, immutable benchmarks and
              manager-specific prepared results. That separation makes replay and
              retention explicit instead of allowing every historical refresh to expand
              the serving dataset indefinitely.
            </p>
            <div className="overflow-x-auto border border-accent4">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-primary text-text">
                  <tr className="border-b border-accent4">
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Stored data
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className="text-text/65">
                  {[
                    [
                      "Working manager facts",
                      "History, full XV and transfers used during preparation",
                    ],
                    [
                      "analytics_benchmarks",
                      "Versioned distributions, cohort metrics, EO and compressed replay sources",
                    ],
                    [
                      "analytics_publications",
                      "The current complete generation for each season and gameweek",
                    ],
                    [
                      "analytics_jobs",
                      "Durable preparation state, leases and retry information",
                    ],
                    [
                      "analytics_manager_results",
                      "The saved seven-section analysis for a manager and range",
                    ],
                  ].map(([name, purpose]) => (
                    <tr key={name} className="border-b border-accent4 last:border-b-0">
                      <th
                        scope="row"
                        className="px-4 py-3 font-mono text-xs font-normal text-text"
                      >
                        {name}
                      </th>
                      <td className="px-4 py-3">{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Subheading>Retain inputs that make a result reproducible</Subheading>
            <p>
              Benchmarks retain checksum-verified source input for historical replay.
              Obsolete working facts can be pruned only when finalized archives cover
              every played gameweek and the current sample is complete. Legacy cumulative
              and stratum aggregate tables are retired from the serving path.
            </p>
            <p>
              Those archives still live inside PostgreSQL. They support rebuilding a
              calculation, while recovery from a lost database requires an independent
              export or a new source-data collection.
            </p>
          </Section>

          <Section id="performance" number={7} title="Performance and Caching">
            <p>
              Population calculations run once in the background and are reused across
              managers. A manager-preparation job then computes the page against pinned
              benchmarks. The HTTP request reads the saved result and job status; it does
              not fetch FPL data or scan sampled manager history.
            </p>
            <Subheading>What happens when a new FPL ID is entered?</Subheading>
            <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-text">
              <li>
                The frontend requests one analysis keyed by manager ID and both gameweek
                endpoints.
              </li>
              <li>
                If no prepared analysis exists, the API queues work and returns a
                preparation state.
              </li>
              <li>
                The worker resolves that manager&apos;s history, squads and transfers,
                then prepares all seven sections.
              </li>
              <li>
                The page polls until the saved analysis is ready. Existing successful
                sections stay visible during refreshes.
              </li>
            </ol>
            <p>
              Viewing a manager does not add them to the population sample. First-time
              preparation can still wait on FPL, but that wait has explicit progress and
              failure states. It no longer keeps a population-sized HTTP query open.
            </p>
            <TechnicalNote title="Durable results, rather than process-local calculation caches">
              Prepared analyses survive an API restart. Their revision includes the
              season, calculation version, benchmark generations and bulk-data revision.
              Changed inputs or expiry queue a refresh while usable saved data remains
              available. Failed sections retain their previous successful timestamps.
            </TechnicalNote>
            <p>
              React Query manages the browser&apos;s analysis and preparation polling. The
              manager endpoint uses no-store HTTP responses so cached transport data
              cannot hide job progress. This is separate from the app&apos;s cached bulk
              player and team endpoints.
            </p>
          </Section>

          <Section id="lessons" number={8} title="Problems We Solved">
            <Subheading>A bounded sample needs an explicit selection design</Subheading>
            <p>
              Standings-page draws avoid treating entry IDs as a proxy for rank. Seeded
              selection spreads collection across each stratum and survives interrupted
              runs. Page clustering and legacy provenance still limit what we can claim
              about statistical precision.
            </p>
            <Subheading>
              More cached endpoints did not solve repeated population work
            </Subheading>
            <p>
              The serving improvement comes from published shared benchmarks and one
              durable manager analysis. Comparison, team impact and captain impact use
              that same background pipeline; they are not pending legacy migrations or
              separate cold population queries.
            </p>
            <Subheading>Reproducible calculations also need valid inputs</Subheading>
            <p>
              Replay checks, official score reconciliation and independent examples catch
              different errors. Retention can remove redundant working data only after the
              inputs needed for a trusted rebuild are preserved.
            </p>
            <TechnicalNote title="What remains an estimate">
              Arbitrary range rank and player rank effects are model outputs. Live
              gameweeks can change, thin cohorts may be unavailable, and bounded samples
              retain sampling error. The goal is fast, inspectable results with explicit
              limits, not a second official leaderboard.
            </TechnicalNote>
          </Section>
        </div>
      </div>

      <div className="mt-12 border-t border-accent4 pt-6 md:mt-16">
        <Link
          to="/case-studies"
          className="text-sm text-text/60 transition-colors hover:text-text"
        >
          Back to case studies
        </Link>
      </div>
    </article>
  );
};

export default ManagerSamplingCaseStudy;
