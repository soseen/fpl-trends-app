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
        <FaUserCircle className={clsx("text-accent shadow-md", className)} />
      ) : (
        <img
          src={getFootballersImage(code)}
          className={clsx("rounded-full object-contain", className)}
          onError={() => setImageError(true)}
        />
      )}
    </>
  );
};

export default FootballerImage;
