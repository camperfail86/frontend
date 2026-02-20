export const paths = {
    home: {
        path: "/",
        getHref: () => "/",
    },

    auth: {
        register: {
            path: "/auth/register",
            getHref: (redirectTo?: string | null | undefined) =>
                `/auth/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`,
        },
        login: {
            path: "/auth/login",
            getHref: (redirectTo?: string | null | undefined) =>
                `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`,
        },
        reset: {
            path: "/auth/reset",
            getHref: (redirectTo?: string | null | undefined) =>
                `/auth/reset${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`,
        },
    },

    app: {
        root: {
            path: "/app",
            getHref: () => "/app",
        },
        spases: {
            path: "",
            getHref: () => "/app",
        },
        project: {
            path: "/project",
            getHref: () => "/project",
        },
        listDefences: {
            path: "/defences",
            getHref: () => "/defences",
        },
        evaluate: {
            path: "/evaluate",
            getHref: () => `/evaluate`,
        },
        result: {
            path: "/app/result/:projectId",
            getHref: (projectId: string | number) => `/app/result/${projectId}`,
        },

    },
} as const;
