import React from 'react';

export function RRCrest({ className = "w-12 h-12" }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl flex items-center justify-center ${className}`}>
      <img
        src="/rr_official_logo.jpg"
        alt="Rajasthan Royals Official Crest"
        className="w-full h-full object-cover rounded-2xl shadow-sm"
        onError={(e) => {
          // Fallback if image fails
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
}

export function StatCard({ label, value, subtext, icon: Icon, badge }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-rr-borderpink hover:shadow-md transition-all flex flex-col items-center text-center">
      <div className="flex items-center justify-center gap-1.5 text-rr-muted mb-1 w-full">
        {Icon && <Icon className="w-4 h-4 text-rr-pink" />}
        <span className="text-xs font-semibold text-rr-muted">{label}</span>
      </div>
      <div className="flex items-baseline justify-center gap-2 my-1">
        <span className="text-2xl font-semibold text-rr-blue tabular-nums">{value}</span>
        {badge && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-pink-100 text-rr-darkpink border border-rr-borderpink">
            {badge}
          </span>
        )}
      </div>
      {subtext && <div className="text-xs text-rr-muted">{subtext}</div>}
    </div>
  );
}

export function RadialGauge({ value, max = 1.0, label, subtext, size = 190 }) {
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc angle 245 degrees
  const arcFraction = 0.68;
  const arcLength = circumference * arcFraction;
  const strokeDashoffset = arcLength - (percentage * arcLength);

  // Dynamic color: green -> gold -> pink/red
  let strokeColor = "#10B981"; // green
  if (percentage > 0.45 && percentage <= 0.75) strokeColor = "#D4AF37"; // gold
  if (percentage > 0.75) strokeColor = "#EA1A85"; // crisis pink

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size * 0.75 }}>
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
          className="transform rotate-[148deg] overflow-visible"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#FCE4EC"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Centered readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2 pointer-events-none pb-2">
          <span className="text-3xl font-semibold text-rr-blue tabular-nums leading-none mb-1">
            {value.toFixed(3)}
          </span>
          <span className="text-xs font-semibold text-rr-muted leading-tight max-w-[130px]">
            {label}
          </span>
        </div>
      </div>

      {subtext && (
        <div className="text-xs text-center font-medium text-rr-muted mt-2 px-2 max-w-[200px] leading-snug">
          {subtext}
        </div>
      )}
    </div>
  );
}
