import React from 'react';

export interface CatalogFilterIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * CatalogFilterIcon
 * Auto-injected from 200k+ vector collection via Nexus Icon Manager
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 */
export const CatalogFilterIcon: React.FC<CatalogFilterIconProps> = ({
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
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 3H2l8 9.46V19l4 2v-8.54z"/>
    </svg>
  );
};

export default CatalogFilterIcon;
