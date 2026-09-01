import type React from "react";
import { useState } from "react";
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
  const [raw, setRaw] = useState<string>(initialValue ? String(initialValue) : "");
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
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-md flex-col items-center gap-2 px-1"
    >
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoFocus={autoFocus}
          placeholder="Your FPL ID"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="h-9 min-w-0 bg-white px-2 text-accent2 focus:outline-none"
        />
        <Button
          type="submit"
          className="h-9 bg-magenta px-4 text-white hover:bg-magenta/90"
        >
          {submitLabel}
        </Button>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      <p className="text-center text-xs italic text-text">
        You can find your FPL ID in the official FPL site URL (e.g.{" "}
        <code>
          fantasy.premierleague.com/entry/<b>1234567</b>/event/30
        </code>
        ).
      </p>
      <p className="text-center text-xs text-text">
        Don&apos;t have an FPL ID?{" "}
        <button
          type="button"
          onClick={() => onSubmit(18885)}
          className="text-magenta hover:underline"
        >
          Use admin&apos;s team
        </button>
      </p>
    </form>
  );
};

export default FplIdInput;
