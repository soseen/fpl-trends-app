import axios from "axios";

const apiConfig = {
  baseURL: process.env.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 8000,
};

const api = axios.create(apiConfig);

export default api;
