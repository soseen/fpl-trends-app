import api from "src/lib/axios";
import { Footballer } from "./types";

export const getFootballersData = async () => {
  const response = await api.get<Footballer[]>("/footballersData");
  console.log(response.data);

  if (!response?.data) throw new Error("No footballers found");
  return response?.data;
};
