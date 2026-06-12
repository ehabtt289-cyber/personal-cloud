import axios from "axios";

const api = axios.create({
  baseURL: "https://personal-cloud-q4e2.onrender.com/api ",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vault_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("vault_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
