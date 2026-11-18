import { useState, useEffect, useCallback } from "react";
import { profileService } from "../services/profile.service";
import { companyApi } from "../../company/services/companyApi";
import { useAuthStore } from "../../../store/useAuthStore";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (str) => typeof str === "string" && UUID_REGEX.test(str);

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
          // Fallback lấy thông tin người dùng từ auth store nếu chưa khởi tạo profile
          setBasicInfo({
            fullName: user?.fullName || "",
            avatar: user?.avatar || null,
            contactEmail: user?.email || "",
            phone: "",
            dateOfBirth: "",
            gender: "OTHER",
            address: "",
            githubUrl: "",
            jobSearchStatus: "LOOKING",
          });
        }

        setEducations(
          eduRes.status === "fulfilled" && Array.isArray(eduRes.value)
            ? eduRes.value
            : []
        );
        setExperiences(
          expRes.status === "fulfilled" && Array.isArray(expRes.value)
            ? expRes.value
            : []
        );
        setProjects(
          projRes.status === "fulfilled" && Array.isArray(projRes.value)
            ? projRes.value
            : []
        );
        setCertificates(
          certRes.status === "fulfilled" && Array.isArray(certRes.value)
            ? certRes.value
            : []
        );
        setAwards(
          awardRes.status === "fulfilled" && Array.isArray(awardRes.value)
            ? awardRes.value
            : []
        );

        let loadedSkills = [];
        if (skillsRes.status === "fulfilled") {
          if (Array.isArray(skillsRes.value)) {
            loadedSkills = skillsRes.value;
          } else if (Array.isArray(skillsRes?.value?.skills)) {
            loadedSkills = skillsRes.value.skills;
          }
        }
        setSkills(loadedSkills);

        setCareerPreference(
          cpRes.status === "fulfilled" && cpRes.value ? cpRes.value : null
        );
      } else if (role === "RECRUITER") {
        const recruiterData = await profileService.getUserProfile().catch(() => null);

        // Chuẩn hóa dữ liệu Recruiter từ API hoặc auth token hiện tại, tuyệt đối không dùng fake mock data
        const formattedRecruiter = {
          userId: recruiterData?.userId || user?.id,
          fullName: recruiterData?.fullName || recruiterData?.user?.fullName || user?.fullName || "Chưa cập nhật tên",
          avatar: recruiterData?.avatar || recruiterData?.user?.avatar || user?.avatar || null,
          email: recruiterData?.email || recruiterData?.user?.email || user?.email || "",
          position: recruiterData?.position || "",
          isVerified: recruiterData?.isVerified ?? user?.isVerified ?? false,
          companyId: recruiterData?.companyId || null,
        };

        // Lấy thông tin công ty thực tế nếu có companyId hoặc từ my-company
        let comp = null;
        if (formattedRecruiter.companyId) {
          comp = await profileService.getCompanyInfo(formattedRecruiter.companyId).catch(() => null);
        }
        if (!comp) {
          comp = await companyApi.getMyCompany().catch(() => null);
          if (comp && (comp.id || comp.companyId)) {
            formattedRecruiter.companyId = comp.id || comp.companyId;
          }
        }

        setRecruiterInfo(formattedRecruiter);
        setCompanyInfo(comp);
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
      const newAvatar = res?.avatar || res?.data?.avatar;
      setBasicInfo((prev) => ({ ...prev, avatar: newAvatar }));
      // Đồng bộ avatar mới vào Zustand store và localStorage để Header cập nhật ngay lập tức
      useAuthStore.getState().updateUser?.({ avatar: newAvatar });
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
      // Xóa avatar khỏi Zustand store và localStorage
      useAuthStore.getState().updateUser?.({ avatar: null });
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
      if (!isUUID(id)) {
        const created = await profileService.addEducation(data);
        setEducations((prev) => prev.map((item) => (item.educationId === id || item.id === id ? created : item)));
        showToast("success", "Lưu học vấn thành công");
        return true;
      }
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
      if (!isUUID(id)) {
        setEducations((prev) => prev.filter((item) => (item.educationId || item.id) !== id));
        showToast("success", "Đã xóa học vấn");
        return true;
      }
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
      if (!isUUID(id)) {
        const created = await profileService.addExperience(data);
        setExperiences((prev) => prev.map((item) => (item.experienceId === id || item.id === id ? created : item)));
        showToast("success", "Lưu kinh nghiệm thành công");
        return true;
      }
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
      if (!isUUID(id)) {
        setExperiences((prev) => prev.filter((item) => (item.experienceId || item.id) !== id));
        showToast("success", "Đã xóa kinh nghiệm");
        return true;
      }
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
      if (!isUUID(id)) {
        const created = await profileService.addProject(data);
        setProjects((prev) => prev.map((item) => (item.projectId === id || item.id === id ? created : item)));
        showToast("success", "Lưu dự án thành công");
        return true;
      }
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
      if (!isUUID(id)) {
        setProjects((prev) => prev.filter((item) => (item.projectId || item.id) !== id));
        showToast("success", "Đã xóa dự án");
        return true;
      }
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
      if (!isUUID(id)) {
        const created = await profileService.addCertificate(data);
        setCertificates((prev) => prev.map((item) => (item.certificateId === id || item.id === id ? created : item)));
        showToast("success", "Lưu chứng chỉ thành công");
        return true;
      }
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
      if (!isUUID(id)) {
        setCertificates((prev) => prev.filter((item) => (item.certificateId || item.id) !== id));
        showToast("success", "Đã xóa chứng chỉ");
        return true;
      }
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
      if (!isUUID(id)) {
        const created = await profileService.addAward(data);
        setAwards((prev) => prev.map((item) => (item.awardId === id || item.id === id ? created : item)));
        showToast("success", "Lưu giải thưởng thành công");
        return true;
      }
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
      if (!isUUID(id)) {
        setAwards((prev) => prev.filter((item) => (item.awardId || item.id) !== id));
        showToast("success", "Đã xóa giải thưởng");
        return true;
      }
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
