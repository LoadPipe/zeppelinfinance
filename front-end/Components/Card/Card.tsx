import React, { ReactNode } from "react";
import Image from "next/image";
import PrimaryButton from "../PrimaryButton/PrimaryButton";
import TertiaryButton from "../TertiaryButton/TertiaryButton";
import { StaticImageData } from "@/node_modules/next/image";
import ButtonLike from "../ButtonLike/ButtonLike";
import ThreeDotsButton from "../ThreeDotsButton/ThreePointsButton";

export interface CardProps {
  title: string;
  flow: string;
  image: StaticImageData;
  alt: string;
  isPreview?: boolean;
  footer?: ReactNode;
}

export interface NftDataProps {
  address: string;
  price: number;
  productName: string;
  brandName: string;
  imageUrl: string;
  numberMinted: number;
  numberForSale: number;
  policies: any[];
  instances: any[];
  alt: string;
  likes: number;
}

const Card: React.FC<CardProps> = (props) => {
  const { title, flow, image, alt, isPreview = false, footer } = props;

  return (
    <div className="max-w-[350px] p-6 w-full rounded-2xl border border-neutral-300 border-opacity-60 flex flex-col items-center">
      <div className="flex w-full flex-col">
        {isPreview ? (
          <>
            <div className="font-bold">Preview </div>
            <hr style={{ margin: "24px -24px" }} />
          </>
        ) : (
          <div className="flex justify-between mb-5">
            <TertiaryButton>Live Now</TertiaryButton>
            <ThreeDotsButton />
          </div>
        )}

        <div className="flex justify-center mb-5">
          <Image src={image} alt={alt} width={254} height={254} />
        </div>

        <div>
          <span className="text-black text-lg font-extrabold leading-7">
            {title}
          </span>
        </div>
        <div className="position: absolute; bottom:0px">{footer}</div>
      </div>
    </div>
  );
};

export interface FooterCardProps {
  likes: number;
  isLiked?: boolean;
  onClickLike?: () => void;
}

export const FooterCard: React.FC<FooterCardProps> = ({
  likes,
  isLiked,
  onClickLike,
}) => {
  return (
    <div className="flex items-center justify-between mt-6">
      <PrimaryButton> Mint now</PrimaryButton>
      <ButtonLike likes={likes} isLiked={isLiked} onClick={onClickLike} />
    </div>
  );
};

export default Card;
