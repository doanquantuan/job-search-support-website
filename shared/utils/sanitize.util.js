/**
 * Hàm làm sạch chuỗi nhằm ngăn ngừa lỗ hổng XSS (Cross-Site Scripting)
 * Loại bỏ các thẻ HTML nguy hiểm (<script>, <iframe>, <object>, <embed>, ...)
 * và escape các ký tự đặc biệt nguy hại.
 */
export const sanitizeHtml = (str) => {
  if (typeof str !== 'string') return str;

  // Escape các ký tự đặc biệt của HTML
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Loại bỏ toàn bộ thẻ HTML hoặc các payload script nguy hiểm
 */
export const stripHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>?/gm, '').trim();
};

export default {
  sanitizeHtml,
  stripHtml,
};
