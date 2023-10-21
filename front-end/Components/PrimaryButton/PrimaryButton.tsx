import React from "react";
interface PrimaryButtonsProp {
  children: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

const PrimaryButton: React.FC<PrimaryButtonsProp> = ({
  onClick,
  children,
  type = "button",
}) => {
  return (
    <button onClick={onClick} className="text-center text-white text-base/[16px] font-semibold px-6 py-3 bg-[#F26120] rounded-xl justify-center">
      {children}
    </button>
  );
};

export default PrimaryButton;
