import React from 'react';

/**
 * DishaLogo - High-resolution Vectorized SVG representation of the Disha (Safe Route) logo.
 * Combines the iconic "D" silhouette, GPS navigation location pin, winding safe road/corridor with dash markings,
 * and elegant profile silhouette with vibrant pink-to-purple-to-blue neon gradients.
 */
export default function DishaLogo({ className = "w-8 h-8", size = 32 }) {
  return (
    <svg
      viewBox="0 0 500 500"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Disha (Safe Route) Logo"
    >
      <defs>
        {/* Outer Loop & Location Pin Gradient */}
        <linearGradient id="dishaPinkPurple" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFA0C5" />
          <stop offset="35%" stopColor="#F43F8E" />
          <stop offset="70%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Outer D-Curve Right Gradient */}
        <linearGradient id="dishaOuterCurve" x1="200" y1="50" x2="450" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFA8B8" />
          <stop offset="40%" stopColor="#FB7185" />
          <stop offset="75%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>

        {/* Road & Path Gradient */}
        <linearGradient id="dishaRoadGradient" x1="120" y1="200" x2="350" y2="450" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF65A3" />
          <stop offset="45%" stopColor="#E879F9" />
          <stop offset="85%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        {/* Profile Hair / Inner Silhouette Gradient */}
        <linearGradient id="dishaHairGradient" x1="180" y1="120" x2="330" y2="350" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF94B8" />
          <stop offset="50%" stopColor="#DB2777" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>

        {/* Face Silhouette Gradient */}
        <linearGradient id="dishaFaceGradient" x1="260" y1="130" x2="350" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE4E6" />
          <stop offset="60%" stopColor="#FECDD3" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>

        {/* Shadow filter for depth */}
        <filter id="dishaGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#9333ea" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Background container glow wrapper */}
      <g filter="url(#dishaGlow)">
        {/* 1. Left Vertical Stem of "D" */}
        <path
          d="M 120 180 L 120 380 Q 120 400 140 400 L 170 400 L 170 180 Z"
          fill="url(#dishaPinkPurple)"
          opacity="0.9"
        />

        {/* 2. Top-Left GPS Location Pin Head */}
        <path
          d="M 170 65 C 115 65 70 110 70 165 C 70 215 130 280 170 315 C 210 280 270 215 270 165 C 270 110 225 65 170 65 Z M 170 130 C 189.3 130 205 145.7 205 165 C 205 184.3 189.3 200 170 200 C 150.7 200 135 184.3 135 165 C 135 145.7 150.7 130 170 130 Z"
          fill="url(#dishaPinkPurple)"
        />

        {/* 3. Outer Sweeping Arch of the Letter "D" */}
        <path
          d="M 230 85 C 320 85 410 130 425 225 C 440 325 385 415 290 425 C 230 430 140 428 100 428 C 95 428 90 422 95 418 C 120 400 170 380 210 365 C 290 335 375 285 365 205 C 355 145 295 105 230 85 Z"
          fill="url(#dishaOuterCurve)"
        />

        {/* 4. Elegant Profile & Flowing Hair Silhouette */}
        {/* Hair flowing layer */}
        <path
          d="M 285 125 C 255 130 210 155 185 205 C 195 240 225 260 255 255 C 230 275 220 310 240 340 C 270 345 305 315 310 275 C 325 255 330 220 305 185 C 310 165 305 140 285 125 Z"
          fill="url(#dishaHairGradient)"
        />

        {/* Face Profile (Facing Right into the D curve) */}
        <path
          d="M 305 140 C 318 155 320 170 312 185 C 325 192 338 200 334 212 C 330 218 322 222 328 228 C 335 235 332 245 322 248 C 318 252 312 260 302 268 C 290 278 275 295 280 325 C 265 295 260 260 275 235 C 285 215 285 190 278 170 C 285 155 295 145 305 140 Z"
          fill="url(#dishaFaceGradient)"
        />

        {/* 5. Winding Road / Safe Corridor Ribbon Cutting Across Bottom */}
        <path
          d="M 95 425 C 170 425 210 395 250 340 C 290 285 270 245 200 230 C 150 220 130 240 130 265 C 130 275 145 285 160 280 C 180 275 210 285 205 315 C 200 355 150 390 95 425 Z"
          fill="url(#dishaRoadGradient)"
        />

        {/* 6. Road White Center Dash Markings */}
        <g stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeDasharray="16 18">
          <path
            d="M 145 252 Q 190 270 225 310 T 130 415"
            fill="none"
            opacity="0.95"
          />
        </g>
      </g>
    </svg>
  );
}
