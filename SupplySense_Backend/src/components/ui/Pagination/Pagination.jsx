import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const Pagination = ({ currentPage = 1, totalPages = 1, totalItems = 0, onPageChange }) => {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination-bar">
      <span>
        Showing Page <strong style={{ color: '#fff' }}>{currentPage}</strong> of <strong style={{ color: '#fff' }}>{totalPages}</strong> ({totalItems} total records)
      </span>
      <div className="pagination-controls">
        <button
          className="page-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <FiChevronLeft size={16} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            className={`page-btn ${currentPage === p ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          className="page-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
