import React from "react";
import { FaChevronRight, FaFire } from "react-icons/fa";
import { Link } from "react-router-dom";

type Props = {
  title: string;
  search: string;
};

const OutliersHeader = ({ title, search }: Props) => {
  return (
    <div className="mb-4 flex items-center gap-2 text-lg md:text-xl">
      <div className="flex w-full justify-between">
        <div className="mr-4 flex items-center gap-2">
          <h2 className="text-xs text-text md:text-lg">{title}</h2>
          <FaFire className="text-magenta" />
        </div>
        <Link
          className="flex items-center gap-1 whitespace-nowrap text-xs text-text hover:text-white md:text-lg"
          to={{ pathname: "/players", search }}
        >
          View all
          <FaChevronRight />
        </Link>
      </div>
    </div>
  );
};

export default OutliersHeader;
