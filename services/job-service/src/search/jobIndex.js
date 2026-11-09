import esClient from '../config/elasticsearch.js';
import config from '../config/env.config.js';
import jobSynonyms from '../config/synonyms.js';


const INDEX = config.ELASTICSEARCH_INDEX;


// ─── Mapping & Settings ──────────────────────────────────────────────────────
const INDEX_SETTINGS = {
  settings: {
    analysis: {
      filter: {
        job_synonyms_filter: {
          type: 'synonym_graph',
          synonyms: jobSynonyms,
        },
        // Edge n-gram filter cho autocomplete (2 -> 20 ký tự)
        autocomplete_filter: {
          type: 'edge_ngram',
          min_gram: 2,
          max_gram: 20,
        },
      },
      analyzer: {
        // 1. Analyzer khi lưu dữ liệu (Index Analyzer)
        vietnamese_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding'],
        },
        // 2. Analyzer khi truy vấn tìm kiếm (Search Analyzer)
        vietnamese_search_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: [
            'lowercase',
            'asciifolding',
            'job_synonyms_filter',
          ],
        },
        // 3. Analyzer tạo ngram cho Autocomplete
        autocomplete_index_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding', 'autocomplete_filter'],
        },
        // 4. Analyzer search khi Autocomplete (chỉ lowercase + fold, không cắt gram)
        autocomplete_search_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding'],
        },
      },
    },
  },
  mappings: {
    properties: {
      jobId: { type: 'keyword' },
      userId: { type: 'keyword' },
      companyId: { type: 'keyword' },

      // Trường completion suggester chuyên dụng cho Autocomplete siêu tốc
      suggest: {
        type: 'completion',
        analyzer: 'autocomplete_search_analyzer',
      },

      // ── Text fields (Full-text search với boosting) ──────────────────────
      title: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
        search_analyzer: 'vietnamese_search_analyzer',
        fields: {
          keyword: { type: 'keyword', ignore_above: 512 },
          // Field phục vụ gợi ý autocomplete khi gõ từng từ
          autocomplete: {
            type: 'text',
            analyzer: 'autocomplete_index_analyzer',
            search_analyzer: 'autocomplete_search_analyzer',
          },
        },
      },
      description: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
        search_analyzer: 'vietnamese_search_analyzer',
      },
      requirements: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
        search_analyzer: 'vietnamese_search_analyzer',
      },
      benefits: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
        search_analyzer: 'vietnamese_search_analyzer',
      },
      companyName: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
        search_analyzer: 'vietnamese_search_analyzer',
        fields: {
          keyword: { type: 'keyword', ignore_above: 256 },
          autocomplete: {
            type: 'text',
            analyzer: 'autocomplete_index_analyzer',
            search_analyzer: 'autocomplete_search_analyzer',
          },
        },
      },
      specializationNames: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
        search_analyzer: 'vietnamese_search_analyzer',
        fields: {
          keyword: { type: 'keyword', ignore_above: 256 },
          autocomplete: {
            type: 'text',
            analyzer: 'autocomplete_index_analyzer',
            search_analyzer: 'autocomplete_search_analyzer',
          },
        },
      },
      occupationNames: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
        search_analyzer: 'vietnamese_search_analyzer',
      },

      // ── Keyword fields (Exact filter) ────────────────────────────────────
      province: { type: 'keyword' },
      address: { type: 'keyword' },
      workingHours: { type: 'keyword' },
      salaryType: { type: 'keyword' },
      jobLevel: { type: 'keyword' },
      educationLevel: { type: 'keyword' },
      workMode: { type: 'keyword' },
      employmentType: { type: 'keyword' },
      status: { type: 'keyword' },

      // ── IDs cho filter chính xác ─────────────────────────────────────────
      specializationIds: { type: 'keyword' },
      occupationIds: { type: 'keyword' },

      // ── Numeric fields ───────────────────────────────────────────────────
      salaryMin: { type: 'float' },
      salaryMax: { type: 'float' },
      experienceMin: { type: 'float' },
      experienceMax: { type: 'float' },
      vacancies: { type: 'integer' },

      // ── Date fields ──────────────────────────────────────────────────────
      publishedAt: { type: 'date' },
      deadline: { type: 'date' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    },
  },
};

// ─── Index Management ─────────────────────────────────────────────────────────

/**
 * Tạo index "jobs" nếu chưa tồn tại với mapping & analyzer tùy chỉnh.
 */
export async function ensureIndex() {
  try {
    const exists = await esClient.indices.exists({ index: INDEX });
    if (exists) {
      console.log(`[Elasticsearch] Index "${INDEX}" đã tồn tại.`);
      return;
    }
    await esClient.indices.create({
      index: INDEX,
      ...INDEX_SETTINGS,
    });
    console.log(`[Elasticsearch] ✅ Đã tạo index "${INDEX}" với custom analyzer & autocomplete.`);
  } catch (err) {
    console.error(`[Elasticsearch] ❌ Lỗi tạo index "${INDEX}":`, err.message);
    throw err;
  }
}

// ─── Document Mapper ──────────────────────────────────────────────────────────

/**
 * Chuyển đổi Job Post từ Prisma format sang Elasticsearch document.
 * @param {object} job - Job post object từ Prisma (có include specializations).
 * @param {object|null} companyInfo - Thông tin công ty từ company-service.
 * @returns {object} Elasticsearch document
 */
export function mapJobToESDocument(job, companyInfo = null) {
  const specializationNames = [];
  const specializationIds = [];
  const occupationNames = [];
  const occupationIds = [];

  if (Array.isArray(job.jobPostSpecializations)) {
    for (const jps of job.jobPostSpecializations) {
      const spec = jps.specialization;
      if (spec) {
        specializationIds.push(spec.specializationId);
        specializationNames.push(spec.specializationName);
        if (spec.occupation) {
          occupationIds.push(spec.occupation.occupationId);
          occupationNames.push(spec.occupation.occupationName);
        }
      }
    }
  }

  const compName = companyInfo?.companyName || companyInfo?.name || '';
  const specNames = [...new Set(specializationNames)];

  // Xây dựng các cụm từ gợi ý completion (input cho Completion Suggester)
  const suggestInputs = [job.title, compName, ...specNames].filter((str) => str && str.trim().length > 0);

  return {
    jobId: job.jobId,
    userId: job.userId,
    companyId: job.companyId,

    // Completion suggester
    suggest: {
      input: suggestInputs,
      weight: job.status === 'PUBLISHED' ? 10 : 1,
    },

    // Text fields
    title: job.title || '',
    description: job.description || '',
    requirements: job.requirements || '',
    benefits: job.benefits || '',
    companyName: compName,

    // Specialization & Occupation
    specializationIds: [...new Set(specializationIds)],
    specializationNames: specNames.join(' '),
    occupationIds: [...new Set(occupationIds)],
    occupationNames: [...new Set(occupationNames)].join(' '),

    // Keyword fields
    province: job.province || '',
    address: job.address || '',
    workingHours: job.workingHours || '',
    salaryType: job.salaryType,
    jobLevel: job.jobLevel,
    educationLevel: job.educationLevel,
    workMode: job.workMode,
    employmentType: job.employmentType,
    status: job.status,

    // Numeric fields
    salaryMin: job.salaryMin != null ? parseFloat(job.salaryMin) : null,
    salaryMax: job.salaryMax != null ? parseFloat(job.salaryMax) : null,
    experienceMin: job.experienceMin != null ? parseFloat(job.experienceMin) : null,
    experienceMax: job.experienceMax != null ? parseFloat(job.experienceMax) : null,
    vacancies: job.vacancies ?? null,

    // Date fields
    publishedAt: job.publishedAt ? new Date(job.publishedAt).toISOString() : null,
    deadline: job.deadline ? new Date(job.deadline).toISOString() : null,
    createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : null,
    updatedAt: job.updatedAt ? new Date(job.updatedAt).toISOString() : null,
  };
}

// ─── CRUD Operations ──────────────────────────────────────────────────────────

export async function indexJob(job, companyInfo = null) {
  try {
    const doc = mapJobToESDocument(job, companyInfo);
    await esClient.index({
      index: INDEX,
      id: job.jobId,
      document: doc,
    });
    console.log(`[Elasticsearch] ✅ Đã index job: ${job.jobId}`);
  } catch (err) {
    console.error(`[Elasticsearch] ❌ Lỗi index job ${job.jobId}:`, err.message);
  }
}

export async function updateJobInES(jobId, fields) {
  try {
    await esClient.update({
      index: INDEX,
      id: jobId,
      doc: fields,
      doc_as_upsert: true,
    });
    console.log(`[Elasticsearch] ✅ Đã update job: ${jobId}`);
  } catch (err) {
    console.error(`[Elasticsearch] ❌ Lỗi update job ${jobId}:`, err.message);
  }
}

export async function deleteJobFromES(jobId) {
  try {
    await esClient.delete({ index: INDEX, id: jobId });
    console.log(`[Elasticsearch] ✅ Đã xóa job: ${jobId}`);
  } catch (err) {
    if (err?.meta?.statusCode !== 404) {
      console.error(`[Elasticsearch] ❌ Lỗi xóa job ${jobId}:`, err.message);
    }
  }
}

export async function bulkIndexJobs(items) {
  if (!items || items.length === 0) return { success: 0, errors: 0 };

  const operations = items.flatMap(({ job, companyInfo }) => [
    { index: { _index: INDEX, _id: job.jobId } },
    mapJobToESDocument(job, companyInfo),
  ]);

  try {
    const response = await esClient.bulk({
      operations,
      refresh: true,
    });
    const errors = response.items?.filter((i) => i.index?.error).length ?? 0;
    const success = items.length - errors;
    console.log(`[Elasticsearch] Bulk index: ${success} thành công, ${errors} lỗi.`);
    return { success, errors };
  } catch (err) {
    console.error('[Elasticsearch] ❌ Lỗi bulk index:', err.message);
    return { success: 0, errors: items.length };
  }
}

// ─── Autocomplete Function ───────────────────────────────────────────────────

/**
 * Gợi ý tìm kiếm (Autocomplete) siêu tốc khi người dùng đang gõ từ khóa.
 * Kết hợp Completion Suggester (ưu tiên cao) và Edge N-gram search.
 *
 * @param {string} prefix - Từ khóa người dùng đang gõ (vd: "reac", "lap trin")
 * @param {number} limit - Số lượng gợi ý trả về (mặc định 10)
 * @returns {Promise<Array<{text: string, type: string, jobId?: string}>>}
 */
export async function autocompleteJobsInES(prefix, limit = 10) {
  if (!prefix || !prefix.trim()) return [];
  const cleanPrefix = prefix.trim();

  try {
    // Truy vấn kết hợp cả completion suggester lẫn multi_match trên các field .autocomplete
    const response = await esClient.search({
      index: INDEX,
      suggest: {
        job_suggest: {
          prefix: cleanPrefix,
          completion: {
            field: 'suggest',
            size: limit,
            skip_duplicates: true,
            fuzzy: {
              fuzziness: 'AUTO',
            },
          },
        },
      },
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: cleanPrefix,
                fields: [
                  'title.autocomplete^4',
                  'specializationNames.autocomplete^3',
                  'companyName.autocomplete^2',
                ],
                type: 'bool_prefix',
              },
            },
          ],
          filter: [{ term: { status: 'PUBLISHED' } }],
        },
      },
      size: limit,
      _source: ['jobId', 'title', 'companyName', 'specializationNames'],
    });

    const suggestions = [];
    const seenTexts = new Set();

    // 1. Lấy kết quả từ Completion Suggester (chính xác & độ trễ thấp nhất)
    const completionOptions = response.suggest?.job_suggest?.[0]?.options || [];
    for (const opt of completionOptions) {
      const text = opt.text;
      if (!seenTexts.has(text.toLowerCase())) {
        seenTexts.add(text.toLowerCase());
        suggestions.push({
          text,
          type: 'completion',
          score: opt._score,
        });
      }
    }

    // 2. Bổ sung từ Search Hits (gợi ý theo Title hoặc Company của job cụ thể)
    const hits = response.hits?.hits || [];
    for (const hit of hits) {
      const { jobId, title, companyName } = hit._source || {};
      if (title && !seenTexts.has(title.toLowerCase())) {
        seenTexts.add(title.toLowerCase());
        suggestions.push({
          text: title,
          type: 'job_title',
          jobId,
          companyName,
          score: hit._score,
        });
      }
      if (suggestions.length >= limit) break;
    }

    return suggestions.slice(0, limit);
  } catch (err) {
    console.error('[Elasticsearch] ❌ Lỗi Autocomplete:', err.message);
    return [];
  }
}

// ─── Search Query ─────────────────────────────────────────────────────────────

export async function searchJobsInES(params) {
  const {
    keyword,
    province,
    salaryType,
    minSalary,
    maxSalary,
    experienceMin,
    experienceMax,
    jobLevel,
    educationLevel,
    workMode,
    employmentType,
    status = 'PUBLISHED',
    companyId,
    occupationId,
    specializationId,
    specializationIds,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = params;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const size = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const from = (pageNum - 1) * size;

  const must = [];
  const filter = [];

  // 1. Full-text search với Fuzzy & Synonyms (nếu có keyword)
  if (keyword && keyword.trim()) {
    const trimmed = keyword.trim();
    must.push({
      multi_match: {
        query: trimmed,
        type: 'best_fields',
        fields: [
          'title^4',
          'specializationNames^3',
          'companyName^2',
          'occupationNames^2',
          'requirements^1.5',
          'description^1',
          'benefits^1',
        ],
        fuzziness: 'AUTO',
        prefix_length: 1,
        max_expansions: 50,
        tie_breaker: 0.3,
      },
    });
  }

  // 2. Exact filters
  if (status) filter.push({ term: { status } });
  if (province) filter.push({ term: { province } });
  if (companyId) filter.push({ term: { companyId } });
  if (salaryType) filter.push({ term: { salaryType } });
  if (jobLevel) filter.push({ term: { jobLevel } });
  if (educationLevel) filter.push({ term: { educationLevel } });
  if (workMode) filter.push({ term: { workMode } });
  if (employmentType) filter.push({ term: { employmentType } });

  // 3. Filter theo Specialization
  if (specializationId) {
    filter.push({ term: { specializationIds: specializationId } });
  } else if (specializationIds) {
    const idList = Array.isArray(specializationIds)
      ? specializationIds
      : specializationIds.split(',').map((id) => id.trim());
    filter.push({ terms: { specializationIds: idList } });
  }

  // 4. Filter theo Occupation
  if (occupationId) {
    filter.push({ term: { occupationIds: occupationId } });
  }

  // 5. Salary range filter
  if (salaryType === 'RANGE') {
    const minVal = minSalary != null && minSalary !== '' ? parseFloat(minSalary) : null;
    const maxVal = maxSalary != null && maxSalary !== '' ? parseFloat(maxSalary) : null;

    if (minVal !== null) {
      filter.push({ range: { salaryMax: { gte: minVal } } });
    }
    if (maxVal !== null) {
      filter.push({ range: { salaryMin: { lte: maxVal } } });
    }
  }

  // 6. Experience range filter
  if (experienceMin != null && experienceMin !== '') {
    filter.push({
      bool: {
        should: [
          { bool: { must_not: [{ exists: { field: 'experienceMax' } }] } },
          { range: { experienceMax: { gte: parseFloat(experienceMin) } } },
        ],
        minimum_should_match: 1,
      },
    });
  }
  if (experienceMax != null && experienceMax !== '') {
    filter.push({
      bool: {
        should: [
          { bool: { must_not: [{ exists: { field: 'experienceMin' } }] } },
          { range: { experienceMin: { lte: parseFloat(experienceMax) } } },
        ],
        minimum_should_match: 1,
      },
    });
  }

  // ── Sắp xếp ──────────────────────────────────────────────────────────────
  const allowedSortFields = {
    createdAt: 'createdAt',
    publishedAt: 'publishedAt',
    salaryMax: 'salaryMax',
    deadline: 'deadline',
  };
  const esSortField = allowedSortFields[sortBy] ?? 'createdAt';
  const esSortOrder = ['asc', 'desc'].includes(sortOrder?.toLowerCase())
    ? sortOrder.toLowerCase()
    : 'desc';

  const sort = keyword && keyword.trim()
    ? [{ _score: { order: 'desc' } }, { [esSortField]: { order: esSortOrder } }]
    : [{ [esSortField]: { order: esSortOrder } }];

  let query;
  if (must.length > 0) {
    query = {
      bool: {
        must,
        filter,
      },
    };
  } else if (filter.length > 0) {
    query = {
      bool: {
        filter,
      },
    };
  } else {
    query = {
      match_all: {},
    };
  }

  try {
    const response = await esClient.search({
      index: INDEX,
      query,
      sort,
      from,
      size,
      track_total_hits: true,
      _source: true,
    });

    const total =
      typeof response.hits.total === 'number'
        ? response.hits.total
        : response.hits.total?.value ?? 0;

    const hits = response.hits.hits.map((hit) => ({
      ...hit._source,
      _score: hit._score,
    }));

    return { hits, total };
  } catch (err) {
    console.error('[Elasticsearch] ❌ Lỗi tìm kiếm:', err.message);
    throw err;
  }
}
