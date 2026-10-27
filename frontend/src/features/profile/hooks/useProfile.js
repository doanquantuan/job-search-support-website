import { useState, useEffect, useCallback } from "react";
import { profileService } from "../services/profile.service";
import { useAuthStore } from "../../../store/useAuthStore";

export const useProfile = () => {
  const { user } = useAuthStore();
  const role = user?.role || "JOB_SEEKER";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Job Seeker states
  const [basicInfo, setBasicInfo] = useState(null);
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [awards, setAwards] = useState([]);
  const [skills, setSkills] = useState([]);
  const [careerPreference, setCareerPreference] = useState(null);

  // Recruiter states
  const [recruiterInfo, setRecruiterInfo] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);

  const showToast = useCallback((type, title, message = "") => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (role === "JOB_SEEKER") {
        const results = await Promise.allSettled([
          profileService.getJobSeekerMe(),
          profileService.getEducations(),
          profileService.getExperiences(),
          profileService.getProjects(),
          profileService.getCertificates(),
          profileService.getAwards(),
          profileService.getSkills(),
          profileService.getCareerPreference(),
        ]);

        const [
          meRes,
          eduRes,
          expRes,
          projRes,
          certRes,
          awardRes,
          skillsRes,
          cpRes,
        ] = results;

        if (meRes.status === "fulfilled" && meRes.value) {
          setBasicInfo(meRes.value);
        } else {
          // Fallback to auth store user info if available
          setBasicInfo({
            fullName: user?.fullName || "Nguyễn Minh Anh",
            avatar: user?.avatar || null,
            contactEmail: user?.email || "minh.anh.dev@gmail.com",
            phone: "0903 123 456",
            dateOfBirth: "1998-08-12",
            gender: "FEMALE",
            address: "Quận 1, TP. Hồ Chí Minh",
            githubUrl: "https://github.com/minhanh-dev",
            jobSearchStatus: "LOOKING",
          });
        }

        setEducations(eduRes.status === "fulfilled" ? eduRes.value || [] : []);
        setExperiences(expRes.status === "fulfilled" ? expRes.value || [] : []);
        setProjects(projRes.status === "fulfilled" ? projRes.value || [] : []);
        setCertificates(certRes.status === "fulfilled" ? certRes.value || [] : []);
        setAwards(awardRes.status === "fulfilled" ? awardRes.value || [] : []);
        setSkills(skillsRes.status === "fulfilled" ? skillsRes.value || [] : []);
        setCareerPreference(cpRes.status === "fulfilled" ? cpRes.value : null);
      } else if (role === "RECRUITER") {
        const recruiterData = await profileService.getUserProfile().catch(() => null);
        if (recruiterData) {
          setRecruiterInfo(recruiterData);
          if (recruiterData.companyId) {
            const comp = await profileService.getCompanyInfo(recruiterData.companyId);
            setCompanyInfo(comp);
          }
        } else {
          // Demo fallback
          setRecruiterInfo({
            fullName: user?.fullName || "Trần Hoàng Nam",
            avatar: user?.avatar || null,
            email: user?.email || "hoangnam@techflow.example",
            position: "Chuyên viên tuyển dụng",
            isVerified: false,
            companyId: null,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Mutation Actions 
  const handleUpdateBasicInfo = async (data) => {
    try {
      const updated = await profileService.updateJobSeekerMe(data);
      setBasicInfo((prev) => ({ ...prev, ...updated }));
      showToast("success", "Cập nhật thành công", "Thông tin đã được lưu vào hồ sơ.");
      return true;
    } catch (err) {
      showToast("error", "Cập nhật thất bại", err.response?.data?.message || "Vui lòng kiểm tra lại thông tin.");
      return false;
    }
  };

  const handleUploadAvatar = async (file) => {
    try {
      const res = await profileService.uploadAvatar(file);
      setBasicInfo((prev) => ({ ...prev, avatar: res.avatar }));
      showToast("success", "Cập nhật ảnh đại diện thành công");
      return true;
    } catch (err) {
      showToast("error", "Tải ảnh thất bại", err.response?.data?.message || "Không thể tải ảnh lên.");
      return false;
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await profileService.deleteAvatar();
      setBasicInfo((prev) => ({ ...prev, avatar: null }));
      showToast("success", "Đã xóa ảnh đại diện");
      return true;
    } catch (err) {
      showToast("error", "Xóa ảnh thất bại", err.response?.data?.message || "Lỗi khi xóa ảnh.");
      return false;
    }
  };

  // Education
  const handleCreateEducation = async (data) => {
    try {
      const created = await profileService.addEducation(data);
      setEducations((prev) => [created, ...prev]);
      showToast("success", "Thêm học vấn thành công");
      return true;
    } catch (err) {
      showToast("error", "Thêm thất bại", err.response?.data?.message);
      return false;
    }
  };

  const handleUpdateEducation = async (id, data) => {
    try {
      const updated = await profileService.updateEducation(id, data);
      setEducations((prev) => prev.map((item) => (item.educationId === id || item.id === id ? updated : item)));
      showToast("success", "Cập nhật học vấn thành công");
      return true;
    } catch (err) {
      showToast("error", "Cập nhật thất bại", err.response?.data?.message);
      return false;
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      await profileService.deleteEducation(id);
      setEducations((prev) => prev.filter((item) => (item.educationId || item.id) !== id));
      showToast("success", "Xóa học vấn thành công");
      return true;
    } catch (err) {
      showToast("error", "Xóa thất bại", err.response?.data?.message);
      return false;
    }
  };

  // Experience
  const handleCreateExperience = async (data) => {
    try {
      const created = await profileService.addExperience(data);
      setExperiences((prev) => [created, ...prev]);
      showToast("success", "Thêm kinh nghiệm thành công");
      return true;
    } catch (err) {
      showToast("error", "Thêm thất bại", err.response?.data?.message);
      return false;
    }
  };

  const handleUpdateExperience = async (id, data) => {
    try {
      const updated = await profileService.updateExperience(id, data);
      setExperiences((prev) => prev.map((item) => (item.experienceId === id || item.id === id ? updated : item)));
      showToast("success", "Cập nhật kinh nghiệm thành công");
      return true;
    } catch (err) {
      showToast("error", "Cập nhật thất bại", err.response?.data?.message);
      return false;
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      await profileService.deleteExperience(id);
      setExperiences((prev) => prev.filter((item) => (item.experienceId || item.id) !== id));
      showToast("success", "Xóa kinh nghiệm thành công");
      return true;
    } catch (err) {
      showToast("error", "Xóa thất bại", err.response?.data?.message);
      return false;
    }
  };

  // Project
  const handleCreateProject = async (data) => {
    try {
      const created = await profileService.addProject(data);
      setProjects((prev) => [created, ...prev]);
      showToast("success", "Thêm dự án thành công");
      return true;
    } catch (err) {
      showToast("error", "Thêm thất bại", err.response?.data?.message);
      return false;
    }
  };

  const handleUpdateProject = async (id, data) => {
    try {
      const updated = await profileService.updateProject(id, data);
      setProjects((prev) => prev.map((item) => (item.projectId === id || item.id === id ? updated : item)));
      showToast("success", "Cập nhật dự án thành công");
      return true;
    } catch (err) {
      showToast("error", "Cập nhật thất bại", err.response?.data?.message);
      return false;
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await profileService.deleteProject(id);
      setProjects((prev) => prev.filter((item) => (item.projectId || item.id) !== id));
      showToast("success", "Xóa dự án thành công");
      return true;
    } catch (err) {
      showToast("error", "Xóa thất bại", err.response?.data?.message);
      return false;
    }
  };

  // Certificate
  const handleCreateCertificate = async (data) => {
    try {
      const created = await profileService.addCertificate(data);
      setCertificates((prev) => [created, ...prev]);
      showToast("success", "Thêm chứng chỉ thành công");
      return true;
    } catch (err) {
      showToast("error", "Thêm thất bại", err.response?.data?.message);
      return false;
    }
  };

  const handleUpdateCertificate = async (id, data) => {
    try {
      const updated = await profileService.updateCertificate(id, data);
      setCertificates((prev) => prev.map((item) => (item.certificateId === id || item.id === id ? updated : item)));
      showToast("success", "Cập nhật chứng chỉ thành công");
      return true;
    } catch (err) {
      showToast("error", "Cập nhật thất bại", err.response?.data?.message);
      return false;
    }
  };

  const handleDeleteCertificate = async (id) => {
    try {
      await profileService.deleteCertificate(id);
      setCertificates((prev) => prev.filter((item) => (item.certificateId || item.id) !== id));
      showToast("success", "Xóa chứng chỉ thành công");
      return true;
    } catch (err) {
      showToast("error", "Xóa thất bại", err.response?.data?.message);
      return false;
    }
  };

  // Award
  const handleCreateAward = async (data) => {
    try {
      const created = await profileService.addAward(data);
      setAwards((prev) => [created, ...prev]);
      showToast("success", "Thêm giải thưởng thành công");
      return true;
    } catch (err) {
      showToast("error", "Thêm thất bại", err.response?.data?.message);
      return false;
    }
  };

  const handleUpdateAward = async (id, data) => {
    try {
      const updated = await profileService.updateAward(id, data);
      setAwards((prev) => prev.map((item) => (item.awardId === id || item.id === id ? updated : item)));
      showToast("success", "Cập nhật giải thưởng thành công");
      return true;
    } catch (err) {
      showToast("error", "Cập nhật thất bại", err.response?.data?.message);
      return false;
    }
  };

  const handleDeleteAward = async (id) => {
    try {
      await profileService.deleteAward(id);
      setAwards((prev) => prev.filter((item) => (item.awardId || item.id) !== id));
      showToast("success", "Xóa giải thưởng thành công");
      return true;
    } catch (err) {
      showToast("error", "Xóa thất bại", err.response?.data?.message);
      return false;
    }
  };

  // Skills
  const handleUpdateSkills = async (newSkills) => {
    try {
      await profileService.updateSkills(newSkills);
      setSkills(newSkills);
      showToast("success", "Cập nhật kỹ năng thành công");
      return true;
    } catch (err) {
      showToast("error", "Cập nhật kỹ năng thất bại", err.response?.data?.message);
      return false;
    }
  };

  // Career Preference
  const handleSaveCareerPreference = async (data) => {
    try {
      const isNew = !careerPreference;
      const res = await profileService.saveCareerPreference(data, isNew);
      setCareerPreference(res);
      showToast("success", "Lưu mục tiêu nghề nghiệp thành công");
      return true;
    } catch (err) {
      showToast("error", "Lưu thất bại", err.response?.data?.message);
      return false;
    }
  };

  return {
    role,
    loading,
    error,
    toast,
    setToast,
    refetch: fetchProfile,

    // Job Seeker
    basicInfo,
    educations,
    experiences,
    projects,
    certificates,
    awards,
    skills,
    careerPreference,

    // Recruiter
    recruiterInfo,
    companyInfo,

    // Actions
    handleUpdateBasicInfo,
    handleUploadAvatar,
    handleDeleteAvatar,
    handleCreateEducation,
    handleUpdateEducation,
    handleDeleteEducation,
    handleCreateExperience,
    handleUpdateExperience,
    handleDeleteExperience,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleCreateCertificate,
    handleUpdateCertificate,
    handleDeleteCertificate,
    handleCreateAward,
    handleUpdateAward,
    handleDeleteAward,
    handleUpdateSkills,
    handleSaveCareerPreference,
  };
};
