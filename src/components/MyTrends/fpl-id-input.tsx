import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  onSubmit: (entryId: number) => void;
  initialValue?: number | null;
  submitLabel?: string;
  autoFocus?: boolean;
};

const FplIdInput: React.FC<Props> = ({
  onSubmit,
  initialValue,
  submitLabel = "Submit",
  autoFocus,
}) => {
  const [raw, setRaw] = useState<string>(
    initialValue ? String(initialValue) : "",
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = raw.trim();
    if (!trimmed) {
      setError("Enter your FPL ID.");
      return;
    }
    const id = Number(trimmed);
    if (!Number.isInteger(id) || id < 1 || id > 20_000_000) {
      setError("FPL ID should be a positive number.");
      return;
    }
    setError(null);
    onSubmit(id);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center gap-2">
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoFocus={autoFocus}
          placeholder="Your FPL ID"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="bg-secondary text-text"
        />
        <Button
          type="submit"
          className="bg-magenta text-white hover:bg-magenta/90"
        >
          {submitLabel}
        </Button>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      <p className="text-xs text-text/60">
        You can find your FPL ID in the official FPL site URL when viewing your
        team (e.g. <code>fantasy.premierleague.com/entry/<b>1234567</b>/event/30</code>).
      </p>
    </form>
  );
};

export default FplIdInput;
