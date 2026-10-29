import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const ProfileSectionCard = ({
  title,
  icon: Icon,
  items = [],
  emptyText,
  onAdd,
  onEdit,
  onDelete,
  getId = (item, idx) => item.id || idx,
  renderContent,
}) => {
  const [expandedIds, setExpandedIds] = useState([]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white p-6 border border-gray-200 shadow-2xs">
      {/* Header Card */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-150">
        <h3 className="font-medium text-gray-900 text-xl sm:text-2xl flex items-center gap-2">
          {Icon && <Icon className="w-8 h-8 text-orange-500" />}
          {title}
        </h3>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-orange-500 text-sm font-semibold transition-colors"
          >
            <Plus className="w-5 h-5 text-orange-500" />
            Thêm
          </button>
        )}
      </div>

      {/* Danh sách items */}
      {items.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {items.map((item, idx) => {
            const id = getId(item, idx);
            const isExpanded = expandedIds.includes(id);

            return (
              <div key={id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  {/* Nội dung bên trái */}
                  <div className="min-w-0 flex-1">
                    {renderContent(item, {
                      isExpanded,
                      toggleExpand: () => toggleExpand(id),
                    })}
                  </div>

                  {/* Nút hành động Sửa / Xóa bên phải (luôn hiển thị) */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-orange-500 rounded-lg transition-colors"
                        title="Sửa"
                        aria-label="Sửa"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="p-1.5 text-gray-400 hover:text-orange-700 rounded-lg transition-colors"
                        title="Xóa"
                        aria-label="Xóa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-base text-gray-400">
          {emptyText || `Chưa có thông tin ${title.toLowerCase()}.`}
        </p>
      )}
    </div>
  );
};

