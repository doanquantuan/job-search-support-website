import React from 'react';
import { useJobStore } from '@/store/useJobStore';
import { Pagination } from '@/components/common/Pagination';

export const JobPagination = () => {
  const { currentPage, totalPages, setCurrentPage, totalCount } = useJobStore();

  if (totalPages <= 1) return null;

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalCount}
      itemName="việc làm"
      onPageChange={(page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 180, behavior: 'smooth' });
      }}
      className="mt-8"
    />
  );
};

export default JobPagination;
