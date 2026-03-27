import { configureAuth } from "react-query-auth";
import { Navigate, useLocation } from "react-router";
import { z } from "zod";

import { paths } from "@/config/paths";
import type { AuthResponse, User } from "@/types/api";

import { api } from "./api-client";

// api call definitions for auth (types, schemas, requests):
// these are not part of features as this is a module shared across features

const getUser = async (): Promise<User | null> => {
    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    return await api.get("/auth/me");
};

const logout = (): Promise<void> => {
    return api.post("/auth/logout");
};

export const loginInputSchema = z.object({
    email: z.string().min(1, "Required").email("Invalid email"),
    password: z.string().min(5, "Required"),
    // grant_type: z.literal("password")
});

export type LoginInput = z.infer<typeof loginInputSchema>;
const loginWithEmailAndPassword = async (data: LoginInput) => {
    const form = new URLSearchParams();
    form.append("grant_type", "password");
    form.append("username", data.email);
    form.append("password", data.password);

    // Возвращаем response.data, чтобы в loginFn были токены
    return await api.post("/auth/token", form, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    // return response.data;
};

export const registerInputSchema = z
    .object({
        email: z.string().min(1, "Required"),
        firstName: z.string().min(1, "Required"),
        lastName: z.string().min(1, "Required"),
        password: z.string().min(5, "Required"),
    })
    .and(
        z
            .object({
                teamId: z.string().min(1, "Required"),
                teamName: z.null().default(null),
            })
            .or(
                z.object({
                    teamName: z.string().min(1, "Required"),
                    teamId: z.null().default(null),
                }),
            ),
    );

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword = (data: RegisterInput): Promise<AuthResponse> => {
    return api.post("/auth/register", data);
};

const authConfig = {
    userFn: getUser,
    loginFn: async (data: LoginInput) => {
        const response = await loginWithEmailAndPassword(data);
        if (response.data.access_token) {
            localStorage.setItem("token", response.data.access_token);
        }

        return await getUser();
    },

    registerFn: async (data: RegisterInput) => {
        const response = await registerWithEmailAndPassword(data);

        if (response.access_token) {
            localStorage.setItem("token", response.access_token);
        }

        return response.user;
    },
    logoutFn: async () => {
        localStorage.removeItem("token");
        await logout();
    },
};

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } = configureAuth(authConfig);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const user = useUser();
    const location = useLocation();

    if (import.meta.env.DEV) { // Для разработки
        return children
    }

    if (!user.data) {
        return <Navigate to={paths.auth.login.getHref(location.pathname)} replace />;
    }

    return children;
};
