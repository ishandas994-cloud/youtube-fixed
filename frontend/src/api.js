import axios from "axios";

// ================= BASE URL =================

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://youtube-backend-cyan.vercel.app";

// ================= AXIOS INSTANCE =================

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= REQUEST INTERCEPTOR =================

api.interceptors.request.use(

  (config) => {

    const token = localStorage.getItem("token");

    // ADD TOKEN IN HEADERS
    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    return config;

  },

  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================

api.interceptors.response.use(

  (response) => response,

  (error) => {

    // AUTO LOGOUT IF TOKEN INVALID
    if (error.response?.status === 401) {

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userProfilePic");

      console.log(
        "User logged out - Token expired"
      );
    }

    return Promise.reject(error);

  }
);

export default api;