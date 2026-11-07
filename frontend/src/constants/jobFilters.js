/**
 * JOB FILTERS CONSTANTS
 * Quản lý tập trung toàn bộ các tùy chọn bộ lọc cho Việc làm & Công ty.
 */

// Danh sách các địa điểm tuyển dụng phổ biến tại Việt Nam
export const LOCATIONS = [
  { value: '', label: 'Tất cả địa điểm' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Bình Dương', label: 'Bình Dương' },
  { value: 'Cần Thơ', label: 'Cần Thơ' },
  { value: 'Hải Phòng', label: 'Hải Phòng' },
  { value: 'Đồng Nai', label: 'Đồng Nai' },
  { value: 'Bắc Ninh', label: 'Bắc Ninh' },
];

export const FILTER_LOCATIONS = [
  'Tất cả',
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Bình Dương',
  'Cần Thơ',
  'Hải Phòng',
  'Đồng Nai',
  'Bắc Ninh',
];

// Từ khóa tìm kiếm thịnh hành ở Hero
export const TRENDING_KEYWORDS = [
  'ReactJS',
  'Node.js',
  'Java',
  'Kinh doanh',
  'Marketing',
  'Kế toán',
  'Nhân sự',
  'Designer',
];

// Các chế độ lọc chi tiết cho phần "Việc làm nổi bật"
export const FILTER_MODES = [
  { key: 'category', label: 'Ngành nghề' },
  { key: 'location', label: 'Địa điểm' },
  { key: 'salary', label: 'Mức lương' },
  { key: 'experience', label: 'Kinh nghiệm' },
];

// Mức lương lọc nhanh (dạng text cho pills)
export const FILTER_SALARIES = [
  'Tất cả',
  'Dưới 10 triệu',
  '10 - 15 triệu',
  '15 - 20 triệu',
  '20 - 25 triệu',
  'Trên 25 triệu',
  'Thỏa thuận',
];

// Mức lương cho Dropdown (JobFilterBar)
export const SALARY_OPTIONS = [
  { value: 'all', label: 'Tất cả mức lương' },
  { value: 'under_10', label: 'Dưới 10 triệu' },
  { value: '10_15', label: '10 – 15 triệu' },
  { value: '15_25', label: '15 – 25 triệu' },
  { value: '25_50', label: '25 – 50 triệu' },
  { value: 'over_50', label: 'Trên 50 triệu' },
  { value: 'deal', label: 'Thỏa thuận' },
];

// Kinh nghiệm lọc nhanh (dạng text cho pills)
export const FILTER_EXPERIENCES = [
  'Tất cả',
  'Chưa có kinh nghiệm',
  'Dưới 1 năm',
  '1 - 2 năm',
  '2 - 3 năm',
  '3 - 5 năm',
  'Trên 5 năm',
];

// Kinh nghiệm cho Dropdown (JobFilterBar)
export const EXPERIENCE_OPTIONS = [
  { value: 'all', label: 'Tất cả kinh nghiệm' },
  { value: 'Chưa có kinh nghiệm', label: 'Chưa có kinh nghiệm' },
  { value: 'Dưới 1 năm', label: 'Dưới 1 năm' },
  { value: '1 - 3 năm', label: '1 – 3 năm' },
  { value: '3 - 5 năm', label: '3 – 5 năm' },
  { value: 'Trên 5 năm', label: 'Trên 5 năm' },
];

// Hình thức làm việc cho Dropdown (JobFilterBar)
export const WORK_TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả hình thức' },
  { value: 'Toàn thời gian', label: 'Toàn thời gian' },
  { value: 'Bán thời gian', label: 'Bán thời gian' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'Remote', label: 'Remote / Từ xa' },
  { value: 'Tại văn phòng', label: 'Tại văn phòng' },
  { value: 'Thực tập', label: 'Thực tập' },
];

// Cấp bậc cho Dropdown (JobFilterBar)
export const LEVEL_OPTIONS = [
  { value: 'all', label: 'Tất cả cấp bậc' },
  { value: 'Thực tập sinh', label: 'Thực tập sinh' },
  { value: 'Nhân viên', label: 'Nhân viên' },
  { value: 'Chuyên viên', label: 'Chuyên viên' },
  { value: 'Trưởng nhóm / Quản lý', label: 'Trưởng nhóm / Quản lý' },
  { value: 'Giám đốc', label: 'Giám đốc' },
];

// Quy mô công ty
export const COMPANY_SIZES = [
  { value: 'SIZE_1_50', label: '1 - 50 nhân viên' },
  { value: 'SIZE_51_200', label: '51 - 200 nhân viên' },
  { value: 'SIZE_201_500', label: '201 - 500 nhân viên' },
  { value: 'SIZE_501_1000', label: '501 - 1.000 nhân viên' },
  { value: 'SIZE_1001_5000', label: '1.000+ nhân viên' },
];

// Chức vụ của người đại diện tuyển dụng (Recruiter)
export const RECRUITER_POSITIONS = [
  'Nhân viên tuyển dụng (HR Recruiter)',
  'Trưởng phòng nhân sự (HR Manager / HR Director)',
  'Chuyên viên tìm kiếm nhân tài (Talent Acquisition)',
  'Giám đốc / Founder / CEO',
  'Trưởng nhóm chuyên môn (Team Lead / Project Manager)',
  'Khác',
];

/**
 * Helper: Khớp mức lương việc làm
 */
export const matchJobBySalary = (job, salaryFilter) => {
  if (!job || !salaryFilter || salaryFilter === 'Tất cả' || salaryFilter === 'all') {
    return true;
  }
  const salary = (job.salary || '').toLowerCase();
  const sf = salaryFilter.toLowerCase();

  if (sf.includes('thỏa thuận') || sf === 'deal') {
    return salary.includes('thỏa thuận') || salary.includes('negotiable') || !salary;
  }
  if (sf.includes('dưới 10') || sf === 'under_10') {
    return salary.includes('dưới 10') || salary.includes('8') || salary.includes('7') || salary.includes('6');
  }
  if (sf.includes('10 - 15') || sf.includes('10 – 15') || sf === '10_15') {
    return salary.includes('10') || salary.includes('12') || salary.includes('15');
  }
  if (sf.includes('15 - 20') || sf.includes('15 – 25') || sf === '15_25') {
    return salary.includes('15') || salary.includes('18') || salary.includes('20');
  }
  if (sf.includes('20 - 25')) {
    return salary.includes('20') || salary.includes('22') || salary.includes('25');
  }
  if (sf.includes('trên 25') || sf.includes('25 – 50') || sf === '25_50' || sf === 'over_50') {
    return (
      salary.includes('25') ||
      salary.includes('30') ||
      salary.includes('35') ||
      salary.includes('40') ||
      salary.includes('50')
    );
  }
  return true;
};

/**
 * Helper: Khớp kinh nghiệm việc làm
 */
export const matchJobByExperience = (job, experienceFilter) => {
  if (!job || !experienceFilter || experienceFilter === 'Tất cả' || experienceFilter === 'all') {
    return true;
  }
  const exp = (job.experience || job.experienceLevel || '').toLowerCase();
  const ef = experienceFilter.toLowerCase();

  if (ef.includes('chưa có')) {
    return (
      exp.includes('không yêu cầu') ||
      exp.includes('chưa có') ||
      exp.includes('fresher') ||
      exp.includes('intern')
    );
  }
  if (ef.includes('dưới 1 năm')) {
    return exp.includes('dưới 1') || exp.includes('junior') || exp.includes('1 năm');
  }
  if (ef.includes('1 - 2 năm') || ef.includes('1 - 3 năm') || ef.includes('1 – 3 năm')) {
    return exp.includes('1') || exp.includes('2') || exp.includes('3 năm');
  }
  if (ef.includes('2 - 3 năm')) {
    return exp.includes('2') || exp.includes('3 năm');
  }
  if (ef.includes('3 - 5 năm') || ef.includes('3 – 5 năm')) {
    return exp.includes('3') || exp.includes('4') || exp.includes('5 năm');
  }
  if (ef.includes('trên 5 năm')) {
    return (
      exp.includes('5 năm') ||
      exp.includes('trưởng') ||
      exp.includes('lead') ||
      exp.includes('manager')
    );
  }
  return true;
};

// Danh sách địa điểm cho Company Search
export const COMPANY_LOCATIONS = [
  { value: 'all', label: 'Tất cả địa điểm' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Cần Thơ', label: 'Cần Thơ' },
  { value: 'Bình Dương', label: 'Bình Dương' },
  { value: 'Hải Phòng', label: 'Hải Phòng' },
  { value: 'Đồng Nai', label: 'Đồng Nai' },
  { value: 'Bắc Ninh', label: 'Bắc Ninh' },
];

// Từ khóa tìm kiếm công ty phổ biến
export const POPULAR_COMPANY_KEYWORDS = ['FPT', 'VNG', 'Shopee', 'MoMo', 'Viettel', 'Techcombank'];

// Tùy chọn sắp xếp việc làm (JobListPage)
export const JOB_SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'salary_high', label: 'Lương cao nhất' },
  { value: 'salary_low', label: 'Lương thấp nhất' },
  { value: 'deadline_near', label: 'Hạn nộp gần nhất' },
];

// Tùy chọn lọc đánh giá sao cho công ty (CompanyFilterSidebar)
export const RATING_FILTER_OPTIONS = [
  { value: 4, label: 'Từ 4.0 sao trở lên', count: 10 },
  { value: 4.5, label: 'Từ 4.5 sao trở lên', count: 7 },
];

// Danh sách kỹ năng phổ biến đề xuất (SkillsModal)
export const POPULAR_SKILLS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Tailwind CSS',
  'Redux',
  'Next.js',
  'HTML5',
  'CSS3',
  'Python',
  'Docker',
  'PostgreSQL',
  'MongoDB',
  'Git',
  'Figma',
  'Jest',
];

