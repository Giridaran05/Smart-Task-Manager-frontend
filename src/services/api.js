import axios from "axios";

const API = axios.create({
  baseURL: "https://smart-task-manager-k2s9.onrender.com/api",
});

export default API;