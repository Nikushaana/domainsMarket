import axios from "axios";

export const axiosFront = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/`,
});

axiosFront.interceptors.request.use((config) => {
  return config;
});

//

export const axiosUser = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/`,
});

axiosUser.interceptors.request.use((config) => {
  const token = localStorage.getItem("fullstack-user-token");
  config.headers.Authorization = token && `Bearer ${token}`;

  return config;
});

//

export const axiosAdmin = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/`,
});

axiosAdmin.interceptors.request.use((config) => {
  const token = localStorage.getItem("fullstack-admin-token");
  config.headers.Authorization = token && `Bearer ${token}`;

  return config;
});
