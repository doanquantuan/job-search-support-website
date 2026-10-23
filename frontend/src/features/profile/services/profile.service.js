import { apiClient } from "../../../lib/apiClient";

export const profileService = {
  // === Job Seeker Basic Info & Avatar ===
  getJobSeekerMe: async () => {
    const res = await apiClient.get("/job-seekers/me");
    return res.data?.data || res.data;
  },

  updateJobSeekerMe: async (data) => {
    const res = await apiClient.put("/job-seekers/me", data);
    return res.data?.data || res.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await apiClient.post("/job-seekers/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data || res.data;
  },

  deleteAvatar: async () => {
    const res = await apiClient.delete("/job-seekers/me/avatar");
    return res.data?.data || res.data;
  },

  // === Educations ===
  getEducations: async () => {
    const res = await apiClient.get("/job-seekers/me/profile/educations");
    return res.data?.data || res.data || [];
  },
  addEducation: async (data) => {
    const res = await apiClient.post("/job-seekers/me/profile/educations", data);
    return res.data?.data || res.data;
  },
  updateEducation: async (id, data) => {
    const res = await apiClient.put(`/job-seekers/me/profile/educations/${id}`, data);
    return res.data?.data || res.data;
  },
  deleteEducation: async (id) => {
    const res = await apiClient.delete(`/job-seekers/me/profile/educations/${id}`);
    return res.data?.data || res.data;
  },

  // === Experiences ===
  getExperiences: async () => {
    const res = await apiClient.get("/job-seekers/me/profile/experiences");
    return res.data?.data || res.data || [];
  },
  addExperience: async (data) => {
    const res = await apiClient.post("/job-seekers/me/profile/experiences", data);
    return res.data?.data || res.data;
  },
  updateExperience: async (id, data) => {
    const res = await apiClient.put(`/job-seekers/me/profile/experiences/${id}`, data);
    return res.data?.data || res.data;
  },
  deleteExperience: async (id) => {
    const res = await apiClient.delete(`/job-seekers/me/profile/experiences/${id}`);
    return res.data?.data || res.data;
  },

  // === Projects ===
  getProjects: async () => {
    const res = await apiClient.get("/job-seekers/me/profile/projects");
    return res.data?.data || res.data || [];
  },
  addProject: async (data) => {
    const res = await apiClient.post("/job-seekers/me/profile/projects", data);
    return res.data?.data || res.data;
  },
  updateProject: async (id, data) => {
    const res = await apiClient.put(`/job-seekers/me/profile/projects/${id}`, data);
    return res.data?.data || res.data;
  },
  deleteProject: async (id) => {
    const res = await apiClient.delete(`/job-seekers/me/profile/projects/${id}`);
    return res.data?.data || res.data;
  },

  // === Certificates ===
  getCertificates: async () => {
    const res = await apiClient.get("/job-seekers/me/profile/certificates");
    return res.data?.data || res.data || [];
  },
  addCertificate: async (data) => {
    const res = await apiClient.post("/job-seekers/me/profile/certificates", data);
    return res.data?.data || res.data;
  },
  updateCertificate: async (id, data) => {
    const res = await apiClient.put(`/job-seekers/me/profile/certificates/${id}`, data);
    return res.data?.data || res.data;
  },
  deleteCertificate: async (id) => {
    const res = await apiClient.delete(`/job-seekers/me/profile/certificates/${id}`);
    return res.data?.data || res.data;
  },

  // === Awards ===
  getAwards: async () => {
    const res = await apiClient.get("/job-seekers/me/profile/awards");
    return res.data?.data || res.data || [];
  },
  addAward: async (data) => {
    const res = await apiClient.post("/job-seekers/me/profile/awards", data);
    return res.data?.data || res.data;
  },
  updateAward: async (id, data) => {
    const res = await apiClient.put(`/job-seekers/me/profile/awards/${id}`, data);
    return res.data?.data || res.data;
  },
  deleteAward: async (id) => {
    const res = await apiClient.delete(`/job-seekers/me/profile/awards/${id}`);
    return res.data?.data || res.data;
  },

  // === Skills ===
  getSkills: async () => {
    const res = await apiClient.get("/job-seekers/me/profile/skills");
    return res.data?.data || res.data || [];
  },
  updateSkills: async (skills) => {
    const res = await apiClient.put("/job-seekers/me/profile/skills", { skills });
    return res.data?.data || res.data;
  },

  // === Career Preference ===
  getCareerPreference: async () => {
    const res = await apiClient.get("/job-seekers/me/profile/career-preference");
    return res.data?.data || res.data || null;
  },
  saveCareerPreference: async (data, isNew = false) => {
    if (isNew) {
      const res = await apiClient.post("/job-seekers/me/profile/career-preference", data);
      return res.data?.data || res.data;
    }
    const res = await apiClient.put("/job-seekers/me/profile/career-preference", data);
    return res.data?.data || res.data;
  },

  // === Recruiter & Generic User Profile ===
  getUserProfile: async () => {
    const res = await apiClient.get("/users/me");
    return res.data?.data || res.data;
  },

  getCompanyInfo: async (companyId) => {
    if (!companyId) return null;
    try {
      const res = await apiClient.get(`/companies/${companyId}`);
      return res.data?.data || res.data;
    } catch {
      return null;
    }
  },
};
