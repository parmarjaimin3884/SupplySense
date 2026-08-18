import React from 'react';

export const Select = ({ label, options = [], value, onChange, className = '', ...props }) => {
  return (
    <div className={`select-wrapper ${className}`}>
      {label && <label className="select-label">{label}</label>}
      <select className="select-field" value={value} onChange={onChange} {...props}>
        {options.map((opt) => (
          <option key={opt.value ?? opt.id} value={opt.value ?? opt.id} style={{ background: '#0F172A', color: '#fff' }}>
            {opt.label ?? opt.name}
          </option>
        ))}
      </select>
    </div>
  );
};
