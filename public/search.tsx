import React from 'react';

interface SearchIconProps {
  size?: number;
}

const SearchIcon: React.FC<SearchIconProps> = ({ size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="11" cy="11" r="4" />
      <path strokeLinecap="round" d="M14.5 14.5 17 17" />
    </svg>
  );
};

export default SearchIcon;
