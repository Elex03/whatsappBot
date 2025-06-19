import axios from 'axios'



const apiClient = axios.create({
  baseURL: 'http://localhost:4000/apiFarmaNova/services/',
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;