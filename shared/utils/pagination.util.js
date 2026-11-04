/**
 * Tiện ích chuẩn hóa Phân trang (Pagination) dùng chung cho tất cả các Microservices
 */

export const parsePagination = (query = {}, defaultLimit = 10, maxLimit = 100) => {
  const page = Math.max(1, parseInt(query.page || query.currentPage, 10) || 1);
  const limit = Math.max(1, Math.min(maxLimit, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  const take = limit;

  return {
    page,
    limit,
    skip,
    take,
  };
};

export const formatPaginationResponse = ({
  data = [],
  total = 0,
  page = 1,
  limit = 10,
  key = 'data',
}) => {
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = page;

  return {
    [key]: data,
    data,
    pagination: {
      totalItems: total,
      total,
      totalPages,
      currentPage,
      page,
      limit,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
};

export default {
  parsePagination,
  formatPaginationResponse,
};

