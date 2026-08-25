import { type ColumnFilter, type ColumnSort } from "@tanstack/react-table";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { FootballerWithGameweekStats } from "src/redux/slices/footballersGameweekStatsSlice";
import { FILTERS_DEFAULT_STATE } from "./players-table";

export const useTableFiltersFromParams = () => {
  const [searchParams] = useSearchParams();

  const { sortingFromParams, filtersFromParams, columnVisibilityFromParams } =
    useMemo(() => {
      try {
        const sortParam = searchParams.get("sorting");
        const filtersParam = searchParams.get("filters");
        const hiddenColumnsParam = searchParams.get("hiddenColumns");

        const sortingFromParams = sortParam
          ? (JSON.parse(sortParam) as ColumnSort[])
          : null;
        const filtersFromParams = filtersParam
          ? (JSON.parse(filtersParam) as ColumnFilter[])
          : null;
        const columnVisibilityFromParams =
          hiddenColumnsParam !== null
            ? (Object.fromEntries(
                (hiddenColumnsParam === "none" ? [] : hiddenColumnsParam.split(","))
                  .filter(Boolean)
                  .map((columnId) => [columnId, false]),
              ) as Partial<Record<keyof FootballerWithGameweekStats, boolean>>)
            : null;

        return {
          sortingFromParams,
          filtersFromParams,
          columnVisibilityFromParams,
        };
      } catch (error) {
        console.error("Error parsing search params:", error);
        return {
          sortingFromParams: null,
          filtersFromParams: null,
          columnVisibilityFromParams: null,
        };
      }
    }, [searchParams]);

  const defaultFilters = filtersFromParams
    ? FILTERS_DEFAULT_STATE.map((filter) => {
        const filterToReplace = filtersFromParams.find((v) => v.id === filter.id);
        return filterToReplace ?? filter;
      })
    : FILTERS_DEFAULT_STATE;

  return { sortingFromParams, defaultFilters, columnVisibilityFromParams };
};
