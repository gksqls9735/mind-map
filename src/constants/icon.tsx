export const RadialIcon = ({ size = 40, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-colors duration-200 ${className}`}
  >
    <circle cx="12" cy="14" r="4" fill="none"></circle>

    <circle cx="12" cy="5" r="1.5" fill="currentColor"></circle>
    <circle cx="19.5" cy="20" r="1.5" fill="currentColor"></circle>
    <circle cx="4.5" cy="20" r="1.5" fill="currentColor"></circle>
    
    <line x1="12" y1="10" x2="12" y2="6.5"></line>
    <line x1="15.1" y1="16.5" x2="18.5" y2="19.2"></line>
    <line x1="8.9" y1="16.5" x2="5.5" y2="19.2"></line>
  </svg>
);