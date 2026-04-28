export const getFootballersImage = (code?: number) =>
  `https://resources.premierleague.com/premierleague25/photos/players/110x140/${code}.png`;
export const getTeamsBadge = (code?: number) =>
  // FPL CDN tops out at 100 (sizes 200+ return 403). On retina displays a
  // CSS size larger than ~50px will still look slightly soft, but this is
  // the largest source available.
  `https://resources.premierleague.com/premierleague/badges/100/t${code}.png`;
