import React from 'react';

export interface SecureLockIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * SecureLockIcon
 * Auto-injected from 200k+ vector collection via Nexus Icon Manager
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 */
export const SecureLockIcon: React.FC<SecureLockIconProps> = ({
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
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></g>
    </svg>
  );
};

export default SecureLockIcon;
