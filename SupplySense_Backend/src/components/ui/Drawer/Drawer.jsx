import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export const Drawer = ({ isOpen, onClose, title, children, width = '520px' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="drawer-panel"
            style={{ maxWidth: width }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <h3 className="drawer-title">{title}</h3>
              <button className="drawer-close-btn" onClick={onClose}>
                <FiX size={18} />
              </button>
            </div>
            <div className="drawer-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
