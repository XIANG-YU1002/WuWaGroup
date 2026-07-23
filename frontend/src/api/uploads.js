import { apiRequest } from "./client.js";

export function uploadImage(file, category, token) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  return apiRequest("/uploads/images", { method: "POST", body: formData, token, isFormData: true });
}
