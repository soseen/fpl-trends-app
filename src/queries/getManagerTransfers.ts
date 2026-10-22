import type { ManagerTransfers } from "./analytics-contracts.generated";
export type { ManagerTransfers };
export type TransferImpactEvent = ManagerTransfers["events"][number];
export type TransferImpactPair = TransferImpactEvent["pairs"][number];
export type TransferImpactPlayer = TransferImpactPair["player_in"];
export type FreeTransferState = ManagerTransfers["free_transfers"][number];
export type ActiveChip = TransferImpactEvent["chip"];
