import React from 'react';

export interface CreditCardIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * CreditCardIcon
 * Auto-injected from 200k+ vector collection via Nexus Icon Manager
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 */
export const CreditCardIcon: React.FC<CreditCardIconProps> = ({
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
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20M6 14h2"/></g>
    </svg>
  );
};

export default CreditCardIcon;
