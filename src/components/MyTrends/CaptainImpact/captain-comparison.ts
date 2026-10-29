import type { CaptainImpact, CaptainPlayer } from "src/queries/getCaptainImpact";

// Compare every pick as an ordinary captain, retaining zero when captaincy did not apply.
export const captainComparisonPoints = (player: CaptainPlayer): number =>
  player.raw_points * Math.min(player.multiplier, 2);

export const captainComparisonSummary = (data: CaptainImpact) => {
  const totalUser = data.events.reduce(
    (sum, event) => sum + captainComparisonPoints(event.user_captain),
    0,
  );
  const totalTemplate = data.events.reduce(
    (sum, event) =>
      sum +
      (event.template_captain ? captainComparisonPoints(event.template_captain) : 0),
    0,
  );
  const totalTop10k = data.events.reduce(
    (sum, event) =>
      sum + (event.top10k_captain ? captainComparisonPoints(event.top10k_captain) : 0),
    0,
  );
  const totalDiffVsTemplate = totalUser - totalTemplate;
  const totalDiffVsTop10k = totalUser - totalTop10k;
  return {
    totalUser,
    totalTemplate,
    totalTop10k,
    totalDiffVsTemplate,
    totalDiffVsTop10k,
    // Saved rank estimates are valid only when their source difference matches this comparison.
    rankImpactVsTemplate:
      Math.abs(totalDiffVsTemplate - data.total_diff_vs_template) < 1e-8
        ? data.total_rank_impact_vs_template
        : null,
    rankImpactVsTop10k:
      Math.abs(totalDiffVsTop10k - data.total_diff_vs_top10k) < 1e-8
        ? data.total_rank_impact_vs_top10k
        : null,
    tripleCaptainExtra: data.events.reduce(
      (sum, event) =>
        sum + (event.user_captain.multiplier === 3 ? event.user_captain.raw_points : 0),
      0,
    ),
  };
};
