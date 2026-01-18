import axiosClient from "./axiosClient";

export const getBlogs = () => axiosClient.get("/blogs");