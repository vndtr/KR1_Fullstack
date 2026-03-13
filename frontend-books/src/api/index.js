// src/api/index.js
import axios from "axios";

// Базовый клиент
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Перехватчик запросов — добавляет токен в заголовок
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Перехватчик ответов — обрабатывает истекший токен
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Если ошибка 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      const accessToken = localStorage.getItem("accessToken");

      // Если нет токенов — просто reject
      if (!accessToken || !refreshToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(error);
      }

      try {
        // Пробуем обновить токены
        const response = await axios.post(
          "http://localhost:3000/api/auth/refresh",
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Сохраняем новые токены
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Повторяем исходный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Если обновить не удалось — чистим токены и reject
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// API методы
export const api = {
  // Аутентификация
  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data; // { accessToken, refreshToken, user }
  },
  
  getMe: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  // Книги
  getBooks: async () => {
    const response = await apiClient.get("/books");
    return response.data;
  },
  
  getBookById: async (id) => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data;
  },
  
  createBook: async (bookData) => {
    const response = await apiClient.post("/books", bookData);
    return response.data;
  },
  
  updateBook: async (id, bookData) => {
    const response = await apiClient.put(`/books/${id}`, bookData);
    return response.data;
  },
  
  deleteBook: async (id) => {
    await apiClient.delete(`/books/${id}`);
  }
};