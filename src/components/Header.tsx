import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#f6f7f9]/90 backdrop-blur-md px-6 py-4">
      <div className="max-w-[1240px] mx-auto flex items-center justify-between">
        {/* Left: MLH POST Brand (Logo + Name) */}
        <div className="flex items-center gap-2.5">
          <img
            src="/mani-logo.png"
            alt="MLH POST"
            className="w-7 h-7 rounded-lg object-contain"
          />
          <span className="font-bold text-[17px] tracking-tight text-[#1a1a1e]">
            MLH POST
          </span>
        </div>
      </div>
    </header>
  );
};

