import React from 'react';

export const Tabs = ({ tabs = [], activeTab, onChange }) => {
  return (
    <div className="tabs-header">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span style={{ marginLeft: 6, opacity: 0.7, fontSize: 12 }}>({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
};
