export const roundToThousands = (value: number) => {
    if (value < 1000) return value.toString();
    if (value < 1_000_000) return `${Math.floor(value / 1000)}k`;
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
}
