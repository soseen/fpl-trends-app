import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { AiFillCloseCircle as CloseIcon } from "react-icons/ai";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import FootballerDetailsChart from "./FootballerDetailsChart/footballer-details-chart";
import FootballerDetailsHistory from "./footballer-details-history";
import FootballerDetailsSummary from "./footballer-details-summary";

type Props = {
  footballer: FootballerWithGameweekStats | null;
  onClose: () => void;
};

const FootballerDetailsDrawer = ({ footballer, onClose }: Props) => {
  if (!footballer) return null;

  return (
    <Drawer open={!!footballer} direction="top" onClose={onClose}>
      <DrawerContent
        className="inset-0 z-[300] mt-0 h-full w-full overflow-x-hidden rounded-none border-0 bg-background px-0 pt-3 text-text"
        aria-describedby={undefined}
      >
        <DrawerTitle className="sr-only">{footballer.web_name}</DrawerTitle>
        <Button
          className="absolute right-2 top-2 z-20 box-content h-8 w-8 rounded-full bg-accent2/80 p-0 text-text opacity-80 ring-1 ring-inset ring-accent4/60 hover:bg-accent2 hover:opacity-100"
          onClick={onClose}
        >
          <CloseIcon className="h-5 w-5 text-magenta" />
        </Button>

        <div className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4 pt-6">
          <div className="mx-auto flex max-w-[720px] flex-col gap-3">
            <FootballerDetailsSummary footballer={footballer} compact />

            <section className="min-w-0">
              <h3 className="mb-2 text-xs font-semibold uppercase text-text/45">
                Gameweek history
              </h3>
              <FootballerDetailsHistory footballer={footballer} />
            </section>

            <FootballerDetailsChart footballer={footballer} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FootballerDetailsDrawer;
