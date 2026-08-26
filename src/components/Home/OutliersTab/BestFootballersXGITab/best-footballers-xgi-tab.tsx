import { useBestXGIFootballers } from "./use-best-xgi-footballers";
import OutlierCard from "../outlier-card";
import OutliersHeader from "../outliers-header";

const BestFootballersXGITab = () => {
  const { bestXGIFootballers } = useBestXGIFootballers();

  return (
    <div>
      <OutliersHeader
        title="Players with the Highest npxGI / game"
        search={new URLSearchParams({
          sorting: JSON.stringify([
            { id: "npxGIPerGame", desc: true },
            { id: "totalGoals", desc: true },
          ]),
        }).toString()}
      />
      <div className="grid w-full grid-cols-4 gap-2 md:gap-6 lg:grid-cols-5">
        {bestXGIFootballers.map((footballer) => (
          <OutlierCard
            key={footballer.id}
            footballer={footballer}
            include={{ npxGI: true, returns: true }}
          />
        ))}
      </div>
    </div>
  );
};

export default BestFootballersXGITab;
