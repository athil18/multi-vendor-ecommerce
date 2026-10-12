import React from 'react';

export interface SearchIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * SearchIcon
 * Auto-injected from 200k+ vector collection via Nexus Icon Manager
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 */
export const SearchIcon: React.FC<SearchIconProps> = ({
  size = 24,
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="m21 21l-4.34-4.34"/><circle cx="11" cy="11" r="8"/></g>
    </svg>
  );
};

export default SearchIcon;
