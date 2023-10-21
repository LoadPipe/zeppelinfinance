import React, { PropsWithChildren } from "react";
import Image from "next/image";
import { StaticImageData } from "@/node_modules/next/image";

type RowItemProps = PropsWithChildren<{
  size?: string;
  bold?: boolean;
  color?: "black" | "red";
  className?: string;
}>;

export const RowItem: React.FC<RowItemProps> = (props) => {
  const { children, color, bold, size = "1", className } = props;

  let cssName = "flex items-center text-sm justify-center";
  if (size !== "none") {
    cssName = cssName.concat(size === "1" ? ` flex-1` : ` flex-[${size}]`);
  } else {
    cssName = cssName.concat("flex-none");
  }
  cssName = cssName.concat(color === "red" ? " text-orange-700" : "");
  cssName = cssName.concat(bold ? " font-bold" : "");

  return <div className={`${cssName} ${className}`}>{children}</div>;
};

const CardRow: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex w-full rounded-xl border border-neutral-300 border-opacity-60">
      {children}
    </div>
  );
};

export default CardRow;
