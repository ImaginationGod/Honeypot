import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_API_KEY || "",
    },
    timeout: 10000,
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Network error (server down, no internet, CORS, etc.)
        if (!error.response) {
            if (error.code === "ECONNABORTED") {
                return Promise.reject({
                    message: "Request timed out",
                    isTimeout: true,
                    isNetworkError: true,
                });
            }

            return Promise.reject({
                message: "Backend server not reachable",
                isNetworkError: true,
            });
        }

        // Backend responded with error
        return Promise.reject({
            message:
                error.response.data?.message ||
                "Something went wrong on server",
            status: error.response.status,
            data: error.response.data,
        });
    }
);

export default api;
