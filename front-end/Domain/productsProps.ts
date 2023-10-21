import { StaticImageData } from "@/node_modules/next/image";
export interface productsProps {
    image: StaticImageData;
    alt: string;
    title: string;
    collection?: string;
    price: number;
    royalty?: number;
    affiliate?: number;
    bonus?: string;
    payout?: number;
    amount?: string;
    index?: number;
  }