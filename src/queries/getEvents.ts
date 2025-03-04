import axios from "axios";


export const getEventsData = async () => {
  // const response = await api.get<Event[]>("/eventsData");
  const response = await axios.get(`${process.env.API_BASE_URL}/eventsData`);
  
  if (!response?.data) throw new Error("No events found");
  
  return response?.data;
};
