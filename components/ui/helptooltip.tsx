import React, { useState } from 'react';

interface HelpTooltipProps {
  message: string;
  className?: string;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ message, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Signo de interrogación */}
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer">
        ?
      </div>
      
      {/* Tooltip que aparece al hacer hover */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-black text-white text-xs rounded px-3 py-2 whitespace-normal max-w-xs z-50 shadow-lg">
          {message}
          {/* Triángulo decorativo */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;