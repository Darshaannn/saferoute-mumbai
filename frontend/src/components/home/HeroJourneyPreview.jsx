import React from 'react';
import heroImage from '../../assets/hero-journey-preview.jpg';

export default function HeroJourneyPreview() {
  return (
    <div className="relative w-full select-none">
      {/* Main Product Frame */}
      <div
        className="relative w-full overflow-hidden transition-all duration-300 group"
        style={{
          background: '#FFFFFF',
          border: '1px solid #D8D3C9',
          borderRadius: '22px',
          boxShadow: '0 18px 50px rgba(18, 59, 58, 0.08)',
        }}
      >
        <img
          src={heroImage}
          alt="SafeRoute Mumbai - Journey Intelligence Preview"
          className="w-full h-auto object-cover block"
          style={{
            borderRadius: '21px',
          }}
          loading="eager"
        />
      </div>
    </div>
  );
}
