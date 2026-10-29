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
  Pencil,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Award as AwardIcon,
  BadgeCheck,
} from "lucide-react";

import { ProfileHeader } from "./ProfileHeader";
import { ProfileSectionCard } from "./ProfileSectionCard";
import { ProfileTimelineModal } from "./modals/ProfileTimelineModal";
import { AvatarModal } from "./modals/AvatarModal";
import { EditBasicInfoModal } from "./modals/EditBasicInfoModal";
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
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

  // Handle Save cho modal chung ProfileTimelineModal
  const handleSaveTimelineItem = async (data) => {
    const { type, mode, item } = modalState;
    const id = item?.id || item?.educationId || item?.experienceId || item?.projectId || item?.certificateId || item?.awardId;

    if (type === "education") {
      return mode === "create"
        ? await actions.handleCreateEducation(data)
        : await actions.handleUpdateEducation(id, data);
    }
    if (type === "experience") {
      return mode === "create"
        ? await actions.handleCreateExperience(data)
        : await actions.handleUpdateExperience(id, data);
    }
    if (type === "project") {
      return mode === "create"
        ? await actions.handleCreateProject(data)
        : await actions.handleUpdateProject(id, data);
    }
    if (type === "certificate") {
      return mode === "create"
        ? await actions.handleCreateCertificate(data)
        : await actions.handleUpdateCertificate(id, data);
    }
    if (type === "award") {
      return mode === "create"
        ? await actions.handleCreateAward(data)
        : await actions.handleUpdateAward(id, data);
    }
    return false;
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

      {/* 2. Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Narrow - 3 cols on desktop) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card: Thông tin liên hệ */}
          <div className="bg-white p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-150">
              <h3 className="font-medium text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-orange-500" />
                Thông tin liên hệ
              </h3>
              <button
                onClick={() => setModalState({ type: "basicInfo", mode: "edit", item: basicInfo })}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
              >
                <Pencil className="w-4 h-4 text-orange-600" />
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
                      className="font-medium text-orange-700 hover:text-orange-800 inline-flex items-center gap-1 hover:underline break-all"
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
          <div className="bg-white p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-150">
              <h3 className="font-medium text-gray-900 text-base sm:text-lg">Kỹ năng</h3>
              <button
                onClick={() => setModalState({ type: "skills", mode: "edit", item: skills })}
                className="text-xs font-medium text-orange-500 flex items-center gap-1 hover:underline"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            {skills && skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => {
                  const name = typeof skill === "string" ? skill : skill.skillName || skill.name;
                  return (
                    <span
                      key={index}
                      className="inline-flex h-8 items-center px-3 bg-orange-50/70 border border-orange-100 text-orange-700 rounded-lg text-xs font-semibold"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Chưa có thông tin kỹ năng.
              </p>
            )}
          </div>

          {/* Card: Mục tiêu nghề nghiệp */}
          <div className="bg-white p-5 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-150">
              <h3 className="font-medium text-gray-900 text-base sm:text-lg">Mục tiêu nghề nghiệp</h3>
              <button
                onClick={() =>
                  setModalState({ type: "careerPreference", mode: "edit", item: careerPreference })
                }
                className="text-xs font-medium text-orange-500 flex items-center gap-1 hover:underline"
              >
                <Pencil className="w-4 h-4" />
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
              <p className="text-sm text-gray-400">
                Chưa có thông tin mục tiêu cá nhân.
              </p>
            )}
          </div>
        </div>

        {/* Right Column (Wide - 9 cols on desktop) */}
        <div className="lg:col-span-9 space-y-4">
          {/* Card: Học vấn */}
          <ProfileSectionCard
            title="Học vấn"
            icon={GraduationCap}
            items={educations}
            emptyText="Chưa có thông tin học vấn."
            getId={(edu, idx) => edu.educationId || edu.id || idx}
            onAdd={() => setModalState({ type: "education", mode: "create", item: null })}
            onEdit={(edu) => setModalState({ type: "education", mode: "edit", item: edu })}
            onDelete={(edu) =>
              setModalState({
                type: "delete",
                deleteType: "education",
                item: edu,
                itemTitle: edu.institution,
              })
            }
            renderContent={(edu, { isExpanded, toggleExpand }) => (
              <div>
                <h4 className="font-medium text-gray-900 text-base sm:text-lg">
                  {edu.institution}
                </h4>
                <p className="text-orange-900 mt-0.5 text-sm sm:text-base">
                  {edu.major}
                </p>
                <p className="text-2xs text-gray-400 mt-1">
                  {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : "Hiện tại"}
                </p>
                {edu.description && (
                  <div className="mt-2">
                    <p
                      className={`text-sm text-gray-600 leading-relaxed whitespace-pre-line ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}
                    >
                      {edu.description}
                    </p>
                    <button
                      type="button"
                      onClick={toggleExpand}
                      className="text-sm font-medium text-[#1E3A5F] mt-1"
                    >
                      {isExpanded ? "Ẩn bớt" : "Xem thêm"}
                    </button>
                  </div>
                )}
              </div>
            )}
          />

          {/* Card: Kinh nghiệm làm việc */}
          <ProfileSectionCard
            title="Kinh nghiệm làm việc"
            icon={Briefcase}
            items={experiences}
            emptyText="Chưa có thông tin kinh nghiệm việc làm."
            getId={(exp, idx) => exp.experienceId || exp.id || idx}
            onAdd={() => setModalState({ type: "experience", mode: "create", item: null })}
            onEdit={(exp) => setModalState({ type: "experience", mode: "edit", item: exp })}
            onDelete={(exp) =>
              setModalState({
                type: "delete",
                deleteType: "experience",
                item: exp,
                itemTitle: exp.companyName,
              })
            }
            renderContent={(exp, { isExpanded, toggleExpand }) => (
              <div>
                <h4 className="font-medium text-gray-900 text-base sm:text-lg">
                  {exp.companyName}
                </h4>
                <p className="text-orange-900 mt-0.5 text-sm sm:text-base">
                  {exp.position}
                </p>
                <p className="text-2xs text-gray-400 mt-1">
                  {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Hiện tại"}
                </p>
                {exp.description && (
                  <div className="mt-2">
                    <p
                      className={`text-sm text-gray-600 leading-relaxed whitespace-pre-line ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}
                    >
                      {exp.description}
                    </p>
                    <button
                      type="button"
                      onClick={toggleExpand}
                      className="text-sm font-medium text-[#1E3A5F] mt-1"
                    >
                      {isExpanded ? "Ẩn bớt" : "Xem thêm"}
                    </button>
                  </div>
                )}
              </div>
            )}
          />

          {/* Card: Dự án */}
          <ProfileSectionCard
            title="Dự án"
            icon={FolderGit2}
            items={projects}
            emptyText="Chưa có thông tin dự án."
            getId={(proj, idx) => proj.projectId || proj.id || idx}
            onAdd={() => setModalState({ type: "project", mode: "create", item: null })}
            onEdit={(proj) => setModalState({ type: "project", mode: "edit", item: proj })}
            onDelete={(proj) =>
              setModalState({
                type: "delete",
                deleteType: "project",
                item: proj,
                itemTitle: proj.projectName,
              })
            }
            renderContent={(proj, { isExpanded, toggleExpand }) => (
              <div>
                <h4 className="font-medium text-gray-900 text-base sm:text-lg">
                  {proj.projectName}
                </h4>
                <p className="text-orange-900 mt-0.5 text-sm sm:text-base">
                  {proj.position}
                </p>
                <p className="text-2xs text-gray-400 mt-1">
                  {formatDate(proj.startDate)} - {proj.endDate ? formatDate(proj.endDate) : "Hiện tại"}
                </p>
                {proj.description && (
                  <div className="mt-2">
                    <p
                      className={`text-sm text-gray-600 leading-relaxed whitespace-pre-line ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}
                    >
                      {proj.description}
                    </p>
                    <button
                      type="button"
                      onClick={toggleExpand}
                      className="text-sm font-medium text-[#1E3A5F] mt-1"
                    >
                      {isExpanded ? "Ẩn bớt" : "Xem thêm"}
                    </button>
                  </div>
                )}
              </div>
            )}
          />

          {/* Card: Chứng chỉ */}
          <ProfileSectionCard
            title="Chứng chỉ"
            icon={BadgeCheck}
            items={certificates}
            emptyText="Chưa có thông tin chứng chỉ."
            getId={(cert, idx) => cert.certificateId || cert.id || idx}
            onAdd={() => setModalState({ type: "certificate", mode: "create", item: null })}
            onEdit={(cert) => setModalState({ type: "certificate", mode: "edit", item: cert })}
            onDelete={(cert) =>
              setModalState({
                type: "delete",
                deleteType: "certificate",
                item: cert,
                itemTitle: cert.certificateName,
              })
            }
            renderContent={(cert) => (
              <div>
                <h4 className="font-medium text-gray-900 text-base sm:text-lg">
                  {cert.certificateName}
                </h4>
                <p className="text-orange-900 mt-0.5 text-sm sm:text-base">
                  Nơi cấp: {cert.issuer}
                </p>
                <p className="text-2xs text-gray-400 mt-1">
                  Ngày cấp: {formatDate(cert.issueDate)}
                  {cert.expiryDate ? ` • Hết hạn: ${formatDate(cert.expiryDate)}` : " • Không thời hạn"}
                </p>
              </div>
            )}
          />

          {/* Card: Giải thưởng */}
          <ProfileSectionCard
            title="Giải thưởng"
            icon={AwardIcon}
            items={awards}
            emptyText="Chưa có thông tin giải thưởng."
            getId={(aw, idx) => aw.awardId || aw.id || idx}
            onAdd={() => setModalState({ type: "award", mode: "create", item: null })}
            onEdit={(aw) => setModalState({ type: "award", mode: "edit", item: aw })}
            onDelete={(aw) =>
              setModalState({
                type: "delete",
                deleteType: "award",
                item: aw,
                itemTitle: aw.awardName,
              })
            }
            renderContent={(aw, { isExpanded, toggleExpand }) => (
              <div>
                <h4 className="font-medium text-gray-900 text-base sm:text-lg">
                  {aw.awardName}
                </h4>
                <p className="text-orange-900 mt-0.5 text-sm sm:text-base">
                  Đơn vị trao: {aw.issuer || "Chưa cập nhật"}
                </p>
                <p className="text-2xs text-gray-400 mt-1">
                  Ngày nhận: {formatDate(aw.awardDate)}
                </p>
                {aw.description && (
                  <div className="mt-2">
                    <p
                      className={`text-sm text-gray-600 leading-relaxed whitespace-pre-line ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}
                    >
                      {aw.description}
                    </p>
                    <button
                      type="button"
                      onClick={toggleExpand}
                      className="text-sm font-medium text-[#1E3A5F] mt-1"
                    >
                      {isExpanded ? "Ẩn bớt" : "Xem thêm"}
                    </button>
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* === MODALS MOUNTING === */}
      {/* 1. Modal Avatar */}
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

      {/* 2. Modal Thông tin cơ bản */}
      {modalState.type === "basicInfo" && (
        <EditBasicInfoModal
          isOpen={true}
          onClose={closeModal}
          initialData={basicInfo}
          onSave={actions.handleUpdateBasicInfo}
        />
      )}

      {/* 3. Modal chung duy nhất cho Học vấn, Kinh nghiệm, Dự án, Chứng chỉ, Giải thưởng */}
      {["education", "experience", "project", "certificate", "award"].includes(modalState.type) && (
        <ProfileTimelineModal
          isOpen={true}
          type={modalState.type}
          mode={modalState.mode}
          initialData={modalState.item}
          onClose={closeModal}
          onSave={handleSaveTimelineItem}
        />
      )}

      {/* 4. Modal Kỹ năng */}
      {modalState.type === "skills" && (
        <SkillsModal
          isOpen={true}
          onClose={closeModal}
          initialSkills={skills}
          onSave={actions.handleUpdateSkills}
        />
      )}

      {/* 5. Modal Mục tiêu nghề nghiệp */}
      {modalState.type === "careerPreference" && (
        <CareerPreferenceModal
          isOpen={true}
          onClose={closeModal}
          initialData={careerPreference}
          onSave={actions.handleSaveCareerPreference}
        />
      )}

      {/* 6. Modal Xác nhận xóa */}
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
