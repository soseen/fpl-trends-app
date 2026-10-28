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

const TableOfContents = ({ activeSection }: { activeSection: string }) => (
  <nav aria-label="Case study table of contents">
    <p className="mb-3 text-sm font-semibold text-text">Table of contents</p>
    <ol className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-1">
      {TOC_ITEMS.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
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
  const activeSection = useActiveSection(TOC_ITEMS);

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
        <aside className="border-y border-accent4 py-4 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:self-start lg:overflow-y-auto lg:border-y-0 lg:border-r lg:py-0 lg:pr-5">
          <TableOfContents activeSection={activeSection} />
        </aside>

        <div className="min-w-0 max-w-4xl space-y-12 md:space-y-16">
          <Section id="problem" number={1} title="The Problem">
            <p>
              FPL publishes a manager&apos;s overall rank after each gameweek. That rank
              is cumulative: it describes performance from GW1 up to that point. My Trends
              also lets a manager select an arbitrary range, such as GW8 to GW14, and asks
              how that manager performed during only those gameweeks.
            </p>
            <p>
              There is no official leaderboard for an arbitrary range. To produce one
              exactly, we would need to fetch and compare the history of every ranked
              manager. With a field of millions of teams, doing that while a user waits is
              not practical and would put unnecessary load on the FPL API.
            </p>

            <TechnicalNote title="The three main constraints">
              <ul className="list-disc space-y-2 pl-5 marker:text-magenta">
                <li>
                  <span className="font-medium text-text">Population size.</span> The
                  ranked field contains millions of managers, but a request still needs to
                  return quickly.
                </li>
                <li>
                  <span className="font-medium text-text">Population shape.</span> Elite
                  managers, mid-ranked managers, and the long tail do not have the same
                  score distribution.
                </li>
                <li>
                  <span className="font-medium text-text">Changing data.</span> Ranks,
                  bonus points, autosubs, and the number of ranked managers can change
                  while a gameweek is live.
                </li>
              </ul>
            </TechnicalNote>

            <p>
              The solution is a structured sample: small enough to refresh responsibly,
              but representative enough to estimate how many managers scored more points
              in the selected range.
            </p>
          </Section>

          <Section id="strategy" number={2} title="Sampling Strategy">
            <p>
              We split the Overall standings into three rank strata. The top two strata
              are small enough to collect in full. The remaining field is sampled across
              the standings tail and weighted back to its real population size.
            </p>

            <div className="overflow-x-auto border border-accent4">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-primary text-text">
                  <tr className="border-b border-accent4">
                    <th className="px-4 py-3 font-semibold">Stratum</th>
                    <th className="px-4 py-3 font-semibold">Overall rank</th>
                    <th className="px-4 py-3 font-semibold">Collection</th>
                    <th className="px-4 py-3 font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody className="text-text/65">
                  <tr className="border-b border-accent4">
                    <td className="px-4 py-3 font-medium text-text">A</td>
                    <td className="px-4 py-3">1-10,000</td>
                    <td className="px-4 py-3">Full census</td>
                    <td className="px-4 py-3">Every elite manager is included.</td>
                  </tr>
                  <tr className="border-b border-accent4">
                    <td className="px-4 py-3 font-medium text-text">B</td>
                    <td className="px-4 py-3">10,001-100,000</td>
                    <td className="px-4 py-3">Full census</td>
                    <td className="px-4 py-3">
                      The complete cohort is still manageable.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-text">C</td>
                    <td className="px-4 py-3">100,001 to the ranked tail</td>
                    <td className="px-4 py-3">Approximately 50,000 managers</td>
                    <td className="px-4 py-3">The full tail is too large to ingest.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Subheading>How the tail sample is selected</Subheading>
            <p>
              The sample comes from the Overall league standings rather than from random
              entry IDs. Entry IDs are not a reliable proxy for the active ranked
              population: lower IDs contain more long-standing managers, while recent
              joiners tend to have higher IDs.
            </p>
            <p>
              Stratum C uses a grid of every twentieth standings page. The default refresh
              target visits 1,000 of those page slots, with 50 managers on each page. The
              page order is determined by a modular golden step rather than a sequential
              walk:
            </p>
            <pre className="overflow-x-auto border border-accent4 bg-primary p-4 text-sm text-text/75">
              <code>page = 2001 + ((index x 7727) mod 12500) x 20</code>
            </pre>
            <p>
              This spreads early observations throughout the entire tail. If pages were
              visited sequentially, a half-finished refresh would contain only managers
              near rank 100,000 and would temporarily make the tail look much stronger
              than it really is.
            </p>

            <Subheading>Why inactive managers stay in the sample</Subheading>
            <p>
              An inactive or unusually managed team is still part of the official ranked
              field. Its score affected every other manager&apos;s rank. Removing those
              teams would increase the sample average and answer a different question:
              performance against selected active managers, rather than performance
              against the actual leaderboard.
            </p>

            <Subheading>Is it the same group of managers every gameweek?</Subheading>
            <p>
              No. The selection rule stays the same, but the list of manager IDs can
              change. For each new gameweek, the worker walks the current Overall
              standings again. Strata A and B cover all managers currently occupying those
              rank bands. Stratum C revisits the same dispersed rank positions, but
              different managers may now occupy them because ranks have moved.
            </p>
            <p>
              When a selected manager is visited in a new gameweek, the FPL history
              endpoint returns that manager&apos;s full season to date. We upsert the
              existing gameweeks and add the new one, then rebuild that manager&apos;s
              cumulative rows. We do not need to make separate requests for GW1, GW2, and
              so on.
            </p>
            <p>
              A manager already completed for a finalized gameweek is skipped on later
              passes through that same gameweek. When the next gameweek begins, the
              manager becomes eligible again. Newly encountered IDs are ingested in
              exactly the same way. While a gameweek is live, managers can be revisited so
              the sample gradually follows changing scores and ranks.
            </p>

            <TechnicalNote title="Example: manager ID 1234">
              If manager 1234 was selected for GW1-4 and still appears on an included
              standings page in GW5, the worker fetches the manager again and receives the
              complete GW1-5 history. The existing GW1-4 rows are updated and GW5 is
              added. If that manager no longer occupies one of the selected positions, the
              stored GW1-4 history remains available for historical rebuilds, but the
              manager does not contribute to a sample ending in GW5 because there is no
              GW5 sample row. The manager can enter the sample again in a later gameweek.
            </TechnicalNote>
          </Section>

          <Section id="algorithm" number={3} title="The Rank Algorithm">
            <p>
              Each sampled manager has one net score for the selected range. Net score is
              the sum of gameweek points after transfer-hit costs. We then compare the
              user&apos;s score with the score distribution in each stratum.
            </p>

            <ol className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-text">
              <li>
                Calculate the user&apos;s net points between the selected gameweeks.
              </li>
              <li>
                In each stratum, count sampled managers with a higher score and managers
                tied on the same score.
              </li>
              <li>
                Scale that count from the sample size to the stratum&apos;s real
                population at the end of the selected range.
              </li>
              <li>
                Add the estimated counts from all three strata and add one for the user.
              </li>
            </ol>

            <pre className="overflow-x-auto border border-accent4 bg-primary p-4 text-sm text-text/75">
              <code>rank = 1 + sum((higher + ties / 2) / sample_size x population)</code>
            </pre>

            <Subheading>Example</Subheading>
            <p>
              Assume a manager scored 310 points from GW8 to GW14. The numbers below are
              illustrative, but they show the calculation used by the estimator.
            </p>

            <div className="overflow-x-auto border border-accent4">
              <table className="w-full min-w-[660px] text-left text-sm tabular-nums">
                <thead className="bg-primary text-text">
                  <tr className="border-b border-accent4">
                    <th className="px-4 py-3 font-semibold">Stratum</th>
                    <th className="px-4 py-3 text-right font-semibold">Sample</th>
                    <th className="px-4 py-3 text-right font-semibold">Higher</th>
                    <th className="px-4 py-3 text-right font-semibold">Tied</th>
                    <th className="px-4 py-3 text-right font-semibold">Population</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Estimated ahead
                    </th>
                  </tr>
                </thead>
                <tbody className="text-text/65">
                  <tr className="border-b border-accent4">
                    <td className="px-4 py-3 font-medium text-text">A</td>
                    <td className="px-4 py-3 text-right">10,000</td>
                    <td className="px-4 py-3 text-right">7,800</td>
                    <td className="px-4 py-3 text-right">200</td>
                    <td className="px-4 py-3 text-right">10,000</td>
                    <td className="px-4 py-3 text-right">7,900</td>
                  </tr>
                  <tr className="border-b border-accent4">
                    <td className="px-4 py-3 font-medium text-text">B</td>
                    <td className="px-4 py-3 text-right">90,000</td>
                    <td className="px-4 py-3 text-right">45,000</td>
                    <td className="px-4 py-3 text-right">1,000</td>
                    <td className="px-4 py-3 text-right">90,000</td>
                    <td className="px-4 py-3 text-right">45,500</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-text">C</td>
                    <td className="px-4 py-3 text-right">50,000</td>
                    <td className="px-4 py-3 text-right">18,000</td>
                    <td className="px-4 py-3 text-right">400</td>
                    <td className="px-4 py-3 text-right">12,000,000</td>
                    <td className="px-4 py-3 text-right">4,368,000</td>
                  </tr>
                </tbody>
                <tfoot className="border-t border-accent4 bg-primary text-text">
                  <tr>
                    <td className="px-4 py-3 font-semibold" colSpan={5}>
                      Estimated range rank
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">4,421,401</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p>
              Ties receive half weight, which estimates the middle of the tied group
              instead of placing every manager with the same score either before or after
              the user.
            </p>
          </Section>

          <Section id="accuracy" number={4} title="Accuracy and Bias">
            <p>
              A large sample can still be wrong if its selection is biased. The estimator
              uses several checks to keep the sample aligned with the population it is
              intended to represent.
            </p>

            <Subheading>Separate weights for each stratum</Subheading>
            <p>
              A row in the tail sample represents more managers than a row in the elite
              census. Counts are therefore scaled inside each stratum before they are
              combined. The database row count itself never determines a cohort&apos;s
              influence.
            </p>

            <Subheading>Historical population sizes</Subheading>
            <p>
              The size of Stratum C comes from the ranked manager count at the end of the
              requested range. An early-season calculation must not use the larger current
              population, because managers who joined later were not part of that earlier
              leaderboard.
            </p>

            <Subheading>Comparison with official ranks</Subheading>
            <p>
              For ranges beginning at GW1, FPL&apos;s cumulative rank is the exact answer.
              We use those ranges to compare estimated and official results. The UI
              displays the official value when it exists; partial ranges remain explicitly
              estimated.
            </p>

            <Subheading>Freshness gates</Subheading>
            <ul className="list-disc space-y-2 pl-5 marker:text-magenta">
              <li>
                <span className="font-medium text-text">Final:</span> all three strata
                have completed the finished-gameweek walk.
              </li>
              <li>
                <span className="font-medium text-text">Refreshing:</span> usable data
                exists, but the latest cycle is still being rebuilt.
              </li>
              <li>
                <span className="font-medium text-text">Stale:</span> the latest sample is
                not safe to use, so the estimate is withheld unless an official value is
                available.
              </li>
            </ul>

            <TechnicalNote title="What the confidence label means">
              The confidence meter in My Trends is a coarse sample-coverage indicator. It
              is not a statistical confidence interval and should not be read as a
              probability that the displayed rank is correct.
            </TechnicalNote>
          </Section>

          <Section id="freshness" number={5} title="Keeping Data Fresh">
            <p>
              The manager ingestion worker runs every 15 minutes. Cursors stored in the
              database let each run continue where the previous run stopped.
            </p>

            <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-text">
              <li>
                When a new gameweek becomes current, the worker begins collecting current
                standings, manager histories, and picks.
              </li>
              <li>
                One run processes up to 20,000 manager candidates. The normal budget
                reserves 2,000 for Stratum A, 5,000 for Stratum B, and the remaining
                capacity for Stratum C.
              </li>
              <li>
                If a live gameweek later becomes final, partial current-gameweek rows are
                cleared and rebuilt from finalized FPL data.
              </li>
              <li>
                After ingestion, the latest range-score buckets, captain aggregates, and
                player exposure aggregates are rebuilt.
              </li>
              <li>
                The sample is marked final only after the walks for A, B, and C have all
                completed.
              </li>
            </ol>

            <Subheading>Failure handling</Subheading>
            <ul className="list-disc space-y-2 pl-5 marker:text-magenta">
              <li>A process lock prevents two ingestion runs from overlapping.</li>
              <li>
                The rate-limit governor slows down after 429 or 503 responses and stops a
                run after repeated upstream failures.
              </li>
              <li>Persisted cursors allow the next cron run to resume safely.</li>
              <li>
                Composite keys and upserts make repeated manager/gameweek writes
                idempotent.
              </li>
            </ul>
          </Section>

          <Section id="storage" number={6} title="Data and Storage">
            <p>
              Manager data is stored in PostgreSQL. Canonical history is kept separately
              from derived read models so that calculations can be rebuilt without
              refetching every manager from FPL.
            </p>

            <TechnicalNote title="Two independent data paths">
              <ul className="list-disc space-y-2 pl-5 marker:text-magenta">
                <li>
                  <span className="font-medium text-text">The population sample</span> is
                  refreshed in the background and produces the score distribution used as
                  the comparison baseline.
                </li>
                <li>
                  <span className="font-medium text-text">The manager being viewed</span>
                  is loaded on demand from FPL. That manager is the subject being compared
                  with the baseline and does not have to be a member of the sample.
                </li>
              </ul>
            </TechnicalNote>

            <div className="overflow-x-auto border border-accent4">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-primary text-text">
                  <tr className="border-b border-accent4">
                    <th className="px-4 py-3 font-semibold">Table</th>
                    <th className="px-4 py-3 font-semibold">Stored data</th>
                    <th className="px-4 py-3 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody className="text-text/65">
                  {[
                    [
                      "manager_summary",
                      "Current rank, stratum, refresh and coverage state",
                      "One current record for each sampled manager",
                    ],
                    [
                      "manager_history",
                      "Net points, rank, transfers, hits and bench points by GW",
                      "Canonical manager history",
                    ],
                    [
                      "manager_picks",
                      "Captain, vice-captain, multiplier and active chip by GW",
                      "Captaincy and chip analysis",
                    ],
                    [
                      "manager_cumulative",
                      "Running totals for points and other manager metrics",
                      "Fast range subtraction",
                    ],
                    [
                      "manager_range_score_buckets",
                      "Manager counts by stratum, range and score",
                      "Fast range-rank reads",
                    ],
                    [
                      "app_metadata",
                      "Ingestion cursors and sample finalization state",
                      "Safe resumable refreshes",
                    ],
                  ].map((row) => (
                    <tr key={row[0]} className="border-b border-accent4 last:border-b-0">
                      <td className="px-4 py-3 font-mono text-xs text-text">{row[0]}</td>
                      <td className="px-4 py-3">{row[1]}</td>
                      <td className="px-4 py-3">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Subheading>Range totals</Subheading>
            <p>
              The cumulative table stores a running total after every gameweek. A selected
              range therefore requires two indexed values rather than a scan of all
              history rows:
            </p>
            <pre className="overflow-x-auto border border-accent4 bg-primary p-4 text-sm text-text/75">
              <code>range_total = cumulative[end_gw] - cumulative[start_gw - 1]</code>
            </pre>
            <p>
              Managers who joined after GW1 have no synthetic rows before they joined. A
              missing pre-range cumulative value is treated as zero, which preserves the
              real meaning of their history.
            </p>
          </Section>

          <Section id="performance" number={7} title="Performance and Caching">
            <p>
              The first implementation calculated range totals while serving the request.
              Long ranges could scan millions of manager-history rows and make a cold
              response take several seconds. The current implementation moves population
              work into the ingestion process.
            </p>

            <Subheading>What happens when a new FPL ID is entered?</Subheading>
            <p>
              Every ranked manager belongs conceptually to Stratum A, B, or C according to
              their rank, but only the sampled population needs to be stored in the sample
              tables. When a user switches My Trends to an ID that has never been sampled,
              the frontend creates new queries keyed by that ID and the API fetches the
              manager&apos;s summary and season history directly from FPL.
            </p>
            <p>
              The API calculates that manager&apos;s range score from the freshly fetched
              history and compares it with the score buckets that were already built from
              the population sample. The user&apos;s manager does not need to wait for the
              ingestion cursor, and viewing the manager does not automatically make them a
              member of the population sample.
            </p>
            <p>
              Some panels need more than summary history. For team, captaincy, and
              comparison calculations, persisted picks are read first and any missing
              gameweeks are fetched from FPL in batches of six and then stored. Transfer
              history is returned by FPL in one season-wide request and is also persisted.
              Concurrent panels share in-flight requests, so opening My Trends does not
              request the same picks or transfers twice.
            </p>

            <TechnicalNote title="What a cold first view can still cost">
              Range rank, summary, and trajectory need only the manager summary or history
              calls and can be calculated immediately after those responses arrive. A long
              range with no stored picks may take longer because several pick endpoints
              must be fetched, so those panels keep their loading state until the batches
              finish. If FPL is unavailable or rate-limits the request, a panel can return
              partial data or an error and retry later; it never waits for the background
              sampling job to reach that manager.
            </TechnicalNote>

            <Subheading>Precomputed score buckets</Subheading>
            <p>
              After ingestion, cumulative totals are converted into histograms keyed by
              stratum, start gameweek, end gameweek, and range score. A range-rank request
              only needs to sum the buckets above and equal to the user&apos;s score for
              three strata. It no longer groups every sampled manager while the user
              waits.
            </p>

            <Subheading>Cache layers</Subheading>
            <div className="overflow-x-auto border border-accent4">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-primary text-text">
                  <tr className="border-b border-accent4">
                    <th className="px-4 py-3 font-semibold">Layer</th>
                    <th className="px-4 py-3 font-semibold">Duration</th>
                    <th className="px-4 py-3 font-semibold">Behavior</th>
                  </tr>
                </thead>
                <tbody className="text-text/65">
                  <tr className="border-b border-accent4">
                    <td className="px-4 py-3 font-medium text-text">
                      React Query client
                    </td>
                    <td className="px-4 py-3">1 or 5 minutes</td>
                    <td className="px-4 py-3">
                      Range panels use one minute; summary and trajectory use five. Keys
                      include the manager ID, and obsolete range requests are aborted.
                    </td>
                  </tr>
                  <tr className="border-b border-accent4">
                    <td className="px-4 py-3 font-medium text-text">
                      Express response cache
                    </td>
                    <td className="px-4 py-3">5 minutes</td>
                    <td className="px-4 py-3">
                      In-memory LRU with 1,000 entries and in-flight request
                      deduplication.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-text">HTTP cache</td>
                    <td className="px-4 py-3">5 minutes</td>
                    <td className="px-4 py-3">
                      Public cache headers and ETags support conditional 304 responses.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              The server cache is process-local and is lost on restart. PostgreSQL read
              models are durable precomputation rather than cache entries. Range-rank
              estimates can read stored score buckets after a restart, while comparison
              and captain analytics can still require expensive cold queries.
            </p>
          </Section>

          <Section id="lessons" number={8} title="Problems We Solved">
            <Subheading>Random entry IDs produced a biased sample</Subheading>
            <p>
              Random IDs overrepresented established managers with lower IDs and
              underrepresented recent joiners. We replaced ID probing with samples taken
              directly from the Overall standings.
            </p>

            <Subheading>A sequential tail walk was biased while incomplete</Subheading>
            <p>
              A sequential walk first collected the strongest portion of Stratum C. Until
              the walk finished, long-range estimates could substantially overcount
              managers ahead of the user. The golden-step page order spreads a partial
              walk across the full tail.
            </p>

            <Subheading>Filtering inactive managers changed the question</Subheading>
            <p>
              Earlier filtering removed teams whose behavior looked inactive or abnormal.
              Those teams were still ranked by FPL, so excluding them made comparison
              scores artificially strong. Every ranked manager with valid history is now
              treated as sample data.
            </p>

            <Subheading>Request-time aggregation did not scale</Subheading>
            <p>
              Correct calculations were still a product problem when several My Trends
              panels triggered large cold queries at once. Cumulative rows, score buckets,
              and single-flight caching reduce repeated work. Comparison precomputation is
              still awaiting a historical backfill and production rollout; cold comparison
              and captain queries remain a performance limitation.
            </p>

            <Subheading>Current limitations</Subheading>
            <ul className="list-disc space-y-2 pl-5 marker:text-magenta">
              <li>
                An arbitrary range rank is an estimate, not an official leaderboard.
              </li>
              <li>
                Tail sampling still introduces variance, especially around dense ties.
              </li>
              <li>
                Live-gameweek numbers remain provisional until FPL finalizes ranks, bonus
                points, and autosubs.
              </li>
              <li>
                The estimator depends on an undocumented public FPL API whose behavior can
                change.
              </li>
            </ul>
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
