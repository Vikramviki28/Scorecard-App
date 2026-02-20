const Logo = ({ size = 120, color = '#1e3a8a' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cricket Ball */}
      <circle cx="100" cy="100" r="80" fill={color} opacity="0.1" />

      {/* Left Stump */}
      <rect x="60" y="80" width="8" height="60" fill={color} rx="2" />

      {/* Middle Stump */}
      <rect x="96" y="80" width="8" height="60" fill={color} rx="2" />

      {/* Right Stump */}
      <rect x="132" y="80" width="8" height="60" fill={color} rx="2" />

      {/* Left Bail */}
      <rect x="60" y="76" width="44" height="4" fill={color} rx="2" />

      {/* Right Bail */}
      <rect x="96" y="76" width="44" height="4" fill={color} rx="2" />

      {/* Base */}
      <ellipse cx="100" cy="140" rx="45" ry="8" fill={color} opacity="0.3" />

      {/* Cricket Ball Seam */}
      <path
        d="M 100 30 Q 110 100 100 170"
        stroke={color}
        strokeWidth="3"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M 100 30 Q 90 100 100 170"
        stroke={color}
        strokeWidth="3"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
};

export default Logo;
