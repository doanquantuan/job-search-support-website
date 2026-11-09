/**
 * Query Parser (Lightweight Rule-based & Regex NLP / Query Understanding)
 *
 * Chức năng:
 * Phân tích và trích xuất các thực thể (Named Entity Extraction) từ chuỗi tìm kiếm tự nhiên của người dùng:
 * 1. Địa điểm (Province / Location)
 * 2. Cấp bậc (Job Level: Intern, Fresher, Junior, Senior, Lead, Manager...)
 * 3. Hình thức làm việc (Work Mode: Remote, Hybrid, Onsite)
 * 4. Loại hợp đồng (Employment Type: Full-time, Part-time, Internship...)
 * 5. Mức lương (Salary Range: trên 15tr, dưới 20 triệu, từ 10 đến 15tr...)
 * 6. Kinh nghiệm (Experience: không yêu cầu kinh nghiệm, 1-2 năm kn...)
 *
 * Trả về:
 * - extractedFilters: Các tiêu chí có cấu trúc để đưa vào Elasticsearch filter.
 * - cleanKeyword: Từ khóa sạch còn lại để đưa vào Full-text/Fuzzy match.
 */

// ─── 1. BỘ TỪ ĐIỂN ĐỊA DANH / TỈNH THÀNH VIỆT NAM PHỔ BIẾN ─────────────────
const PROVINCE_DICTIONARY = [
  { normalized: 'Hà Nội', patterns: [/\bhà nội\b/i, /\bha noi\b/i, /\bhnoi\b/i, /\bhn\b/i] },
  {
    normalized: 'Hồ Chí Minh',
    patterns: [
      /\bhồ chí minh\b/i,
      /\bho chi minh\b/i,
      /\btp\.?\s*hcm\b/i,
      /\btphcm\b/i,
      /\bsài gòn\b/i,
      /\bsai gon\b/i,
      /\bhcm\b/i,
      /\bsg\b/i,
    ],
  },
  { normalized: 'Đà Nẵng', patterns: [/\bđà nẵng\b/i, /\bda nang\b/i, /\bđn\b/i, /\bdn\b/i] },
  { normalized: 'Hải Phòng', patterns: [/\bhải phòng\b/i, /\bhai phong\b/i, /\bhp\b/i] },
  { normalized: 'Cần Thơ', patterns: [/\bcần thơ\b/i, /\bcan tho\b/i] },
  { normalized: 'Bình Dương', patterns: [/\bbình dương\b/i, /\bbinh duong\b/i] },
  { normalized: 'Đồng Nai', patterns: [/\bđồng nai\b/i, /\bdong nai\b/i] },
  { normalized: 'Bà Rịa - Vũng Tàu', patterns: [/\bvũng tàu\b/i, /\bvung tau\b/i, /\bbà rịa\b/i] },
  { normalized: 'Bắc Ninh', patterns: [/\bbắc ninh\b/i, /\bbac ninh\b/i] },
  { normalized: 'Quảng Nam', patterns: [/\bquảng nam\b/i, /\bquang nam\b/i] },
  { normalized: 'Huế', patterns: [/\bhuế\b/i, /\bhue\b/i, /\bthừa thiên huế\b/i] },
  { normalized: 'Khánh Hòa', patterns: [/\bnha trang\b/i, /\bkhánh hòa\b/i, /\bkhanh hoa\b/i] },
  { normalized: 'Lâm Đồng', patterns: [/\bđà lạt\b/i, /\bda lat\b/i, /\blâm đồng\b/i] },
];

// ─── 2. BỘ TỪ ĐIỂN CẤP BẬC (JOB LEVEL) ──────────────────────────────────────
const JOB_LEVEL_DICTIONARY = [
  { level: 'INTERN', patterns: [/\bthực tập sinh\b/i, /\bthuc tap sinh\b/i, /\bthực tập\b/i, /\bthuc tap\b/i, /\binternship\b/i, /\bintern\b/i] },
  { level: 'FRESHER', patterns: [/\bfresher\b/i, /\bmới tốt nghiệp\b/i, /\bmoi tot nghiep\b/i, /\bchưa có kinh nghiệm\b/i] },
  { level: 'JUNIOR', patterns: [/\bjunior\b/i, /\bnhân viên\b/i, /\bnhan vien\b/i] },
  { level: 'MIDDLE', patterns: [/\bmiddle\b/i, /\bmid\b/i] },
  { level: 'SENIOR', patterns: [/\bsenior\b/i, /\bchuyên viên cao cấp\b/i, /\bchuyen vien cao cap\b/i, /\bsr\b/i] },
  { level: 'LEAD', patterns: [/\btrưởng nhóm\b/i, /\btruong nhom\b/i, /\bteam lead\b/i, /\blead\b/i, /\bleader\b/i] },
  { level: 'MANAGER', patterns: [/\bquản lý\b/i, /\bquan ly\b/i, /\bmanager\b/i, /\btrưởng phòng\b/i, /\btruong phong\b/i] },
];

// ─── 3. BỘ TỪ ĐIỂN HÌNH THỨC LÀM VIỆC (WORK MODE) ───────────────────────────
const WORK_MODE_DICTIONARY = [
  { mode: 'REMOTE', patterns: [/\blàm từ xa\b/i, /\blam tu xa\b/i, /\btừ xa\b/i, /\btu xa\b/i, /\blàm tại nhà\b/i, /\blam tai nha\b/i, /\bremote\b/i, /\bwork from home\b/i, /\bwfh\b/i] },
  { mode: 'HYBRID', patterns: [/\bhybrid\b/i, /\blinh hoạt\b/i, /\blinh hoat\b/i] },
  { mode: 'ONSITE', patterns: [/\btại văn phòng\b/i, /\btai van phong\b/i, /\blàm trực tiếp\b/i, /\bonsite\b/i, /\bon-site\b/i] },
];

// ─── 4. BỘ TỪ ĐIỂN LOẠI HỢP ĐỒNG (EMPLOYMENT TYPE) ──────────────────────────
const EMPLOYMENT_TYPE_DICTIONARY = [
  { type: 'FULL_TIME', patterns: [/\btoàn thời gian\b/i, /\btoan thoi gian\b/i, /\bfulltime\b/i, /\bfull-time\b/i, /\bfull time\b/i] },
  { type: 'PART_TIME', patterns: [/\bbán thời gian\b/i, /\bban thoi gian\b/i, /\bparttime\b/i, /\bpart-time\b/i, /\bpart time\b/i] },
  { type: 'FREELANCE', patterns: [/\bfreelance\b/i, /\bfreelancer\b/i, /\btự do\b/i] },
];

/**
 * Trích xuất mức lương từ câu truy vấn (Ví dụ: "lương 15-20 triệu", "trên 15tr", "dưới 10tr")
 */
function extractSalary(text) {
  let minSalary = null;
  let maxSalary = null;
  let matchedStr = null;

  // Pattern 1: Khoảng lương "15 - 20 triệu", "10-15tr", "từ 10 đến 20 triệu"
  const rangeRegex = /(?:từ\s*)?(\d+(?:[.,]\d+)?)\s*(?:đến|-|tới)\s*(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|m|vnd|đ)?/i;
  // Pattern 2: "trên 15 triệu", "> 15tr", "từ 15 triệu trở lên"
  const minRegex = /(?:trên|>|>=|từ|hơn)\s*(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|m|vnd|đ)?/i;
  // Pattern 3: "dưới 20 triệu", "< 20tr", "tối đa 20 triệu"
  const maxRegex = /(?:dưới|<|<=|tối đa|dưới mức)\s*(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|m|vnd|đ)?/i;

  const textLower = text.toLowerCase();

  // Kiểm tra Range trước
  const rangeMatch = textLower.match(rangeRegex);
  if (rangeMatch && (textLower.includes('triệu') || textLower.includes('tr') || textLower.includes('m') || textLower.includes('lương'))) {
    const v1 = parseFloat(rangeMatch[1].replace(',', '.'));
    const v2 = parseFloat(rangeMatch[2].replace(',', '.'));
    if (!isNaN(v1) && !isNaN(v2) && v1 > 0 && v2 > 0) {
      minSalary = v1 * 1_000_000;
      maxSalary = v2 * 1_000_000;
      matchedStr = rangeMatch[0];
    }
  }

  // Nếu không khớp Range thì kiểm tra Min
  if (!matchedStr) {
    const minMatch = textLower.match(minRegex);
    if (minMatch && (textLower.includes('triệu') || textLower.includes('tr') || textLower.includes('m') || textLower.includes('lương'))) {
      const v = parseFloat(minMatch[1].replace(',', '.'));
      if (!isNaN(v) && v > 0) {
        minSalary = v * 1_000_000;
        matchedStr = minMatch[0];
      }
    }
  }

  // Kiểm tra Max
  if (!matchedStr) {
    const maxMatch = textLower.match(maxRegex);
    if (maxMatch && (textLower.includes('triệu') || textLower.includes('tr') || textLower.includes('m') || textLower.includes('lương'))) {
      const v = parseFloat(maxMatch[1].replace(',', '.'));
      if (!isNaN(v) && v > 0) {
        maxSalary = v * 1_000_000;
        matchedStr = maxMatch[0];
      }
    }
  }

  return { minSalary, maxSalary, matchedStr };
}

/**
 * Trích xuất số năm kinh nghiệm (Ví dụ: "không yêu cầu kinh nghiệm", "1-2 năm kinh nghiệm", "trên 3 năm kn")
 */
function extractExperience(text) {
  let experienceMin = null;
  let experienceMax = null;
  let matchedStr = null;

  const textLower = text.toLowerCase();

  // Không yêu cầu kinh nghiệm
  if (
    textLower.includes('không yêu cầu kinh nghiệm') ||
    textLower.includes('khong yeu cau kinh nghiem') ||
    textLower.includes('chưa có kn') ||
    textLower.includes('không cần kn') ||
    textLower.includes('0 kinh nghiệm')
  ) {
    return {
      experienceMin: 0,
      experienceMax: 0,
      matchedStr: textLower.match(/không yêu cầu kinh nghiệm|khong yeu cau kinh nghiem|chưa có kn|không cần kn|0 kinh nghiệm/i)?.[0] || '',
    };
  }

  // Khoảng năm: "1-2 năm kn", "từ 2 đến 4 năm kinh nghiệm"
  const rangeExp = /(\d+(?:[.,]\d+)?)\s*(?:đến|-|tới)\s*(\d+(?:[.,]\d+)?)\s*năm(?:\s*kn|\s*kinh nghiệm)?/i;
  const matchRange = textLower.match(rangeExp);
  if (matchRange) {
    experienceMin = parseFloat(matchRange[1].replace(',', '.'));
    experienceMax = parseFloat(matchRange[2].replace(',', '.'));
    matchedStr = matchRange[0];
    return { experienceMin, experienceMax, matchedStr };
  }

  // "trên 3 năm kn", "hơn 2 năm"
  const minExp = /(?:trên|>|từ|hơn)\s*(\d+(?:[.,]\d+)?)\s*năm(?:\s*kn|\s*kinh nghiệm)?/i;
  const matchMin = textLower.match(minExp);
  if (matchMin) {
    experienceMin = parseFloat(matchMin[1].replace(',', '.'));
    matchedStr = matchMin[0];
    return { experienceMin, experienceMax, matchedStr };
  }

  // "dưới 2 năm kn"
  const maxExp = /(?:dưới|<|tối đa)\s*(\d+(?:[.,]\d+)?)\s*năm(?:\s*kn|\s*kinh nghiệm)?/i;
  const matchMax = textLower.match(maxExp);
  if (matchMax) {
    experienceMax = parseFloat(matchMax[1].replace(',', '.'));
    matchedStr = matchMax[0];
    return { experienceMin, experienceMax, matchedStr };
  }

  return { experienceMin, experienceMax, matchedStr };
}

/**
 * Hàm phân tích chính: Parse chuỗi người dùng nhập và bóc tách thành các entities
 *
 * @param {string} rawQuery - Chuỗi tìm kiếm thô người dùng gõ
 * @returns {object} { cleanKeyword, extractedFilters, entities }
 */
export function parseSearchQuery(rawQuery = '') {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return {
      cleanKeyword: '',
      extractedFilters: {},
      entities: {},
    };
  }

  let text = rawQuery.trim();
  const extractedFilters = {};
  const entities = {};

  // 1. Trích xuất Địa điểm (Province)
  for (const item of PROVINCE_DICTIONARY) {
    for (const pattern of item.patterns) {
      if (pattern.test(text)) {
        extractedFilters.province = item.normalized;
        entities.province = item.normalized;
        text = text.replace(pattern, ' ');
        break;
      }
    }
    if (extractedFilters.province) break;
  }

  // 2. Trích xuất Cấp bậc (Job Level)
  for (const item of JOB_LEVEL_DICTIONARY) {
    for (const pattern of item.patterns) {
      if (pattern.test(text)) {
        extractedFilters.jobLevel = item.level;
        entities.jobLevel = item.level;
        text = text.replace(pattern, ' ');
        break;
      }
    }
    if (extractedFilters.jobLevel) break;
  }

  // 3. Trích xuất Hình thức làm việc (Work Mode)
  for (const item of WORK_MODE_DICTIONARY) {
    for (const pattern of item.patterns) {
      if (pattern.test(text)) {
        extractedFilters.workMode = item.mode;
        entities.workMode = item.mode;
        text = text.replace(pattern, ' ');
        break;
      }
    }
    if (extractedFilters.workMode) break;
  }

  // 4. Trích xuất Loại hợp đồng (Employment Type)
  for (const item of EMPLOYMENT_TYPE_DICTIONARY) {
    for (const pattern of item.patterns) {
      if (pattern.test(text)) {
        extractedFilters.employmentType = item.type;
        entities.employmentType = item.type;
        text = text.replace(pattern, ' ');
        break;
      }
    }
    if (extractedFilters.employmentType) break;
  }

  // 5. Trích xuất Mức lương (Salary)
  const salaryInfo = extractSalary(text);
  if (salaryInfo.matchedStr) {
    extractedFilters.salaryType = 'RANGE';
    if (salaryInfo.minSalary != null) extractedFilters.minSalary = salaryInfo.minSalary;
    if (salaryInfo.maxSalary != null) extractedFilters.maxSalary = salaryInfo.maxSalary;
    entities.salary = { min: salaryInfo.minSalary, max: salaryInfo.maxSalary };
    text = text.replace(salaryInfo.matchedStr, ' ');
    // Xóa từ 'lương' thừa nếu còn
    text = text.replace(/\blương\b|\bluong\b/gi, ' ');
  }

  // 6. Trích xuất Kinh nghiệm (Experience)
  const expInfo = extractExperience(text);
  if (expInfo.matchedStr) {
    if (expInfo.experienceMin != null) extractedFilters.experienceMin = expInfo.experienceMin;
    if (expInfo.experienceMax != null) extractedFilters.experienceMax = expInfo.experienceMax;
    entities.experience = { min: expInfo.experienceMin, max: expInfo.experienceMax };
    text = text.replace(expInfo.matchedStr, ' ');
    // Xóa từ 'kinh nghiệm' / 'kn' thừa
    text = text.replace(/\bkinh nghiệm\b|\bkn\b/gi, ' ');
  }

  // 7. Làm sạch các từ nối và khoảng trắng dư thừa
  let cleanKeyword = text
    .replace(/\b(ở|tại|o|tai|cho|việc làm|tuyển dụng|tuyen dung|viec lam|cần tìm|tìm việc)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    cleanKeyword,
    extractedFilters,
    entities,
  };
}

export default parseSearchQuery;
