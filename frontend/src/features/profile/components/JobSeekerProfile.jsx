import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  MapPin,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Award as AwardIcon,
  BadgeCheck,
} from "lucide-react";

import { ProfileHeader } from "./ProfileHeader";
import { AvatarModal } from "./modals/AvatarModal";
import { EditBasicInfoModal } from "./modals/EditBasicInfoModal";
import { EducationModal } from "./modals/EducationModal";
import { ExperienceModal } from "./modals/ExperienceModal";
import { ProjectModal } from "./modals/ProjectModal";
import { CertificateModal } from "./modals/CertificateModal";
import { AwardModal } from "./modals/AwardModal";
import { SkillsModal } from "./modals/SkillsModal";
import { CareerPreferenceModal } from "./modals/CareerPreferenceModal";
import { ConfirmDeleteModal } from "./modals/ConfirmDeleteModal";

export const JobSeekerProfile = ({
  basicInfo,
  educations = [],
  experiences = [],
  projects = [],
  certificates = [],
  awards = [],
  skills = [],
  careerPreference,
  actions,
}) => {
  const navigate = useNavigate();

  // Unified modal state: { type, mode: 'create' | 'edit', item }
  const [modalState, setModalState] = useState({
    type: null,
    mode: "create",
    item: null,
  });

  const [deleteLoading, setDeleteLoading] = useState(false);

  const closeModal = () => {
    setModalState({ type: null, mode: "create", item: null });
  };

  // Helper date formatter (dd/MM/yyyy)
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    const formatNumber = (num) => {
      if (!num) return "";
      if (num >= 1000000) return `${(num / 1000000).toFixed(0)} triệu`;
      return `${num.toLocaleString("vi-VN")} đ`;
    };
    if (min && max) return `${formatNumber(min)} - ${formatNumber(max)} / tháng`;
    if (min) return `Từ ${formatNumber(min)} / tháng`;
    if (max) return `Đến ${formatNumber(max)} / tháng`;
    return null;
  };

  const getGenderLabel = (g) => {
    if (g === "MALE") return "Nam";
    if (g === "FEMALE") return "Nữ";
    if (g === "OTHER") return "Khác";
    return g || "Chưa cập nhật";
  };

  // Job Search Status Badge
  const renderJobSearchBadge = () => {
    const status = basicInfo?.jobSearchStatus || "LOOKING";
    if (status === "LOOKING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Đang tìm việc
        </span>
      );
    }
    if (status === "OPEN_TO_OFFER") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Sẵn sàng nhận lời mời
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
        Không tìm việc
      </span>
    );
  };

  // Delete item handler
  const handleConfirmDelete = async () => {
    const { item, deleteType } = modalState;
    if (!item) return;

    setDeleteLoading(true);
    const id = item.id || item.educationId || item.experienceId || item.projectId || item.certificateId || item.awardId;

    try {
      if (deleteType === "education") await actions.handleDeleteEducation(id);
      if (deleteType === "experience") await actions.handleDeleteExperience(id);
      if (deleteType === "project") await actions.handleDeleteProject(id);
      if (deleteType === "certificate") await actions.handleDeleteCertificate(id);
      if (deleteType === "award") await actions.handleDeleteAward(id);
      closeModal();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Profile Banner */}
      <ProfileHeader
        avatar={basicInfo?.avatar}
        fullName={basicInfo?.fullName || "Nguyễn Minh Anh"}
        role="JOB_SEEKER"
        extra={renderJobSearchBadge()}
        onAvatarClick={() => setModalState({ type: "avatar", mode: "edit", item: null })}
        onEditClick={() => setModalState({ type: "basicInfo", mode: "edit", item: basicInfo })}
      />

      {/* 2. Prominent CV Management Navigation Bar */}
      <div
        onClick={() => navigate("/profile/cvs")}
        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl px-5 py-3.5 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/15 rounded-lg backdrop-blur-xs">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-sm sm:text-base">Quản lý CV của tôi</h4>
            <p className="text-xs text-indigo-100 hidden sm:block">
              Tải lên, tùy chỉnh và chọn CV chính để ứng tuyển việc làm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
          Xem kho CV <span className="text-base leading-none">→</span>
        </div>
      </div>

      {/* 3. Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Narrow - 4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Thông tin liên hệ */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-indigo-600" />
                Thông tin liên hệ
              </h3>
              <button
                onClick={() => setModalState({ type: "basicInfo", mode: "edit", item: basicInfo })}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
              >
                <Pencil className="w-3.5 h-3.5" />
                Chỉnh sửa
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-start gap-3 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-2xs text-gray-400 uppercase font-semibold">Email</p>
                  <p className="font-medium text-gray-800 break-all">
                    {basicInfo?.contactEmail || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-2xs text-gray-400 uppercase font-semibold">Điện thoại</p>
                  <p className="font-medium text-gray-800">
                    {basicInfo?.phone || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-2xs text-gray-400 uppercase font-semibold">Ngày sinh</p>
                  <p className="font-medium text-gray-800">
                    {formatDate(basicInfo?.dateOfBirth) || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-600">
                <UserIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-2xs text-gray-400 uppercase font-semibold">Giới tính</p>
                  <p className="font-medium text-gray-800">
                    {getGenderLabel(basicInfo?.gender)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-2xs text-gray-400 uppercase font-semibold">Địa chỉ</p>
                  <p className="font-medium text-gray-800">
                    {basicInfo?.address || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-600">
                <svg
                  className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="text-2xs text-gray-400 uppercase font-semibold">GitHub</p>
                  {basicInfo?.githubUrl ? (
                    <a
                      href={basicInfo.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 hover:underline break-all"
                    >
                      {basicInfo.githubUrl.replace(/^https?:\/\//, "")}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  ) : (
                    <p className="font-medium text-gray-400 italic">Chưa liên kết</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Kỹ năng */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Kỹ năng</h3>
              <button
                onClick={() => setModalState({ type: "skills", mode: "edit", item: skills })}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
              >
                <Pencil className="w-3.5 h-3.5" />
                Chỉnh sửa
              </button>
            </div>

            {skills && skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => {
                  const name = typeof skill === "string" ? skill : skill.skillName || skill.name;
                  return (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-indigo-50/70 border border-indigo-100 text-indigo-700 rounded-full text-xs font-semibold"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div
                onClick={() => setModalState({ type: "skills", mode: "edit", item: [] })}
                className="border border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-300 text-gray-400 hover:text-indigo-600 text-xs transition-colors"
              >
                <Plus className="w-4 h-4 mx-auto mb-1 opacity-70" />
                Chưa cập nhật kỹ năng
              </div>
            )}
          </div>

          {/* Card: Mục tiêu nghề nghiệp */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Mục tiêu nghề nghiệp</h3>
              <button
                onClick={() =>
                  setModalState({ type: "careerPreference", mode: "edit", item: careerPreference })
                }
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
              >
                <Pencil className="w-3.5 h-3.5" />
                {careerPreference ? "Chỉnh sửa" : "+ Thêm"}
              </button>
            </div>

            {careerPreference ? (
              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <p className="text-2xs text-gray-400 uppercase font-semibold">Lương kỳ vọng</p>
                  <p className="font-semibold text-indigo-600 mt-0.5">
                    {formatSalary(
                      careerPreference.expectedSalaryMin,
                      careerPreference.expectedSalaryMax
                    ) || "Thỏa thuận"}
                  </p>
                </div>

                <div>
                  <p className="text-2xs text-gray-400 uppercase font-semibold">Địa điểm</p>
                  <p className="font-medium text-gray-800 mt-0.5">
                    {careerPreference.preferredLocation || "Linh hoạt / Chưa đặt"}
                  </p>
                </div>

                <div>
                  <p className="text-2xs text-gray-400 uppercase font-semibold">Mục tiêu</p>
                  <p className="text-gray-600 mt-0.5 leading-relaxed text-xs">
                    {careerPreference.careerGoal || "Chưa có mô tả mục tiêu cụ thể."}
                  </p>
                </div>
              </div>
            ) : (
              <div
                onClick={() =>
                  setModalState({ type: "careerPreference", mode: "create", item: null })
                }
                className="border border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-300 text-gray-400 hover:text-indigo-600 text-xs transition-colors"
              >
                <Plus className="w-4 h-4 mx-auto mb-1 opacity-70" />
                Chưa cập nhật mục tiêu nghề nghiệp
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Wide - 8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Học vấn */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Học vấn
              </h3>
              <button
                onClick={() => setModalState({ type: "education", mode: "create", item: null })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm
              </button>
            </div>

            {educations.length > 0 ? (
              <div className="space-y-4">
                {educations.map((edu, idx) => (
                  <div
                    key={edu.educationId || edu.id || idx}
                    className="group relative p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                          {edu.institution}
                        </h4>
                        <p className="text-xs text-indigo-600 font-medium mt-0.5">
                          {edu.major}
                        </p>
                        <p className="text-2xs text-gray-400 mt-1">
                          {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : "Hiện tại"}
                        </p>
                        {edu.description && (
                          <p className="text-xs text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
                            {edu.description}
                          </p>
                        )}
                      </div>

                      {/* Action buttons (always visible on mobile, hover on desktop) */}
                      <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() =>
                            setModalState({ type: "education", mode: "edit", item: edu })
                          }
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setModalState({
                              type: "delete",
                              deleteType: "education",
                              item: edu,
                              itemTitle: edu.institution,
                            })
                          }
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => setModalState({ type: "education", mode: "create", item: null })}
                className="border border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-300 text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors"
              >
                <Plus className="w-6 h-6 mx-auto mb-2 opacity-60" />
                Chưa cập nhật thông tin học vấn
              </div>
            )}
          </div>

          {/* Card: Kinh nghiệm làm việc */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Kinh nghiệm làm việc
              </h3>
              <button
                onClick={() => setModalState({ type: "experience", mode: "create", item: null })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm
              </button>
            </div>

            {experiences.length > 0 ? (
              <div className="space-y-4">
                {experiences.map((exp, idx) => (
                  <div
                    key={exp.experienceId || exp.id || idx}
                    className="group relative p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                          {exp.companyName}
                        </h4>
                        <p className="text-xs text-indigo-600 font-medium mt-0.5">
                          {exp.position}
                        </p>
                        <p className="text-2xs text-gray-400 mt-1">
                          {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Hiện tại"}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() =>
                            setModalState({ type: "experience", mode: "edit", item: exp })
                          }
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setModalState({
                              type: "delete",
                              deleteType: "experience",
                              item: exp,
                              itemTitle: exp.companyName,
                            })
                          }
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => setModalState({ type: "experience", mode: "create", item: null })}
                className="border border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-300 text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors"
              >
                <Plus className="w-6 h-6 mx-auto mb-2 opacity-60" />
                Chưa cập nhật kinh nghiệm làm việc
              </div>
            )}
          </div>

          {/* Card: Dự án */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-indigo-600" />
                Dự án
              </h3>
              <button
                onClick={() => setModalState({ type: "project", mode: "create", item: null })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm
              </button>
            </div>

            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div
                    key={proj.projectId || proj.id || idx}
                    className="group relative p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                          {proj.projectName}
                        </h4>
                        <p className="text-xs text-indigo-600 font-medium mt-0.5">
                          {proj.position}
                        </p>
                        <p className="text-2xs text-gray-400 mt-1">
                          {formatDate(proj.startDate)} - {proj.endDate ? formatDate(proj.endDate) : "Hiện tại"}
                        </p>
                        {proj.description && (
                          <p className="text-xs text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
                            {proj.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() =>
                            setModalState({ type: "project", mode: "edit", item: proj })
                          }
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setModalState({
                              type: "delete",
                              deleteType: "project",
                              item: proj,
                              itemTitle: proj.projectName,
                            })
                          }
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => setModalState({ type: "project", mode: "create", item: null })}
                className="border border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-300 text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors"
              >
                <Plus className="w-6 h-6 mx-auto mb-2 opacity-60" />
                Chưa cập nhật dự án
              </div>
            )}
          </div>

          {/* Card: Chứng chỉ */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-indigo-600" />
                Chứng chỉ
              </h3>
              <button
                onClick={() => setModalState({ type: "certificate", mode: "create", item: null })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm
              </button>
            </div>

            {certificates.length > 0 ? (
              <div className="space-y-4">
                {certificates.map((cert, idx) => (
                  <div
                    key={cert.certificateId || cert.id || idx}
                    className="group relative p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                          {cert.certificateName}
                        </h4>
                        <p className="text-xs text-gray-600 font-medium mt-0.5">
                          Nơi cấp: {cert.issuer}
                        </p>
                        <p className="text-2xs text-gray-400 mt-1">
                          Ngày cấp: {formatDate(cert.issueDate)}
                          {cert.expiryDate ? ` • Hết hạn: ${formatDate(cert.expiryDate)}` : " • Không thời hạn"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() =>
                            setModalState({ type: "certificate", mode: "edit", item: cert })
                          }
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setModalState({
                              type: "delete",
                              deleteType: "certificate",
                              item: cert,
                              itemTitle: cert.certificateName,
                            })
                          }
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => setModalState({ type: "certificate", mode: "create", item: null })}
                className="border border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-300 text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors"
              >
                <Plus className="w-6 h-6 mx-auto mb-2 opacity-60" />
                Chưa cập nhật chứng chỉ
              </div>
            )}
          </div>

          {/* Card: Giải thưởng */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <AwardIcon className="w-5 h-5 text-indigo-600" />
                Giải thưởng
              </h3>
              <button
                onClick={() => setModalState({ type: "award", mode: "create", item: null })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm
              </button>
            </div>

            {awards.length > 0 ? (
              <div className="space-y-4">
                {awards.map((aw, idx) => (
                  <div
                    key={aw.awardId || aw.id || idx}
                    className="group relative p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                          {aw.awardName}
                        </h4>
                        <p className="text-xs text-gray-600 font-medium mt-0.5">
                          Đơn vị trao: {aw.issuer || "Chưa cập nhật"}
                        </p>
                        <p className="text-2xs text-gray-400 mt-1">
                          Ngày nhận: {formatDate(aw.awardDate)}
                        </p>
                        {aw.description && (
                          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                            {aw.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() =>
                            setModalState({ type: "award", mode: "edit", item: aw })
                          }
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setModalState({
                              type: "delete",
                              deleteType: "award",
                              item: aw,
                              itemTitle: aw.awardName,
                            })
                          }
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => setModalState({ type: "award", mode: "create", item: null })}
                className="border border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-300 text-gray-400 hover:text-indigo-600 text-xs sm:text-sm transition-colors"
              >
                <Plus className="w-6 h-6 mx-auto mb-2 opacity-60" />
                Chưa cập nhật giải thưởng
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === MODALS MOUNTING === */}
      {modalState.type === "avatar" && (
        <AvatarModal
          isOpen={true}
          onClose={closeModal}
          currentAvatar={basicInfo?.avatar}
          fullName={basicInfo?.fullName}
          onUpload={actions.handleUploadAvatar}
          onDelete={actions.handleDeleteAvatar}
        />
      )}

      {modalState.type === "basicInfo" && (
        <EditBasicInfoModal
          isOpen={true}
          onClose={closeModal}
          initialData={basicInfo}
          onSave={actions.handleUpdateBasicInfo}
        />
      )}

      {modalState.type === "education" && (
        <EducationModal
          isOpen={true}
          onClose={closeModal}
          mode={modalState.mode}
          initialData={modalState.item}
          onSave={(data) =>
            modalState.mode === "create"
              ? actions.handleCreateEducation(data)
              : actions.handleUpdateEducation(modalState.item.educationId || modalState.item.id, data)
          }
        />
      )}

      {modalState.type === "experience" && (
        <ExperienceModal
          isOpen={true}
          onClose={closeModal}
          mode={modalState.mode}
          initialData={modalState.item}
          onSave={(data) =>
            modalState.mode === "create"
              ? actions.handleCreateExperience(data)
              : actions.handleUpdateExperience(modalState.item.experienceId || modalState.item.id, data)
          }
        />
      )}

      {modalState.type === "project" && (
        <ProjectModal
          isOpen={true}
          onClose={closeModal}
          mode={modalState.mode}
          initialData={modalState.item}
          onSave={(data) =>
            modalState.mode === "create"
              ? actions.handleCreateProject(data)
              : actions.handleUpdateProject(modalState.item.projectId || modalState.item.id, data)
          }
        />
      )}

      {modalState.type === "certificate" && (
        <CertificateModal
          isOpen={true}
          onClose={closeModal}
          mode={modalState.mode}
          initialData={modalState.item}
          onSave={(data) =>
            modalState.mode === "create"
              ? actions.handleCreateCertificate(data)
              : actions.handleUpdateCertificate(modalState.item.certificateId || modalState.item.id, data)
          }
        />
      )}

      {modalState.type === "award" && (
        <AwardModal
          isOpen={true}
          onClose={closeModal}
          mode={modalState.mode}
          initialData={modalState.item}
          onSave={(data) =>
            modalState.mode === "create"
              ? actions.handleCreateAward(data)
              : actions.handleUpdateAward(modalState.item.awardId || modalState.item.id, data)
          }
        />
      )}

      {modalState.type === "skills" && (
        <SkillsModal
          isOpen={true}
          onClose={closeModal}
          initialSkills={skills}
          onSave={actions.handleUpdateSkills}
        />
      )}

      {modalState.type === "careerPreference" && (
        <CareerPreferenceModal
          isOpen={true}
          onClose={closeModal}
          initialData={careerPreference}
          onSave={actions.handleSaveCareerPreference}
        />
      )}

      {modalState.type === "delete" && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={closeModal}
          itemTitle={modalState.itemTitle}
          loading={deleteLoading}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};
