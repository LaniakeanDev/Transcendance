import React from 'react';

interface LogoProps {
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ size = 120 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="120" height="120" rx="28" fill="var(--glint)" />
      <path d="M68,28 L46,60 L60,60 L52,92 L82,56 L66,56 Z" fill="#FFFFFF" />
    </svg>
  );
};

export default Logo;
