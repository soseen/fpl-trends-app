import type React from "react";
import { Repeat } from "lucide-react";
import { Card } from "@/components/ui/card";

type Props = {
  gw: number;
};

// Compact strip for GWs in range where the user made no transfers and
// played no chip — they "rolled" the free transfer for next week. Lower
// visual weight than a full event card since nothing actually happened.
const RolledTransferCard: React.FC<Props> = ({ gw }) => (
  <Card className="flex flex-row flex-wrap items-center gap-2 overflow-hidden border-accent4/60 bg-primary/30 px-3 py-2 shadow-sm">
    <span className="text-xs font-semibold text-text/80 sm:text-sm">
      GW {gw}
    </span>
    <Repeat
      className="h-3.5 w-3.5 shrink-0 text-magenta sm:h-4 sm:w-4"
      aria-hidden
    />
    <span className="text-xs text-text/70 sm:text-sm">
      Rolled the transfer
    </span>
  </Card>
);

export default RolledTransferCard;
