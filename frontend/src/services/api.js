// Imports
import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
})

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }
)

// Interceptor to run before every request is made
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Log errors for debugging
        console.error('API request failed:', error.response ? error.response.data : error.message);
        return Promise.reject(error);
    }
);

// Export
export default API;