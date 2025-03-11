import clsx from "clsx";
import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { getFootballersImage } from "src/utils/images";

type Props = {
  code: number;
  className?: string;
};

const FootballerImage = ({ code, className }: Props) => {
  const [imageError, setImageError] = useState(false);
  return (
    <>
      {imageError ? (
        <FaUserCircle className={clsx("h-auto object-contain text-accent", className)} />
      ) : (
        <img
          src={getFootballersImage(code)}
          className={clsx("object-contain", className)}
          onError={() => setImageError(true)}
        />
      )}
    </>
  );
};

export default FootballerImage;
