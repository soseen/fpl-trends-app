export const roundToThousands = (value: number) => {
  if (value < 1000) return value.toString();
  if (value < 1_000_000) return `${Math.floor(value / 1000)}k`;
  return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
};

export const mapElementyTypeToPosition = (elementTypeId?: number) => {
  switch (elementTypeId) {
    case 1:
      return "Goalkeeper";
    case 2:
      return "Defender";
    case 3:
      return "Midfielder";
    case 4:
      return "Forward";
    default:
      return "";
  }
};
