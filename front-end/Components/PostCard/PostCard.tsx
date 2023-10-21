import React from "react";
import Image from "next/image";
import { StaticImageData } from "@/node_modules/next/image";
import ButtonLike from "../ButtonLike/ButtonLike";
import Wallet from "@/Web3/Wallet";
import { useRef, useEffect, useState } from "react";
import PrimaryButton from "../PrimaryButton/PrimaryButton";
import SecondaryButton from "../SecondaryButton/SecondaryButton";

export interface PostCardProps {
  title: string;
  image: StaticImageData;
  userName: string;
  avatar: StaticImageData;
  nftAddress: string;
  amountOwed: number;
}

const PostCard: React.FC<PostCardProps> = ({
  title,
  image,
  userName,
  avatar,
  nftAddress,
  amountOwed
}: PostCardProps) => {
  interface WalletRefType {
    collectRoyalties: (nftAddress: string, tokenId: number) => Promise<any>;
  }
  const walletRef = useRef<WalletRefType | null>(null);
  
  //TODO: test the claim functionality 
  const claim = async () => {
    if(walletRef.current){
      console.log("claim", nftAddress);
      const tx = await walletRef.current.collectRoyalties(nftAddress, 1);
      if (tx) {
        console.log('Transaction hash:', tx.hash);
        const rc = await tx.wait();
        console.log('Transaction hash:', tx.hash);
      }
    }
  };
  
  return (
    <div className="max-w-[302px] max-h-[471px] flex flex-col">
      <Wallet ref={walletRef}/>
      <div>
        <Image
          className="rounded-[14px]"
          src={image}
          alt="User Post"
          width={302}
          height={362}
        />
        <span className="text-black text-lg font-extrabold">{title}</span>
      </div>
      <div className="flex justify-between mt-[92px]">
        <div className="flex items-center">
          <Image
            className="rounded-full"
            src={avatar}
            alt="User Post"
            width={32}
            height={32}
          />
          <span className="text-sm font-normal px-[10px]">{userName}</span>
        </div>
        <ButtonLike></ButtonLike>
      </div>
      <br />
      {amountOwed && <button className="text-center text-orange-500 text-base font-semibold leading-normal px-6 py-3 bg-white rounded-xl border border-slate-300" onClick={() => claim()}>claim {amountOwed} ETH</button>}
      <br />
      <SecondaryButton>sell</SecondaryButton>
      <br />
      <SecondaryButton>view stats</SecondaryButton>
      <br />
    </div>
  );
};

export default PostCard;
