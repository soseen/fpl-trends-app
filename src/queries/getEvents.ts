import api from "src/lib/axios";
import { Event } from "./types";


export const getEventsData = async () => {
  const response = await api.get<Event[]>("/eventsData");
  
  if (!response?.data) throw new Error("No events found");
  
  return response?.data;
};
