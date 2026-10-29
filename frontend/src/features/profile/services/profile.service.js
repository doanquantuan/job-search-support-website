import { apiClient } from "@/lib/apiClient";

export const profileService = {
  // === Job Seeker Basic Info & Avatar ===
  getJobSeekerMe: async () => {
    const response = await apiClient.get("/job-seekers/me");
    return response.data?.data ?? response.data;
  },

  updateJobSeekerMe: async (data) => {
    const response = await apiClient.put("/job-seekers/me", data);
    return response.data?.data ?? response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post("/job-seekers/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data ?? response.data;
  },

  deleteAvatar: async () => {
    const response = await apiClient.delete("/job-seekers/me/avatar");
    return response.data?.data ?? response.data;
  },

  // === Educations ===
  getEducations: async () => {
    const response = await apiClient.get("/job-seekers/me/profile/educations");
    return response.data?.data ?? response.data ?? [];
  },

  addEducation: async (data) => {
    const response = await apiClient.post("/job-seekers/me/profile/educations", data);
    return response.data?.data ?? response.data;
  },

  updateEducation: async (id, data) => {
    const response = await apiClient.put(`/job-seekers/me/profile/educations/${id}`, data);
    return response.data?.data ?? response.data;
  },

  deleteEducation: async (id) => {
    const response = await apiClient.delete(`/job-seekers/me/profile/educations/${id}`);
    return response.data?.data ?? response.data;
  },

  // === Experiences ===
  getExperiences: async () => {
    const response = await apiClient.get("/job-seekers/me/profile/experiences");
    return response.data?.data ?? response.data ?? [];
  },

  addExperience: async (data) => {
    const response = await apiClient.post("/job-seekers/me/profile/experiences", data);
    return response.data?.data ?? response.data;
  },

  updateExperience: async (id, data) => {
    const response = await apiClient.put(`/job-seekers/me/profile/experiences/${id}`, data);
    return response.data?.data ?? response.data;
  },

  deleteExperience: async (id) => {
    const response = await apiClient.delete(`/job-seekers/me/profile/experiences/${id}`);
    return response.data?.data ?? response.data;
  },

  // === Projects ===
  getProjects: async () => {
    const response = await apiClient.get("/job-seekers/me/profile/projects");
    return response.data?.data ?? response.data ?? [];
  },

  addProject: async (data) => {
    const response = await apiClient.post("/job-seekers/me/profile/projects", data);
    return response.data?.data ?? response.data;
  },

  updateProject: async (id, data) => {
    const response = await apiClient.put(`/job-seekers/me/profile/projects/${id}`, data);
    return response.data?.data ?? response.data;
  },

  deleteProject: async (id) => {
    const response = await apiClient.delete(`/job-seekers/me/profile/projects/${id}`);
    return response.data?.data ?? response.data;
  },

  // === Certificates ===
  getCertificates: async () => {
    const response = await apiClient.get("/job-seekers/me/profile/certificates");
    return response.data?.data ?? response.data ?? [];
  },

  addCertificate: async (data) => {
    const response = await apiClient.post("/job-seekers/me/profile/certificates", data);
    return response.data?.data ?? response.data;
  },

  updateCertificate: async (id, data) => {
    const response = await apiClient.put(`/job-seekers/me/profile/certificates/${id}`, data);
    return response.data?.data ?? response.data;
  },

  deleteCertificate: async (id) => {
    const response = await apiClient.delete(`/job-seekers/me/profile/certificates/${id}`);
    return response.data?.data ?? response.data;
  },

  // === Awards ===
  getAwards: async () => {
    const response = await apiClient.get("/job-seekers/me/profile/awards");
    return response.data?.data ?? response.data ?? [];
  },

  addAward: async (data) => {
    const response = await apiClient.post("/job-seekers/me/profile/awards", data);
    return response.data?.data ?? response.data;
  },

  updateAward: async (id, data) => {
    const response = await apiClient.put(`/job-seekers/me/profile/awards/${id}`, data);
    return response.data?.data ?? response.data;
  },

  deleteAward: async (id) => {
    const response = await apiClient.delete(`/job-seekers/me/profile/awards/${id}`);
    return response.data?.data ?? response.data;
  },

  // === Skills ===
  getSkills: async () => {
    const response = await apiClient.get("/job-seekers/me/profile/skills");
    return response.data?.data ?? response.data ?? [];
  },

  updateSkills: async (skills) => {
    const response = await apiClient.put("/job-seekers/me/profile/skills", { skills });
    return response.data?.data ?? response.data;
  },

  // === Career Preference ===
  getCareerPreference: async () => {
    const response = await apiClient.get("/job-seekers/me/profile/career-preference");
    return response.data?.data ?? response.data ?? null;
  },

  saveCareerPreference: async (data, isNew = false) => {
    if (isNew) {
      const response = await apiClient.post("/job-seekers/me/profile/career-preference", data);
      return response.data?.data ?? response.data;
    }
    const response = await apiClient.put("/job-seekers/me/profile/career-preference", data);
    return response.data?.data ?? response.data;
  },

  // === Recruiter & Generic User Profile ===
  getUserProfile: async () => {
    const response = await apiClient.get("/users/me");
    return response.data?.data ?? response.data;
  },

  getCompanyInfo: async (companyId) => {
    if (!companyId) return null;
    try {
      const response = await apiClient.get(`/companies/${companyId}`);
      return response.data?.data ?? response.data;
    } catch {
      return null;
    }
  },
};

// Export thêm alias profileApi để tương thích naming style giống authApi
export const profileApi = profileService;
export default profileService;
