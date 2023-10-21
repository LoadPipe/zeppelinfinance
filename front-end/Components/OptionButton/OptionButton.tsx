import React from "react";

interface OptionButtonProps {
  text: string;
}

const OptionButton: React.FC<OptionButtonProps> = ({ text }) => {
  return (
    <button className="flex items-center text-sm justify-center w-[100px] h-[34px] rounded-[17.01px] border border-neutral-300 gap-[7px]">
      <div className="bg-[#7A52F4] w-[10px] h-[10px] rounded-[50%]"></div>
      <span className="text-xs font-bold leading-[17.01px]">{text}</span>
    </button>
  );
};

export default OptionButton;
