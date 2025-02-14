import api from "src/lib/axios";


export const getTotalPlayersData = async () => {
  const response = await api.get<number>("/totalPlayersCount");
  
  if (!response?.data) throw new Error("No totalPlayers value found");
  
  return response?.data;
};
