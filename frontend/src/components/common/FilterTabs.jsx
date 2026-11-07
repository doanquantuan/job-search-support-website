import React from "react";
import { motion } from "framer-motion";

export const FilterTabs = ({
  tabs = [],
  activeTab,
  onTabChange,
  layoutId = "activeFilterPill",
  className = "",
  size = "md", // "sm" | "md"
}) => {
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1 bg-base-200/70 rounded-xl border border-base-300 max-w-full overflow-x-auto scrollbar-none ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange?.(tab.id)}
            className={`relative flex items-center gap-2 rounded-lg font-medium transition-colors select-none shrink-0 ${
              sizeStyles[size] || sizeStyles.md
            } ${
              isActive
                ? "text-primary font-semibold"
                : "text-base-content/70 hover:text-base-content hover:bg-base-100/50"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-base-100 rounded-lg shadow-xs border border-base-300/80 -z-0"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-1.5">
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`text-2xs font-bold px-1.5 py-0.2 rounded-full transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-base-300 text-base-content/70"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;
