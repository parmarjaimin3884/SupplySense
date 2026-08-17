import React from 'react';
import { FiSearch } from 'react-icons/fi';

export const SearchBox = ({ value, onChange, placeholder = 'Search SKUs, suppliers, orders...', className = '' }) => {
  return (
    <div className={`search-box-field ${className}`}>
      <FiSearch className="search-box-icon" size={16} />
      <input
        type="text"
        className="search-box-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
