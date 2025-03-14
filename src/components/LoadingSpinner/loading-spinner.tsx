import { FaSpinner } from "react-icons/fa";
import React from "react";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <FaSpinner className="h-6 w-6 animate-spin text-magenta" />
  </div>
);

export default LoadingSpinner;
