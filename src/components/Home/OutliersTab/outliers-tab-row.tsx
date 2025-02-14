import React from "react";
import {
  AppInitStatus,
  useAppInitContext,
} from "src/components/AppInitializer/app-initializer.context";
import OutliersRowSkeleton from "./outliers-row.skeleton";

type Props = {
  component: React.ReactNode;
};

const OutliersTabRow = ({ component }: Props) => {
  const { status } = useAppInitContext();

  return <>{status !== AppInitStatus.loading ? component : <OutliersRowSkeleton />}</>;
};

export default OutliersTabRow;
