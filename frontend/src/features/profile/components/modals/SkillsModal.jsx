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
            className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button
            type="button"
            onClick={() => addSkill()}
            className="px-4 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-semibold transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Thêm
          </button>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Selected skills list */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kỹ năng đã chọn ({skills.length}/30)
          </label>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg min-h-[90px] max-h-40 overflow-y-auto border border-gray-100">
            {skills.length === 0 ? (
              <span className="text-sm text-gray-400 italic m-auto">
                Chưa có kỹ năng nào. Nhập phía trên để thêm.
              </span>
            ) : (
              skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex h-8 items-center gap-1.5 px-3 bg-white border border-orange-200 text-orange-700 rounded-lg text-xs font-medium shadow-2xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="hover:text-red-500 transition-colors p-0.5 rounded-full"
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
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
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
                  className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 border border-gray-200/50 transition-colors"
                >
                  + {suggest}
                </button>
              ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Lưu thay đổi
          </button>
        </div>
      </form>
    </Modal>
  );
};
