import React from 'react';

interface MsgIconProps {
  size?: number;
}

const MsgIcon: React.FC<MsgIconProps> = ({ size = 40 }) => {
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
      {/* Outer circle */}
      <circle cx="12" cy="12" r="9" />

      {/* Message bubble */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 9.5A2.5 2.5 0 0 1 10.5 7h3A2.5 2.5 0 0 1 16 9.5v2A2.5 2.5 0 0 1 13.5 14H12l-2.5 2v-2.25A2.5 2.5 0 0 1 8 11.5v-2Z"
      />

      {/* Three dots */}
      <text
        x="12"
        y="11.8"
        textAnchor="middle"
        fontSize="4"
        fontWeight="600"
        fill="currentColor"
        stroke="none"
      >
        ...
      </text>
    </svg>
  );
};

export default MsgIcon;
