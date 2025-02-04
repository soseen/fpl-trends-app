import { useMemo, useState } from "react";

export const usePagination = <T>(data: T[], limit: number = 20) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / limit);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * limit;
    const end = start + limit;
    return data.slice(start, end);
  }, [data, currentPage, limit]);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page: number) =>
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));

  return {
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  };
};
