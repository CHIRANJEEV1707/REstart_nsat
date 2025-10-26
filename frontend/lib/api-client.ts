"use client";

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { getSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${session.accessToken}`,
      };
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token or redirect to login
        const session = await getSession();
        if (!session) {
          window.location.href = "/auth/signin";
          return Promise.reject(error);
        }
        
        // If we have a refresh mechanism, we could use it here
        // For now, we'll just redirect to sign in
        window.location.href = "/auth/signin";
        return Promise.reject(error);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = "/auth/signin";
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    if (error.response?.status === 400) {
      toast({
        title: "Request Error",
        description: "Please check your input and try again.",
        variant: "destructive",
      });
    } else if (error.response?.status === 404) {
      toast({
        title: "Not Found",
        description: "The requested resource was not found.",
        variant: "destructive",
      });
    } else if (error.response?.status === 500) {
      toast({
        title: "Server Error",
        description: "An unexpected server error occurred. Please try again later.",
        variant: "destructive",
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
