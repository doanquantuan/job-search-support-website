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
    <div className="card bg-base-100 p-6 border border-base-200 shadow-sm">
      {/* Header Card */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-base-200">
        <h3 className="font-semibold text-base-content text-xl sm:text-2xl flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-btn bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary flex-shrink-0">
            {Icon && <Icon className="w-5 h-5 text-secondary" />}
          </div>
          {title}
        </h3>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="btn btn-ghost btn-sm text-primary font-semibold gap-1"
          >
            <Plus className="w-4 h-4 text-primary" />
            Thêm
          </button>
        )}
      </div>

      {/* Danh sách items */}
      {items.length > 0 ? (
        <div className="divide-y divide-base-200">
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
                        className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-primary"
                        title="Sửa"
                        aria-label="Sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-error"
                        title="Xóa"
                        aria-label="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-base-content/50">
          {emptyText || `Chưa có thông tin ${title.toLowerCase()}.`}
        </p>
      )}
    </div>
  );
};
