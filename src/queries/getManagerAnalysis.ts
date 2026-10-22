import api from "src/lib/axios";
import { ZodError } from "zod";
import {
  AnalysisResponseSchema,
  type AnalysisResponse,
} from "./analytics-contracts.generated";

export const getManagerAnalysis = async (
  entry: number,
  start: number,
  end: number,
  signal?: AbortSignal,
  refresh = false,
): Promise<AnalysisResponse> => {
  const response = await api.get<unknown>(`manager/${entry}/analysis`, {
    params: { start, end, ...(refresh ? { refresh: true } : {}) },
    signal,
    timeout: 8000,
    validateStatus: (status) =>
      (status >= 200 && status < 300) || status === 404 || status === 503,
  });
  try {
    return AnalysisResponseSchema.parse(response.data);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Invalid manager analysis response", error);
      throw new Error("The analysis response could not be read. Please refresh shortly.");
    }
    throw error;
  }
};
export type SectionQuery<T> = {
  data: T | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
};
