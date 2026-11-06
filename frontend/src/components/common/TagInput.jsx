import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Tag } from "lucide-react";

export const TagInput = ({
  tags = [],
  onChange,
  placeholder = "Nhập từ khóa rồi bấm Enter...",
  suggestions = [],
  maxTags = 20,
  label,
  error,
  helperText,
  disabled = false,
  className = "",
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = (tagToAdd) => {
    if (disabled) return;
    const trimmed = (tagToAdd || inputValue).trim();
    if (!trimmed) return;

    if (tags.length >= maxTags) {
      return;
    }

    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }

    onChange?.([...tags, trimmed]);
    setInputValue("");
  };

  const handleRemoveTag = (indexToRemove) => {
    if (disabled) return;
    onChange?.(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      e.preventDefault();
      handleRemoveTag(tags.length - 1);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-base-content flex items-center justify-between">
          <span>{label}</span>
          <span className="text-2xs text-base-content/50 font-normal">
            {tags.length}/{maxTags} thẻ
          </span>
        </label>
      )}

      {/* Tags Box */}
      <div
        className={`min-h-12 p-2 bg-base-100 rounded-xl border transition-all flex flex-wrap items-center gap-1.5 ${
          error
            ? "border-error focus-within:ring-2 focus-within:ring-error/20"
            : "border-base-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        } ${disabled ? "opacity-60 bg-base-200/50 cursor-not-allowed" : ""}`}
      >
        <AnimatePresence>
          {tags.map((tag, idx) => (
            <motion.span
              key={tag}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-2xs group"
            >
              <span>{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(idx)}
                  className="hover:bg-primary/20 rounded p-0.5 text-primary/70 hover:text-primary transition-colors cursor-pointer"
                  title="Xóa thẻ"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Text Input Inside Box */}
        {tags.length < maxTags && !disabled && (
          <div className="flex-1 min-w-[140px] flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (inputValue.trim()) handleAddTag();
              }}
              placeholder={tags.length === 0 ? placeholder : "Thêm tiếp..."}
              className="w-full bg-transparent border-none outline-none text-sm text-base-content placeholder:text-base-content/40 px-1.5 py-1"
            />
          </div>
        )}
      </div>

      {/* Error & Helper texts */}
      {error && <p className="text-xs text-error">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-base-content/50">{helperText}</p>
      )}

      {/* Suggested Quick Select Pills */}
      {suggestions.length > 0 && !disabled && (
        <div className="space-y-1 pt-1">
          <p className="text-2xs font-medium text-base-content/60 flex items-center gap-1">
            <Tag className="w-3 h-3 text-primary" />
            <span>Gợi ý chọn nhanh (bấm để thêm):</span>
          </p>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((item) => {
              const isSelected = tags.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  disabled={isSelected || tags.length >= maxTags}
                  onClick={() => handleAddTag(item)}
                  className={`btn btn-xs rounded-md transition-all ${
                    isSelected
                      ? "btn-disabled opacity-40 line-through"
                      : "btn-ghost bg-base-200/80 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                  }`}
                >
                  + {item}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagInput;
