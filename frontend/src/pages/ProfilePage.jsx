import React from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useProfile } from "../features/profile/hooks/useProfile";
import { JobSeekerProfile } from "../features/profile/components/JobSeekerProfile";
import { RecruiterProfile } from "../features/profile/components/RecruiterProfile";
import { ProfileSidebar } from "../components/common/ProfileSidebar";
import { Toast } from "../components/common/Toast";
import { AppHeader } from "../components/common/AppHeader";
import { AppFooter } from "../components/common/AppFooter";

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

      {/* Shared App Header */}
      <AppHeader />

      {/* Main Content Area */}
      <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Sidebar Navigation */}
          {role === "JOB_SEEKER" && (
            <ProfileSidebar
              profileData={basicInfo}
              completenessPercent={72}
            />
          )}

          {/* Right Main Profile Content */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Page Title */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Hồ sơ của bạn
              </h1>
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

                <div className="h-96 bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs" />
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
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
          </div>
        </div>
      </main>

      {/* Shared App Footer */}
      <AppFooter />
    </div>
  );
};

export default ProfilePage;
