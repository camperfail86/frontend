import Axios, { type InternalAxiosRequestConfig } from "axios";
import { useNotifications } from "@/components/ui/notifications";

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
    config.headers = config.headers ?? {};
    config.headers.Accept = "application/json";

    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}

export const api = Axios.create({
    baseURL: "/api/v1",
});

api.interceptors.request.use(authRequestInterceptor);

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            localStorage.removeItem("token");

            useNotifications.getState().addNotification({
                type: "error",
                title: "Сессия истекла",
                message: "Войдите заново",
            });

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }

            return Promise.reject(error);
        }

        const message = error.response?.data?.detail || error.response?.data?.message || error.message;

        useNotifications.getState().addNotification({
            type: "error",
            title: "Error",
            message,
        });

        return Promise.reject(error);
    }
);
