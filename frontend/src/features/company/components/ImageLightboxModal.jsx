import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Lightbox xem phóng to danh sách hình ảnh (hỗ trợ phím ESC, mũi tên Trái/Phải)
 */
export const ImageLightboxModal = ({ images = [], currentIndex, onClose, onChangeIndex, altPrefix = "Ảnh công ty" }) => {
  const isOpen = typeof currentIndex === "number" && currentIndex >= 0 && currentIndex < images.length;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "ArrowLeft" && images.length > 1) {
        onChangeIndex?.((currentIndex - 1 + images.length) % images.length);
      } else if (e.key === "ArrowRight" && images.length > 1) {
        onChangeIndex?.((currentIndex + 1) % images.length);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onChangeIndex]);

  const currentSrc = isOpen ? images[currentIndex] : null;

  return (
    <AnimatePresence>
      {isOpen && currentSrc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh phóng to"
        >
          {/* Counter & Close */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-black/60 text-white text-xs font-semibold border border-white/15">
              {currentIndex + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="pointer-events-auto btn btn-circle btn-sm bg-black/60 hover:bg-black/80 text-white border border-white/20"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Prev Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChangeIndex?.((currentIndex - 1 + images.length) % images.length);
              }}
              className="absolute left-3 sm:left-6 z-10 btn btn-circle btn-sm sm:btn-md bg-black/60 hover:bg-black/85 text-white border border-white/20"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Main Image */}
          <motion.img
            key={currentSrc}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            src={currentSrc}
            alt={`${altPrefix} ${currentIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl select-none"
          />

          {/* Next Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChangeIndex?.((currentIndex + 1) % images.length);
              }}
              className="absolute right-3 sm:right-6 z-10 btn btn-circle btn-sm sm:btn-md bg-black/60 hover:bg-black/85 text-white border border-white/20"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageLightboxModal;
