import React from "react";
import Image from "next/image";
import threePoints from "@/images/threePoints.png";

interface ThreeDotsButtonProps {
  children?: string;
}

const ThreeDotsButton: React.FC<ThreeDotsButtonProps> = ({}) => {
  return (
    <div className=" ">
      <button className=" w-[18px] h-[18px] ">
        <Image src={threePoints} alt={"icon Like"} width={20} height={20} />
        {}
      </button>
    </div>
  );
};

export default ThreeDotsButton;
