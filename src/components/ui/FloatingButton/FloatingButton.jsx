import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';

export const FloatingButton = ({ onClick, icon: Icon = FiCpu, label = 'AI Copilot' }) => {
  return (
    <motion.button
      className="floating-btn"
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={label}
    >
      <Icon size={24} />
    </motion.button>
  );
};
