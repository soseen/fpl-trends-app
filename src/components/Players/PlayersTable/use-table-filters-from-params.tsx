import { ColumnFilter, ColumnFiltersState, ColumnSort } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FILTERS_DEFAULT_STATE } from "./players-table";

export const useTableFiltersFromParams = () => {
  const [searchParams] = useSearchParams();

  const { sortingFromParams, filtersFromParams } = useMemo(() => {
    try {
      const sortParam = searchParams.get("sorting");
      const filtersParam = searchParams.get("filters");

      const sortingFromParams = sortParam
        ? (JSON.parse(sortParam) as ColumnSort[])
        : null;
      const filtersFromParams = filtersParam
        ? (JSON.parse(filtersParam) as ColumnFilter[])
        : null;

      return { sortingFromParams, filtersFromParams };
    } catch (error) {
      console.error("Error parsing search params:", error);
      return { sortingFromParams: null, filtersFromParams: null };
    }
  }, [searchParams]);

  const defaultFilters = filtersFromParams
    ? FILTERS_DEFAULT_STATE.map((filter) => {
        const filterToReplace = filtersFromParams.find((v) => v.id === filter.id);
        return filterToReplace ?? filter;
      })
    : FILTERS_DEFAULT_STATE;

  return { sortingFromParams, defaultFilters };
};
