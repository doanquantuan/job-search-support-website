import React from "react";
import { User, RefreshCw, AlertCircle } from "lucide-react";
import { useProfile } from "../features/profile/hooks/useProfile";
import { JobSeekerProfile } from "../features/profile/components/JobSeekerProfile";
import { RecruiterProfile } from "../features/profile/components/RecruiterProfile";
import { Toast } from "../components/common/Toast";

export const ProfilePage = () => {
  const {
    role,
    loading,
    error,
    toast,
    setToast,
    refetch,

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
  } = useProfile();

  return (
    <div className="min-h-screen bg-slate-50/70 text-gray-800 flex flex-col font-sans">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              ◈
            </div>
            <span className="font-bold text-sm text-gray-900 tracking-tight">Tài khoản</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <User className="w-3.5 h-3.5" />
            Hồ sơ
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Hồ sơ của bạn
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Không gian hồ sơ theo vai trò tài khoản.
          </p>
        </div>

        {/* Loading State: Skeleton */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5">
              <div className="w-24 h-24 rounded-full bg-gray-200" />
              <div className="space-y-2.5 flex-1 w-full text-center sm:text-left">
                <div className="h-6 bg-gray-200 rounded-md w-48 mx-auto sm:mx-0" />
                <div className="h-4 bg-gray-200 rounded-md w-32 mx-auto sm:mx-0" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 h-80 bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs" />
              <div className="lg:col-span-8 h-96 bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs" />
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-red-100 p-8 shadow-sm text-center max-w-md mx-auto my-12">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">Không thể tải hồ sơ</h3>
            <p className="text-xs text-gray-500 mb-5">{error}</p>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Thử lại
            </button>
          </div>
        )}

        {/* Loaded Profile Content by Role */}
        {!loading && !error && (
          <>
            {role === "JOB_SEEKER" ? (
              <JobSeekerProfile
                basicInfo={basicInfo}
                educations={educations}
                experiences={experiences}
                projects={projects}
                certificates={certificates}
                awards={awards}
                skills={skills}
                careerPreference={careerPreference}
                actions={{
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
                }}
              />
            ) : (
              <RecruiterProfile
                recruiterInfo={recruiterInfo}
                companyInfo={companyInfo}
              />
            )}
          </>
        )}
      </main>

      {/* Footer / Breadcrumb note */}
      <footer className="py-4 border-t border-gray-100 text-center text-2xs text-gray-400">
        Không gian tài khoản • Hồ sơ
      </footer>
    </div>
  );
};

export default ProfilePage;
