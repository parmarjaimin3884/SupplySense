import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export const StatCard = ({ title, value, change, isPositive = true, icon: Icon, color = 'blue' }) => {
  return (
    <motion.div
      className="stat-card"
      whileHover={{ y: -3 }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="stat-card-top">
        <span className="stat-label">{title}</span>
        {Icon && (
          <div className="stat-icon-wrapper">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div className="stat-value">{value}</div>
        {change && (
          <span className={`stat-change-tag ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
            {change}
          </span>
        )}
      </div>
    </motion.div>
  );
};
