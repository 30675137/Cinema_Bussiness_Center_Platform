
import React from 'react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseClasses = "font-bold tracking-wide py-3 px-6 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#ff2e4d] text-white shadow-md hover:bg-[#ff1f40] dark:shadow-[0_0_15px_rgba(255,46,77,0.4)]",
    secondary: "bg-[#ffd700] text-black shadow-md hover:bg-[#e6c200] dark:shadow-[0_0_15px_rgba(255,215,0,0.4)]",
    outline: "border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900 bg-transparent dark:border-[#3a3a45] dark:text-gray-300 dark:hover:border-gray-100 dark:hover:text-white"
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
