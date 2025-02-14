import { useState, useEffect, useMemo } from "react";

export const useDimensions = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
        setWidth(window.innerWidth);
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {isSM, isMD} = useMemo(() => ({isSM: width < 640,isMD: width < 1024 }), [width])
  return {isSM, isMD}
};
