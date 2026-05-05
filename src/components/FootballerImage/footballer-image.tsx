import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { getFootballersImage } from "src/utils/images";

type Props = {
  code: number;
  className?: string;
};

const FootballerImage = ({ code, className }: Props) => {
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Reset whenever the player changes — without this, a transient PL CDN 404
  // on one player would lock this component instance into the placeholder
  // for the rest of the session, even after pagination/modal-reopen swaps in
  // a player whose photo would actually load.
  useEffect(() => {
    setImageError(false);
    setLoaded(false);
  }, [code]);

  if (imageError) {
    return (
      <FaUserCircle className={clsx("h-auto object-contain text-accent", className)} />
    );
  }
  return (
    <img
      src={getFootballersImage(code)}
      className={clsx(
        "object-contain transition-opacity duration-200",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
      decoding="async"
      loading="lazy"
      onLoad={() => setLoaded(true)}
      onError={() => setImageError(true)}
    />
  );
};

export default FootballerImage;
