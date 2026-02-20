import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import type { LoaderFunction, ActionFunction } from "react-router";

import { paths } from "@/config/paths";
import { ProtectedRoute } from "@/lib/auth";

import { default as AppRoot, ErrorBoundary as AppRootErrorBoundary } from "./routes/app/root";

type LazyModule = {
    clientLoader?: (client: QueryClient) => LoaderFunction;
    clientAction?: (client: QueryClient) => ActionFunction;
    default: React.ComponentType<unknown>;
    [key: string]: unknown;
};

const convert = (queryClient: QueryClient) => (m: LazyModule) => {
    const { clientLoader, clientAction, default: Component, ...rest } = m;
    return {
        ...rest,
        loader: clientLoader?.(queryClient),
        action: clientAction?.(queryClient),
        Component,
    };
};

export const createAppRouter = (queryClient: QueryClient) =>
    createBrowserRouter([
        {
            path: paths.home.path,
            lazy: () => import("./routes/landing").then(convert(queryClient)),
        },
        // {
        //   path: paths.auth.register.path,
        //   lazy: () => import('./routes/auth/register').then(convert(queryClient)),
        // },
        {
            path: paths.auth.login.path,
            lazy: () => import("./routes/auth/login").then(convert(queryClient)),
        },
        {
            path: paths.app.evaluate.path,
            lazy: () => import("./routes/app/evaluate").then(convert(queryClient)),
        },
        {
            path: paths.auth.reset.path,
            lazy: () => import("./routes/auth/reset").then(convert(queryClient)),
        },
        {
            path: paths.app.project.path,
            lazy: () => import("./routes/app/project").then(convert(queryClient)),
        },
        {
            path: paths.app.listDefences.path,
            lazy: () => import("./routes/app/listDefences").then(convert(queryClient)),
        },
        {
            path: paths.app.result.path,
            lazy: () => import("./routes/app/result").then(convert(queryClient)),
        },
        {
            path: paths.app.root.path,
            element: (
                <ProtectedRoute>
                    <AppRoot />
                </ProtectedRoute>
            ),
            ErrorBoundary: AppRootErrorBoundary,
            children: [
                {
                    path: paths.app.spases.path,
                    lazy: () => import("./routes/app/spaces").then(convert(queryClient)),
                },
            ],
        },
        {
            path: "*",
            lazy: () => import("./routes/not-found").then(convert(queryClient)),
        },
    ]);

export const AppRouter = () => {
    const queryClient = useQueryClient();

    const router = useMemo(() => createAppRouter(queryClient), [queryClient]);

    return <RouterProvider router={router} />;
};
