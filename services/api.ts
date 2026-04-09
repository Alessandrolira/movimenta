import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { deleteAuthCookie, getAuthCookie } from "./cookies";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_JAVA,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthCookie("token");

    if (token) {
      config.headers.Authorization = token.value;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Se a requisição deu certo (status 200-299), apenas retorna a resposta
    return response;
  },
  (error) => {
    // Se o servidor retornar erro (ex: 401, 404, 500)
    if (error.response?.status === 401 || error.response?.status === 403) {
      deleteAuthCookie("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
