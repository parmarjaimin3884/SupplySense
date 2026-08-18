import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            className="tooltip-content"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
