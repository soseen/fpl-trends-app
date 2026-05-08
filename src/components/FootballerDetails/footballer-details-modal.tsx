import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import FootballerDetailsChart from "./FootballerDetailsChart/footballer-details-chart";
import FootballerDetailsHistory from "./footballer-details-history";
import FootballerDetailsSummary from "./footballer-details-summary";

type Props = {
  footballer: FootballerWithGameweekStats | null;
  onClose: () => void;
};

const FootballerDetailsModal = ({ footballer, onClose }: Props) => (
  <Dialog open={!!footballer} onOpenChange={(open) => !open && onClose()}>
    <DialogContent
      forceMount
      aria-describedby={undefined}
      className="fixed left-1/2 top-1/2 z-[99999] w-[calc(100vw-24px)] max-w-[1120px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border border-accent4/70 bg-background p-0 text-text shadow-large"
    >
      <DialogTitle className="sr-only">{footballer?.web_name}</DialogTitle>
      <div className="max-h-[88vh] overflow-y-auto p-3 md:p-5">
        {footballer && (
          <div className="flex min-w-0 flex-col gap-4">
            <FootballerDetailsSummary footballer={footballer} />

            <section className="min-w-0">
              <h3 className="mb-2 text-xs font-semibold uppercase text-text/45">
                Gameweek history
              </h3>
              <FootballerDetailsHistory footballer={footballer} />
            </section>

            <section className="min-w-0">
              <FootballerDetailsChart footballer={footballer} />
            </section>
          </div>
        )}
      </div>
    </DialogContent>
  </Dialog>
);

export default FootballerDetailsModal;
