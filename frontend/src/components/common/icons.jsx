export function BellIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2.5C10.34 2.5 9 3.84 9 5.5V5.9C6.67 6.79 5 9.15 5 11.9V16.5L3 18.5V19.5H21V18.5L19 16.5V11.9C19 9.15 17.33 6.79 15 5.9V5.5C15 3.84 13.66 2.5 12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 21.5C9.5 22.6 10.62 23.5 12 23.5C13.38 23.5 14.5 22.6 14.5 21.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SearchIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="20" y1="20" x2="15.8" y2="15.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
