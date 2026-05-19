export type FootballerImageSize = "small" | "regular" | "large";

export const FOOTBALLER_IMAGE_DIMENSIONS: Record<
  FootballerImageSize,
  { path: string; width: number; height: number }
> = {
  small: { path: "40x40", width: 40, height: 40 },
  regular: { path: "110x140", width: 110, height: 140 },
  large: { path: "500x500", width: 500, height: 500 },
};

const apiBaseUrl = (process.env["API_BASE_URL"] ?? "/api").replace(/\/$/, "");

export const getFootballersImage = (
  code?: number,
  size: FootballerImageSize = "regular",
) => {
  const dimensions = FOOTBALLER_IMAGE_DIMENSIONS[size].path;
  return `${apiBaseUrl}/player-image/${dimensions}/${code}.png`;
};

export const getTeamsBadge = (code?: number) =>
  // FPL CDN tops out at 100 (sizes 200+ return 403). On retina displays a
  // CSS size larger than ~50px will still look slightly soft, but this is
  // the largest source available.
  `https://resources.premierleague.com/premierleague/badges/100/t${code}.png`;
