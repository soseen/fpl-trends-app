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
  { id: "question", number: 1, label: "The Question" },
  { id: "comparison-group", number: 2, label: "The Comparison Group" },
  { id: "effective-ownership", number: 3, label: "Effective Ownership" },
  { id: "player-excess", number: 4, label: "Player Excess" },
  { id: "rank-curve", number: 5, label: "From Points to Places" },
  { id: "match-events", number: 6, label: "Benches, Transfers, and Captains" },
  { id: "accuracy", number: 7, label: "Accuracy and Limitations" },
];

const Section = ({ id, number, title, children }: SectionProps) => (
  <section
    id={id}
    className="scroll-mt-36 border-t border-accent4 pt-8 first:border-t-0 first:pt-0 last:min-h-[calc(100dvh-9rem)]"
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

const RankGainLossCaseStudy: React.FC = () => {
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
          Case study - Estimating rank gain and loss on My Trends route
        </h1>
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-12">
        <aside className="border-y border-accent4 py-4 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:self-start lg:overflow-y-auto lg:border-y-0 lg:border-r lg:py-0 lg:pr-5">
          <TableOfContents activeSection={activeSection} />
        </aside>

        <div className="min-w-0 max-w-4xl space-y-12 md:space-y-16">
          <Section id="question" number={1} title="The Question">
            <p>
              My Trends needs to answer a narrower question than &ldquo;how many points
              did this team score?&rdquo; It needs to estimate how the manager&apos;s
              decisions changed their position relative to the managers they were
              competing with.
            </p>
            <p>
              A player&apos;s raw points are not a rank impact by themselves. Ten points
              from a player owned by almost everyone usually move a manager very little.
              Ten points from a player few nearby managers own can be worth thousands of
              places. The calculation therefore has two parts: measure the manager&apos;s
              points above or below a relevant comparison group, then translate those
              points through the score-to-rank curve for that gameweek.
            </p>

            <TechnicalNote title="What the result means">
              A positive value means estimated places gained; a negative value means
              estimated places lost. It is a counterfactual estimate of the manager&apos;s
              relative advantage, not an official alternate leaderboard.
            </TechnicalNote>
          </Section>

          <Section id="comparison-group" number={2} title="The Comparison Group">
            <p>
              We compare a manager with teams in the same approximate rank area, not with
              every FPL team. A global ownership percentage describes the whole game,
              while rank impact depends on what managers around this manager actually
              owned and captained.
            </p>

            <div className="overflow-x-auto border border-accent4">
              <table className="w-full min-w-[570px] text-left text-sm">
                <thead className="bg-primary text-text">
                  <tr className="border-b border-accent4">
                    <th className="px-4 py-3 font-semibold">Band</th>
                    <th className="px-4 py-3 font-semibold">Previous overall rank</th>
                    <th className="px-4 py-3 font-semibold">Why it matters</th>
                  </tr>
                </thead>
                <tbody className="text-text/65">
                  {[
                    ["1", "1-10,000", "Elite cohort"],
                    ["2", "10,001-50,000", "Very high-ranked cohort"],
                    ["3", "50,001-100,000", "High-ranked cohort"],
                    ["4", "100,001-250,000", "Upper-middle cohort"],
                    ["5", "250,001-500,000", "Middle cohort"],
                    ["6", "500,001-1,000,000", "Lower-middle cohort"],
                    ["7", "1,000,001-2,000,000", "Lower-ranked cohort"],
                    ["8", "2,000,001-4,000,000", "Long-tail cohort"],
                    ["9", "4,000,001 and above", "Remaining ranked field"],
                  ].map(([band, rank, description]) => (
                    <tr key={band} className="border-b border-accent4 last:border-b-0">
                      <td className="px-4 py-3 font-medium text-text">{band}</td>
                      <td className="px-4 py-3">{rank}</td>
                      <td className="px-4 py-3">{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p>
              For each gameweek, the band is selected from the manager&apos;s overall rank
              at the end of the previous gameweek. The first gameweek has no previous
              rank, so it uses the global ownership baseline as an initial anchor. This
              keeps the cohort causal: it represents the managers the user was near before
              the points being evaluated changed their rank.
            </p>
            <p>
              The backend stores player exposure for each rank band and gameweek. For a
              normal band, exposure is calculated from the sampled teams in that band. The
              exposure is then compared with the user&apos;s final picks for that
              gameweek.
            </p>

            <TechnicalNote title="Why not use global ownership for every gameweek?">
              The overall game can have a highly owned player while a specific rank cohort
              has a different captaincy or benching pattern. Using global ownership for
              all teams would make rank gains look too small or too large, especially for
              differential players and captain picks.
            </TechnicalNote>
          </Section>

          <Section id="effective-ownership" number={3} title="Effective Ownership">
            <p>
              Ordinary ownership only answers whether a player is in a squad. Rank impact
              also needs to count how often the player is started, benched, or captained.
              We represent that with effective ownership (EO): the average final
              multiplier for the player in the comparison sample.
            </p>

            <pre className="overflow-x-auto border border-accent4 bg-primary p-4 text-sm text-text/75">
              <code>EO = sum of final player multipliers / comparison sample size</code>
            </pre>

            <p>
              A starter contributes a multiplier of 1, a captain 2, a triple captain 3,
              and a bench player 0. If the sampled managers have an average multiplier of
              0.7, the cohort&apos;s EO is 0.7, or 70%. EO can be above 1 when enough
              managers captain the player; it is not limited to a percentage between 0 and
              100.
            </p>
            <p>
              The data uses final picks after autosubs are applied. This matters at the
              end of a gameweek: a player who was initially benched but enters through an
              autosub is represented with their final starting multiplier.
            </p>

            <Subheading>Small samples and the GW1 exception</Subheading>
            <p>
              A rank band with too few sampled teams can produce unstable EO. When full-XI
              exposure is below the small-sample threshold, the estimator falls back to
              official global ownership and combines it with the sampled captaincy
              adjustment where that captain sample is large enough. GW1 also starts from
              global ownership because managers do not yet have a previous overall rank.
            </p>
          </Section>

          <Section id="player-excess" number={4} title="Player Excess">
            <p>
              Once we know the cohort EO, we calculate how many points the user gained or
              lost against the cohort for each player. The manager&apos;s multiplier comes
              from the final My Team picks for that gameweek.
            </p>

            <pre className="overflow-x-auto border border-accent4 bg-primary p-4 text-sm text-text/75">
              <code>excess = (your multiplier - cohort EO) x player points</code>
            </pre>

            <div className="overflow-x-auto border border-accent4">
              <table className="w-full min-w-[590px] text-left text-sm tabular-nums">
                <thead className="bg-primary text-text">
                  <tr className="border-b border-accent4">
                    <th className="px-4 py-3 font-semibold">Your action</th>
                    <th className="px-4 py-3 text-right font-semibold">Multiplier</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Excess with 10 pts and EO 0.7
                    </th>
                    <th className="px-4 py-3 font-semibold">Interpretation</th>
                  </tr>
                </thead>
                <tbody className="text-text/65">
                  <tr className="border-b border-accent4">
                    <td className="px-4 py-3 font-medium text-text">Started</td>
                    <td className="px-4 py-3 text-right">1</td>
                    <td className="px-4 py-3 text-right">+3</td>
                    <td className="px-4 py-3">
                      Three points above the cohort expectation.
                    </td>
                  </tr>
                  <tr className="border-b border-accent4">
                    <td className="px-4 py-3 font-medium text-text">Captained</td>
                    <td className="px-4 py-3 text-right">2</td>
                    <td className="px-4 py-3 text-right">+13</td>
                    <td className="px-4 py-3">
                      The captain multiplier increases the advantage.
                    </td>
                  </tr>
                  <tr className="border-b border-accent4">
                    <td className="px-4 py-3 font-medium text-text">Triple captained</td>
                    <td className="px-4 py-3 text-right">3</td>
                    <td className="px-4 py-3 text-right">+23</td>
                    <td className="px-4 py-3">
                      A triple-captain differential has an even larger effect.
                    </td>
                  </tr>
                  <tr className="border-b border-accent4">
                    <td className="px-4 py-3 font-medium text-text">Benched</td>
                    <td className="px-4 py-3 text-right">0</td>
                    <td className="px-4 py-3 text-right">-7</td>
                    <td className="px-4 py-3">
                      The cohort received 0.7 x 10 expected points.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-text">Not owned</td>
                    <td className="px-4 py-3 text-right">0</td>
                    <td className="px-4 py-3 text-right">-7</td>
                    <td className="px-4 py-3">
                      The same player can become a rank killer.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              We add the excess values for the manager&apos;s players to get the gameweek
              advantage. A player the manager owns on the bench has multiplier 0 for this
              calculation, but it is still owned; it is not included as an unowned rank
              killer. A player outside the squad is unowned and can appear in the
              rank-killer list when their negative excess is large enough.
            </p>
          </Section>

          <Section id="rank-curve" number={5} title="From Points to Places">
            <p>
              Points are not worth a fixed number of places. One extra point can move a
              manager much further in a dense part of the table than in a sparse part. We
              therefore use a score-to-rank curve for the end gameweek of the selected
              range.
            </p>

            <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-text">
              <li>
                Read same-time overall score and rank snapshots for the end gameweek.
              </li>
              <li>
                Group managers by exact score and calculate the average rank for each
                score milestone.
              </li>
              <li>
                Clamp the milestones so that a higher score can never produce a worse
                rank.
              </li>
              <li>
                Linearly interpolate between milestones to estimate a rank for the
                user&apos;s score and for the counterfactual score.
              </li>
            </ol>

            <pre className="overflow-x-auto border border-accent4 bg-primary p-4 text-sm text-text/75">
              <code>
                rank impact = rankAtScore(user total - cumulative excess) -
                rankAtScore(user total)
              </code>
            </pre>

            <p>
              The counterfactual removes the excess created by the player decisions. If
              the user has positive excess, the counterfactual score is lower and its rank
              number is usually worse. Subtracting the two rank values gives positive
              places gained. For example, if the curve puts the user at rank 100,000 and
              three additional points move the curve to rank 99,200, the estimate is 800
              places gained.
            </p>

            <Subheading>Per-gameweek attribution</Subheading>
            <p>
              Excess is accumulated through the selected range. After each gameweek, the
              curve is applied to the cumulative excess; the current estimate minus the
              previous estimate is the gameweek&apos;s rank impact. The final player value
              is the cumulative rank impact attributed to that player, while the table can
              still show the individual gameweek rows that produced it.
            </p>

            <TechnicalNote title="Curve status is part of the result">
              The API reports whether the curve is final, live, provisional, stale,
              refreshing, or unavailable. A missing or unsafe curve does not turn into a
              made-up rank number; the UI marks the estimate unavailable or explains that
              it is provisional.
            </TechnicalNote>
          </Section>

          <Section id="match-events" number={6} title="Benches, Transfers, and Captains">
            <Subheading>Benchings and autosubs</Subheading>
            <p>
              The player multiplier is taken from the completed picks for the gameweek. A
              benched player contributes zero user points to the excess calculation, even
              if they scored. If an autosub moves that player into the XI, the final
              multiplier reflects the replacement. This prevents a pre-match lineup from
              being treated as the finished result.
            </p>

            <Subheading>Captaincy</Subheading>
            <p>
              Captains use multiplier 2 and triple captains use multiplier 3. EO includes
              the same captain weight for the comparison cohort, so a popular captain has
              a smaller differential than a rare captain with the same points. The captain
              choice changes both the user&apos;s points and their excess against nearby
              managers.
            </p>

            <Subheading>Transfers</Subheading>
            <p>
              Transfers change which player rows and multipliers exist in each gameweek. A
              player transferred in before a haul can create positive excess; a player
              transferred out can create negative excess if the cohort still owns them.
              The manager&apos;s range baseline also includes transfer-hit costs, because
              those costs are part of net gameweek points.
            </p>
            <p>
              The Team Impact calculation does not pretend that a transfer hit belongs to
              one specific player. It preserves the hit in the manager&apos;s net result
              while attributing player excess to the players actually selected. A separate
              transfer impact study can explain the decision-level cost and benefit in
              more detail.
            </p>

            <Subheading>Rank killers</Subheading>
            <p>
              Rank killers are high-scoring players outside the user&apos;s squad. Their
              excess is calculated with user multiplier 0, so it is negative whenever the
              comparison cohort received points from them. The list is only built when the
              user&apos;s picks are complete for that gameweek; otherwise an incomplete
              squad could falsely make every missing player look unowned. The displayed
              list also respects valid FPL formation constraints when selecting the top
              XI.
            </p>
          </Section>

          <Section id="accuracy" number={7} title="Accuracy and Limitations">
            <p>
              This is a model of relative rank movement, not a second official FPL ranking
              service. The result is most useful as a consistent explanation of why a
              manager gained or lost ground, with the assumptions visible in the details.
            </p>

            <ul className="list-disc space-y-3 pl-5 marker:text-magenta">
              <li>
                <span className="font-medium text-text">Nearby-manager exposure:</span>{" "}
                rank-band ownership and EO are used when enough sampled teams are
                available, rather than applying one global ownership number to every
                manager.
              </li>
              <li>
                <span className="font-medium text-text">Fallbacks:</span> small rank-band
                samples fall back to official global ownership with sampled captaincy
                where possible. The response records when this happened and how many
                gameweeks used the fallback.
              </li>
              <li>
                <span className="font-medium text-text">Live data:</span> bonus points,
                autosubs, ranks, and the curve can change while a gameweek is live. The
                estimate is refreshed and can change until the gameweek is final.
              </li>
              <li>
                <span className="font-medium text-text">Sampling variance:</span> a sample
                represents a cohort but does not reproduce every manager. Dense ties and
                thin rank bands can therefore make the estimate noisy.
              </li>
              <li>
                <span className="font-medium text-text">Unavailable curve:</span> if a
                safe score-to-rank curve is not available, rank places are withheld
                instead of using a generic points-per-rank conversion.
              </li>
            </ul>

            <TechnicalNote title="The short version">
              My Trends estimates rank gain or loss by comparing final player multipliers
              with effective ownership in the manager&apos;s nearby rank cohort, summing
              the resulting point excess, and converting that excess through the local
              overall score-to-rank curve.
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

export default RankGainLossCaseStudy;
