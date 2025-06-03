
import React from 'react';

interface HeartIconProps {
  filled: boolean;
  className?: string;
  size?: number;
  onClick?: (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
}

const HeartIcon: React.FC<HeartIconProps> = ({
  filled,
  className = "",
  size = 24,
  onClick,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={`cursor-pointer transition-colors duration-150 ${className} ${filled ? 'text-red-500 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
      onClick={onClick}
      aria-hidden="true" // Decorative icon
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
};

export default HeartIcon;
