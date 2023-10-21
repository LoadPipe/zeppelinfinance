import React from "react";

import Image from "next/image";
import { StaticImageData } from "@/node_modules/next/image";
import { productsProps } from "@/Domain/productsProps";

const ListCard: React.FC<productsProps> = (props) => {
  const { image, alt, title, collection, price } = props;
  return (
    <div className="flex w-full  rounded-xl border border-neutral-300 border-opacity-60">
      <div className="flex flex-1 items-center justify-center">
        <Image src={image} alt={alt} height={64} width={64}></Image>
      </div>
      <div className="flex flex-[2] items-center font-bold text-base justify-center">
        {" "}
        {title}
      </div>
      <div className="flex flex-1 items-center text-sm justify-center">
        {collection}
      </div>
      <div className="flex flex-1 items-center text-sm justify-center">
        {price} <span>ETH</span>
      </div>
      <div className="flex flex-1 items-center justify-center text-orange-700">
        <span />
      </div>
    </div>
  );
};

export default ListCard;
