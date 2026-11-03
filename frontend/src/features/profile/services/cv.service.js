import { apiClient } from "../../../lib/apiClient";

export const cvService = {
  getCvs: async () => {
    const res = await apiClient.get("/job-seekers/me/cvs");
    return res.data?.data || res.data || [];
  },

  uploadCv: async (file, title, onProgress) => {
    const formData = new FormData();
    formData.append("cv", file);
    if (title) {
      formData.append("title", title);
    }
    const res = await apiClient.post("/job-seekers/me/cvs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return res.data?.data || res.data;
  },

  updateCv: async (cvId, title) => {
    const res = await apiClient.put(`/job-seekers/me/cvs/${cvId}`, { title });
    return res.data?.data || res.data;
  },

  deleteCv: async (cvId) => {
    const res = await apiClient.delete(`/job-seekers/me/cvs/${cvId}`);
    return res.data?.data || res.data;
  },
};
