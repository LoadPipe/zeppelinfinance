import React, { ReactNode } from "react";

interface SecondaryButtonProps {
  children: string;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
}: SecondaryButtonProps) => {
  return (
    <button className="text-center text-orange-500 text-base font-semibold leading-normal px-6 py-3 bg-white rounded-xl border border-slate-300 ">
      {children}
    </button>
  );
};

export default SecondaryButton;
