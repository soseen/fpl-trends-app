import type React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocalStorage } from "src/hooks/useLocalStorage";
import FplIdInput from "./fpl-id-input";
import { FPL_ID_STORAGE_KEY } from "./constants";
import { ChartLine } from "lucide-react";

const HomeFplIdPrompt: React.FC = () => {
  const [entryId, setEntryId] = useLocalStorage<number>(FPL_ID_STORAGE_KEY);
  const navigate = useNavigate();

  if (entryId !== null) {
    return (
      <div className="my-2 flex w-full items-center justify-end gap-2 rounded-sm text-sm text-text md:text-lg">
        <div className="flex items-center gap-2 rounded-md bg-accent3 px-2 py-1 text-xs text-text shadow-md md:px-4 md:py-2 md:text-sm">
          <span className="rounded-md bg-magenta3 p-2 md:text-lg">
            <ChartLine className="text-text" />
          </span>
          <span>FPL ID: {entryId}</span>
          <Link to="/my-trends" className="font-medium text-magenta hover:underline">
            View My Trends →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 w-full flex-col items-center">
      <p className="mb-2 text-center text-sm text-text md:text-xl">
        Enter your FPL ID to see your rank in the selected gameweek range.
      </p>
      <FplIdInput
        onSubmit={(id) => {
          setEntryId(id);
          navigate("/my-trends");
        }}
        submitLabel="See my rank"
      />
    </div>
  );
};

export default HomeFplIdPrompt;
