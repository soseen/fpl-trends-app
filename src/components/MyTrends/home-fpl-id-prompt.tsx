import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useLocalStorage } from "src/hooks/useLocalStorage";
import FplIdInput from "./fpl-id-input";
import { FPL_ID_STORAGE_KEY } from "./my-trends.route";

const HomeFplIdPrompt: React.FC = () => {
  const [entryId, setEntryId] = useLocalStorage<number>(FPL_ID_STORAGE_KEY);
  const navigate = useNavigate();

  if (entryId !== null) {
    return (
      <div className="mb-2 flex w-full items-center justify-end gap-2 px-1 text-sm text-text/70">
        <span>FPL ID {entryId}</span>
        <Link
          to="/my-trends"
          className="font-medium text-magenta hover:underline"
        >
          View My Trends →
        </Link>
      </div>
    );
  }

  return (
    <Card className="mb-4 w-full border-secondary bg-primary p-4 shadow-lg">
      <p className="mb-2 text-sm text-text">
        Enter your FPL ID to see your rank in the selected gameweek range.
      </p>
      <FplIdInput
        onSubmit={(id) => {
          setEntryId(id);
          navigate("/my-trends");
        }}
        submitLabel="See my rank"
      />
    </Card>
  );
};

export default HomeFplIdPrompt;
