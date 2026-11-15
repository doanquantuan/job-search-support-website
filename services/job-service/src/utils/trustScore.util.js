/**
 * Tính toán trọng số uy tín của một lượt báo cáo (Trust Score / Weighting)
 * Không phải mọi lượt report đều có giá trị như nhau.
 *
 * @param {Object} params
 * @param {string} params.reason - Lý do báo cáo
 * @param {string} params.description - Mô tả chi tiết
 * @param {number} params.resolvedReports - Số report hợp lệ trước đây của user
 * @param {number} params.rejectedReports - Số report bị admin bác bỏ trước đây của user
 * @param {number} params.totalViews - Số lượt xem tin hoặc tương tác của user với hệ thống
 * @returns {number} Điểm trọng số weight (từ 0.2 đến 3.0)
 */
export const calculateReportWeight = ({
  reason,
  description = '',
  resolvedReports = 0,
  rejectedReports = 0,
  totalViews = 0,
}) => {
  let weight = 1.0;

  // 1. Phân loại theo mức độ nghiêm trọng của hành vi vi phạm (Severity)
  // Các hành vi lừa đảo hoặc vi phạm nội quy nặng có trọng số cao hơn
  switch (reason) {
    case 'FRAUD':
      weight += 0.5;
      break;
    case 'FAKE_INFORMATION':
      weight += 0.3;
      break;
    case 'INAPPROPRIATE_CONTENT':
      weight += 0.3;
      break;
    case 'DUPLICATE':
      weight += 0.1;
      break;
    case 'OTHER':
    default:
      break;
  }

  // 2. Đánh giá chất lượng bằng chứng (Description quality)
  // Có mô tả chi tiết, cung cấp bằng chứng rõ ràng (> 50 ký tự) tăng trọng số
  const descLength = description ? description.trim().length : 0;
  if (descLength >= 100) {
    weight += 0.4;
  } else if (descLength >= 30) {
    weight += 0.2;
  } else if (descLength === 0) {
    weight -= 0.2; // Không có mô tả chi tiết thì độ tin cậy thấp hơn
  }

  // 3. Đánh giá lịch sử uy tín của người báo cáo (Reporter History)
  // - Nếu user từng gửi các report chính xác và được admin duyệt (RESOLVED): cộng điểm
  // - Nếu user thường xuyên gửi report rác bị từ chối (REJECTED): trừ điểm uy tín nặng
  if (resolvedReports > 0) {
    weight += Math.min(resolvedReports * 0.2, 0.8);
  }
  if (rejectedReports > 0) {
    weight -= Math.min(rejectedReports * 0.3, 0.9);
  }

  // 4. Mức độ hoạt động / tương tác của tài khoản trên hệ thống
  if (totalViews >= 10) {
    weight += 0.2;
  }

  // Giới hạn trọng số trong khoảng từ 0.2 (tối thiểu) đến 3.0 (tối đa)
  const finalWeight = Math.max(0.2, Math.min(3.0, weight));
  return Math.round(finalWeight * 10) / 10;
};

export default {
  calculateReportWeight,
};
