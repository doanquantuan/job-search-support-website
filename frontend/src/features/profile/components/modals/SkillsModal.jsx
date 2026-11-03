import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { X, Plus, Loader2 } from "lucide-react";

const POPULAR_SKILLS = [
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Tailwind CSS",
  "Redux",
  "Next.js",
  "HTML5",
  "CSS3",
  "Python",
  "Docker",
  "PostgreSQL",
  "MongoDB",
  "Git",
  "Figma",
  "Jest",
];

export const SkillsModal = ({
  isOpen,
  onClose,
  initialSkills = [],
  onSave,
}) => {
  const [skills, setSkills] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // initialSkills can be strings or objects { skillName: "..." }
    const normalized = (initialSkills || []).map((s) => (typeof s === "string" ? s : s.skillName || s.name || ""));
    setSkills(normalized.filter(Boolean));
    setInputValue("");
    setError(null);
  }, [initialSkills, isOpen]);

  const addSkill = (name) => {
    const trimmed = (name || inputValue).trim();
    if (!trimmed) return;

    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setError(`Kỹ năng "${trimmed}" đã tồn tại.`);
      return;
    }

    if (skills.length >= 30) {
      setError("Bạn chỉ có thể thêm tối đa 30 kỹ năng.");
      return;
    }

    setSkills([...skills, trimmed]);
    setInputValue("");
    setError(null);
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
    setError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const ok = await onSave(skills);
      if (ok) {
        onClose();
      }
    } catch (err) {
      setError(err.message || "Lỗi khi lưu kỹ năng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title="Thêm / chỉnh sửa kỹ năng"
      subtitle="Chọn hoặc nhập các kỹ năng chuyên môn của bạn"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input area */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tên kỹ năng và nhấn Enter..."
            className="input input-bordered flex-1 h-10 text-sm focus:input-primary"
          />
          <button
            type="button"
            onClick={() => addSkill()}
            className="btn btn-primary btn-outline h-10 min-h-10 px-4 text-sm font-semibold gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Thêm
          </button>
        </div>

        {error && <p className="text-xs text-error">{error}</p>}

        {/* Selected skills list */}
        <div>
          <label className="block text-sm font-semibold text-base-content mb-2">
            Kỹ năng đã chọn ({skills.length}/30)
          </label>
          <div className="flex flex-wrap gap-2 p-3 bg-base-200/60 rounded-box min-h-[90px] max-h-40 overflow-y-auto border border-base-200">
            {skills.length === 0 ? (
              <span className="text-sm text-base-content/40 italic m-auto">
                Chưa có kỹ năng nào. Nhập phía trên để thêm.
              </span>
            ) : (
              skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex h-8 items-center gap-1.5 px-3 bg-base-100 border border-primary/20 text-primary rounded-btn text-xs font-semibold shadow-2xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="hover:text-error transition-colors p-0.5 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <label className="block text-xs font-semibold text-base-content/60 mb-1.5">
            Gợi ý phổ biến
          </label>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SKILLS.filter(
              (p) => !skills.some((s) => s.toLowerCase() === p.toLowerCase())
            )
              .slice(0, 8)
              .map((suggest) => (
                <button
                  key={suggest}
                  type="button"
                  onClick={() => addSkill(suggest)}
                  className="btn btn-xs btn-ghost bg-base-200 hover:bg-primary/10 text-base-content/70 hover:text-primary border border-base-300 font-normal"
                >
                  + {suggest}
                </button>
              ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-200">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="btn btn-outline border-base-300 h-10 min-h-10 px-4 text-sm font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary h-10 min-h-10 px-5 text-sm font-semibold text-white gap-2"
          >
            {loading && <span className="loading loading-spinner loading-xs" />}
            Lưu thay đổi
          </button>
        </div>
      </form>
    </Modal>
  );
};
