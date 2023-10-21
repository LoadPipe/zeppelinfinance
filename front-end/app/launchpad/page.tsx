"use client";
import Card, { FooterCard } from "@/Components/Card/Card";
import { cardsData } from "@/Domain/cards.data";
import { products } from "@/Domain/products";
import CardRow, { RowItem } from "@/Components/CardRow/CardRow";
import RowLayout from "@/Components/RowLayout/RowLayout";
import Heading from "@/Components/Heading/Heading";
import Wallet from "@/Web3/Wallet"; 
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { ethers } from "ethers";
import MessageOverlay from "@/Components/MessageOverlay/MessageOverlay";
import ProgressOverlay from "@/Components/ProgressOverlay/ProgressOverlay";

import imgFlask from "@/images/flask.png";
import imgCloth from "@/images/cloth.png";
import imgShotglass from "@/images/shotglass.png";
import imgPourers from "@/images/pourer.png";
import imgShelfMat from "@/images/shelfmat.png";
import imgCondiment from "@/images/condiment.png";
import placeholderImage from "@/images/imgCollection3.png";

//TODO: get chain dynamically

export default function Home() {
  interface WalletRefType {
    getNextAvailableTokenId: (nftAddress: string) => Promise<number>;
    purchaseNft: (nftAddress: string, tokenId: number) => Promise<any>;
    getNftsForSale: () => Promise<any[]>;
  }
  
  const walletRef = useRef<WalletRefType | null>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [progressVisible, setProgressVisible] = useState(false);

  const onClickLike = () => {
  };
  
  const convertNfts = (nftArray: any[]) => {
    let output: any[] = []; 
    if (nftArray) {
      nftArray.forEach((nft, i) => {
        try { output.push(convertNft(nft, i)); }
        catch {}
      }); 
    }
    
    output = output.concat(products);
    for(let n=0; n<output.length; n++) {
      output[n].index = n;
    }
    return output;
  }; 

  const convertImageUrl = (nft: any) => {
    if (nft.productName.toLowerCase().indexOf("flask") >= 0)
      return imgFlask;
    if (nft.productName.toLowerCase().indexOf("cloth") >= 0)
      return imgCloth;
    if (nft.productName.toLowerCase().indexOf("pourer") >= 0)
      return imgPourers;
    if (nft.productName.toLowerCase().indexOf("shot glass") >= 0)
      return imgShotglass;
    if (nft.productName.toLowerCase().indexOf("shelf mat") >= 0)
      return imgShelfMat;
    if (nft.productName.toLowerCase().indexOf("condiment") >= 0)
      return imgCondiment;

    return placeholderImage;
  }
  
  const getRoyalty = (nft: any) => {
    if (nft.policies) {
      for (let a in nft.policies) {
        if (nft.policies[a].policyType === "FinancingRewardPolicy") {
          return parseInt(nft.policies[a].percentageBps) / 100; 
        }
      }
    }
    return 0;
  }

  const getAffiliate = (nft: any) => {
    if (nft.policies) {
      for (let a in nft.policies) {
        if (nft.policies[a].policyType === "AffiliateRewardPolicy") {
          return parseInt(nft.policies[a].percentageBps) / 100;
        }
      }
    }
    return 0;
  }
  
  const convertNft = (nft: any, index: number) => {
    const output = {
      image: convertImageUrl(nft), 
      alt: "product logo", 
      index: index+1, 
      title: nft.productName, 
      price: ethers.utils.formatEther(parseInt(nft.price)).replace("0.00000000000", "0."),
      royalty: getRoyalty(nft), 
      affiliate: getAffiliate(nft), 
      bonus: "No", 
      payout: 0, 
      amount: `${nft.instances.length}/${nft.totalMinted}`,
      address: nft.address, 
      numberAvailable: nft.instances.length
    }; 
    return output; 
  }; 
  
  //TODO: don't allow owner to buy their own supply
  const buy = async (nftAddress: string) => {
    if (walletRef.current) {
      setProgressVisible(true);
      const tokenId = await walletRef.current.getNextAvailableTokenId(nftAddress);
      if (tokenId > 0) {
        const tx = await walletRef.current.purchaseNft(nftAddress, tokenId);
        if (tx) {
          const rc = await tx.wait();
          console.log('Transaction hash:', tx.hash);
          setMessageText("Transaction hash: " + tx.hash);
          getNfts();
        }
      }
      setProgressVisible(false);
    }
  }

  const getNfts = async () => {
    if (walletRef && walletRef.current) {
      const nftArray: any[] = convertNfts(await walletRef.current.getNftsForSale());
      console.log(nftArray);
      setNfts(nftArray);
    }
  };
  
  useEffect(() => {
    getNfts();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Wallet ref={walletRef}></Wallet>
      <RowLayout fit>
        <Heading text="Feature Newly Created Collections" />
        <div className="flex justify-between w-full gap-1.5 my-20">
          {cardsData.map(
            (
              { alt, title, flow: description, image, likes, isLiked },
              index
            ) => (
              <Card
                key={index}
                flow={description}
                title={title}
                alt={alt}
                image={image}
                footer={
                  <FooterCard
                    onClickLike={onClickLike}
                    likes={likes}
                    isLiked={isLiked}
                  />
                }
              />
            )
          )}
        </div>
        <div>
          <div className="flex text-black text-sm font-bold leading-[21px] mb-4">
            <div className="flex items-center flex-[3]">
              <p>All Launchpad Collections</p>
            </div>
            <div className="flex items-center justify-center flex-1">
              <p>Mint Price</p>
            </div>
            <div className="flex items-center justify-center flex-1">
              <p>Royalty</p>
            </div>
            <div className="flex items-center justify-centerflex-1">
              <p>Affiliate %</p>
            </div>
            <div className="flex items-center justify-center flex-1">
              <p>Amount</p>
            </div>
            <div className="flex items-center justify-center flex-1">
              <p>Mint</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 mb-16">
            {nfts && nfts.map((nft: any) => (
              <CardRow key={nft.index}>
                <RowItem size="none" className="ml-5">
                  {nft.index}
                </RowItem>
                <RowItem>
                  <Image
                    src={nft.image}
                    alt={nft.alt}
                    height={64}
                    width={64}
                  />
                </RowItem>
                <RowItem size="2" bold>
                  {nft.title}
                </RowItem>
                <RowItem bold>{nft.price} ETH</RowItem>
                <RowItem color="red" bold>
                  {nft.royalty}%
                </RowItem>
                <RowItem color="red" bold>
                  {nft.affiliate}%
                </RowItem>
                <RowItem color="red" bold>
                  {nft.amount}
                </RowItem>
                <RowItem><button className="text-center text-orange-500 text-base font-semibold leading-normal px-6 py-3 bg-white rounded-xl border border-slate-300 " onClick={() => buy(nft.address)}>mint</button></RowItem>
              </CardRow>
            ))}
          </div>
        </div>
      </RowLayout>
      <MessageOverlay text={messageText}></MessageOverlay>
      <ProgressOverlay visible={progressVisible}></ProgressOverlay>
    </main>
  );
}
