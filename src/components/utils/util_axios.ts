import axios from "axios";
import { getCookie } from "./util_cookie";
import { sendErrorToast } from "./util_toastify";

// const MASTER_URL = "http://localhost:5000/api";
const MASTER_URL = "https://xavia.pro/api"

const axiosInstance = axios.create({
  baseURL: MASTER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const apost = async (path: string, data?: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(path, data);
    return response;
  } catch (error: any) {
    if (error.code === "ERR_NETWORK") {
      sendErrorToast("Network unavailable. Please try again later.");
    }
    throw error;
  }
};

export const apostfile = async (path: string, selectedFile: File, dataObject?: any): Promise<any> => {
  const formData = new FormData();

  Object.entries(dataObject).forEach(([key, value]: [string, any]) => {
    formData.append(key, value);
  });

  if (selectedFile) {
    formData.append("image", selectedFile);
  }

  try {
    const response = await axiosInstance.post(path, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch (error: any) {
    if (error.response?.status === 404) {
      sendErrorToast("Resource not found");
    }
    throw error;
  }
};

export const aget = async (path: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(path);
    return response;
  } catch (error: any) {
    if (error.response?.status === 404) {
      sendErrorToast("Resource not found");
    }
    throw error;
  }
};

export const adelete = async (path: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(path);
    return response;
  } catch (error: any) {
    if (error.response?.status === 404) {
      sendErrorToast("Resource not found");
    }
    throw error;
  }
};

export const aput = async (path: string, data?: any): Promise<any> => {
  try {
    const response = await axiosInstance.put(path, data);
    return response;
  } catch (error: any) {
    if (error.response?.status === 404) {
      sendErrorToast("Resource not found");
    }
    throw error;
  }
};

export const apatch = async (path: string, data?: any): Promise<any> => {
  try {
    const response = await axiosInstance.patch(path, data);
    return response;
  } catch (error: any) {
    if (error.response?.status === 404) {
      sendErrorToast("Resource not found");
    }
    throw error;
  }
};