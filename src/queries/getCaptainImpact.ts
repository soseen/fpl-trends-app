import type { CaptainImpact } from "./analytics-contracts.generated";
export type { CaptainImpact };
export type CaptainEvent = CaptainImpact["events"][number];
export type CaptainPlayer = CaptainEvent["user_captain"];
