import React, { useState } from "react";
import Image from "next/image";

import favorite from "@/images/favorite.png";

interface ButtonLikeProps {
  isLiked?: boolean;
  likes?: number;
  onClick?: () => void;
}

const ButtonLike: React.FC<ButtonLikeProps> = ({
  likes = 0,
  onClick = () => {},
}) => {
  return (
    <div>
      <button className="text-center text-orange-500 text-base font-semibold leading-normal px-6 py-3 bg-white rounded-xl border border-slate-300 " onClick={onClick}>
        <Image src={favorite} alt={"icon Like"} width={20} height={20} />
        <span className="ml-1">{likes}</span>
      </button>
    </div>
  );
};

export default ButtonLike;
