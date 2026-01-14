import axiosClient from "./axiosClient";

export const loginApi = (identifier, password) =>
  axiosClient.post("/login", { email: identifier, password });

export const logoutApi = () => axiosClient.post("/logout");
export const meApi = () => axiosClient.get("/user");
