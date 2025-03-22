import React from 'react';
import { motion } from 'framer-motion';

const SectionButton = ({ icon, title, isActive, score, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-50 text-blue-600 shadow-sm'
          : 'hover:bg-gray-50 text-gray-700'
      }`}
    >
      <div className="flex items-center">
        <motion.div
          className={`p-2 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}
          whileHover={{ rotate: 5 }}
        >
          {icon}
        </motion.div>
        <span className="ml-3 font-medium">{title}</span>
      </div>
      <motion.span
        className={`font-semibold ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
        whileHover={{ scale: 1.1 }}
      >
        {score}%
      </motion.span>
    </motion.button>
  );
};

export default SectionButton;
