import api from "src/lib/axios";
import { Team, TeamData } from "./types";


export const getTeamsData = async () => {
  const response = await api.get<TeamData[]>("/teamsData");
  
  if (!response?.data) throw new Error("No teams found");
  
  return response?.data;
};
