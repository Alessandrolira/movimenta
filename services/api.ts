import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_JAVA,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = token;
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
    if (error.response?.status === 401) {
      // Exemplo: Token expirado. Limpamos o lixo e mandamos pro login.
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
