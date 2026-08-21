import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://nourishshare-e2300557-e2300584-e2300570.onrender.com/api/v1";

console.log("API BASE URL:", API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
    (config) => {
        console.log("====================================");
        console.log("API REQUEST");
        console.log("Method:", config.method);
        console.log("URL:", `${config.baseURL}${config.url}`);
        console.log("Data:", config.data);
        console.log("====================================");

        const stored = localStorage.getItem("saveplate_user");

        if (stored) {
            try {
                const user = JSON.parse(stored);

                if (user.accessToken) {
                    config.headers.Authorization =
                        `Bearer ${user.accessToken}`;
                }
            } catch (error) {
                console.error(
                    "Failed to parse saveplate_user:",
                    error
                );
            }
        }

        return config;
    },
    (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
    }
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });

    failedQueue = [];
}

api.interceptors.response.use(
    (response) => {
        console.log("====================================");
        console.log("API RESPONSE");
        console.log("Status:", response.status);
        console.log("URL:", response.config.url);
        console.log("Data:", response.data);
        console.log("====================================");

        return response;
    },

    async (error) => {
        console.error("====================================");
        console.error("API ERROR");

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("URL:", error.config?.url);
            console.error("Response:", error.response.data);
        } else if (error.request) {
            console.error("Request sent but no response received");
            console.error("Request:", error.request);
        } else {
            console.error("Error:", error.message);
        }

        console.error("====================================");

        const originalRequest = error.config;

        // No config means we cannot retry
        if (!originalRequest) {
            return Promise.reject(error);
        }

        // =================================================
        // DO NOT REFRESH TOKEN FOR THESE REQUESTS
        // =================================================

        const isLoginRequest =
            originalRequest.url?.includes("/users/login");

        const isRegisterRequest =
            originalRequest.url?.includes("/users/register");

        const isRefreshRequest =
            originalRequest.url?.includes("/users/refreshToken");

        if (
            error.response?.status !== 401 ||
            originalRequest._retry ||
            isLoginRequest ||
            isRegisterRequest ||
            isRefreshRequest
        ) {
            return Promise.reject(error);
        }

        // =================================================
        // LOGOUT
        // =================================================

        if (originalRequest.url?.includes("/users/logout")) {
            localStorage.removeItem("saveplate_user");
            window.location.href = "/login";

            return Promise.reject(error);
        }

        // =================================================
        // GET STORED USER
        // =================================================

        const storedUser = localStorage.getItem("saveplate_user");

        if (!storedUser) {
            return Promise.reject(error);
        }

        let parsedUser;

        try {
            parsedUser = JSON.parse(storedUser);
        } catch (parseError) {
            console.error(
                "Could not parse saveplate_user:",
                parseError
            );

            localStorage.removeItem("saveplate_user");

            return Promise.reject(error);
        }

        // =================================================
        // IF TOKEN REFRESH IS ALREADY RUNNING
        // =================================================

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve,
                    reject,
                });
            })
                .then((token) => {
                    originalRequest.headers.Authorization =
                        `Bearer ${token}`;

                    return api(originalRequest);
                })
                .catch((refreshError) => {
                    return Promise.reject(refreshError);
                });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        // =================================================
        // REFRESH TOKEN
        // =================================================

        try {
            console.log("Refreshing access token...");

            const refreshResponse = await axios.post(
                `${API_BASE_URL}/users/refreshToken`,
                parsedUser.refreshToken
                    ? {
                          refreshToken:
                              parsedUser.refreshToken,
                      }
                    : {},
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log(
                "Refresh response:",
                refreshResponse.data
            );

            const newAccessToken =
                refreshResponse.data?.data?.accessToken;

            const newRefreshToken =
                refreshResponse.data?.data?.refreshToken;

            // =================================================
            // REFRESH SUCCESSFUL
            // =================================================

            if (newAccessToken) {
                parsedUser.accessToken = newAccessToken;

                if (newRefreshToken) {
                    parsedUser.refreshToken =
                        newRefreshToken;
                }

                localStorage.setItem(
                    "saveplate_user",
                    JSON.stringify(parsedUser)
                );

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);

                return api(originalRequest);
            }

            // =================================================
            // REFRESH FAILED
            // =================================================

            processQueue(error);

            localStorage.removeItem("saveplate_user");

            window.location.href = "/login";

            return Promise.reject(error);
        } catch (refreshError) {
            console.error(
                "Token refresh failed:",
                refreshError
            );

            processQueue(refreshError);

            localStorage.removeItem("saveplate_user");

            window.location.href = "/login";

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;