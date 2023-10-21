import React from "react";

interface TertiaryButtonProps {
  children: string;
}

const TertiaryButton: React.FC<TertiaryButtonProps> = ({ children }) => {
  return (
    <div>
      <button className="w-[120px] font-bold h-[32px] text-orange-700 text-xs bg-[#FFEFE9] leading-[18px] rounded-3xl">
        {children}
      </button>
    </div>
  );
};

export default TertiaryButton;
