import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFootballersData } from "src/redux/slices/footballersSlice";
import { fetchTeams } from "src/redux/slices/teamsSlice";
import { AppDispatch, RootState } from "src/redux/store";
import { AsyncThunkStatus } from "src/redux/types";

type AppInitializerProvider = {
  children: React.ReactNode;
};

export enum AppInitStatus {
  loading = "loading",
  error = "error",
  idle = "idle",
}

type AppInitializerState = {
  status: AppInitStatus;
};

const AppInitializerContext = createContext<AppInitializerState>({
  status: AppInitStatus.loading,
});

export const AppInitializerProvider = ({ children }: AppInitializerProvider) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status } = useSelector((state: RootState) => state.footballers);
  const { status: teamsStatus } = useSelector((state: RootState) => state.teams);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchFootballersData());
    }
    if (teamsStatus === "idle") {
      dispatch(fetchTeams());
    }
  }, [dispatch, status, teamsStatus]);

  const appStatus = useMemo(() => {
    const statuses = [status, teamsStatus];
    console.log("STATUS!");
    console.log(statuses);
    if (statuses.includes(AsyncThunkStatus.failed)) {
      return AppInitStatus.error;
    } else if (
      statuses.includes(AsyncThunkStatus.loading) ||
      statuses.includes(AsyncThunkStatus.idle)
    ) {
      return AppInitStatus.loading;
    } else {
      return AppInitStatus.idle;
    }
  }, [status, teamsStatus]);

  console.log("APP STATUS IS: ", appStatus);

  return (
    <AppInitializerContext.Provider value={{ status: appStatus }}>
      {children}
    </AppInitializerContext.Provider>
  );
};

export const useAppInitContext = () => {
  const context = useContext(AppInitializerContext);
  if (!context) {
    throw new Error("useAppInitContext must be used within AppInitializerProvider");
  }
  return context;
};
