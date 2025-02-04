import api from "src/lib/axios";
import { Team, TeamData } from "./types";


export const getTeamsData = async () => {
  const response = await api.get<TeamData[]>("/teamsData");
  console.log("TEAMS!");
  console.log(response.data);

  if (!response?.data) throw new Error("No teams found");
  return response?.data;
};
