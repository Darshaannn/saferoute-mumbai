import React from 'react';
import heroImage from '../../assets/hero-journey-preview.jpg';

export default function HeroJourneyPreview() {
  return (
    <div className="relative w-full max-w-[620px] mx-auto select-none">
      {/* Main Product Frame */}
      <div
        className="relative w-full overflow-hidden transition-all duration-300 rounded-[16px] sm:rounded-[22px] border border-[#D8D3C9]"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 12px 36px rgba(18, 59, 58, 0.08)',
        }}
      >
        <img
          src={heroImage}
          alt="SafeRoute Mumbai - Journey Intelligence Preview"
          className="w-full h-auto object-cover block rounded-[15px] sm:rounded-[21px]"
          loading="eager"
        />
      </div>
    </div>
  );
}
