"use client";
import Input from "@/Components/Input/Input";
import Wallet from "@/Web3/Wallet";
import { useState, useRef } from "react";
import Heading from "../Heading/Heading";
import MessageOverlay from "@/Components/MessageOverlay/MessageOverlay";
import ProgressOverlay from "@/Components/ProgressOverlay/ProgressOverlay";

export const PostToStore = (props: { onPosted: any, nftAddress: string }) => {
  interface WalletRefType {
    postToStore: (nftAddress: string, price: number) => Promise<any>;
    postForSale: (nftAddress: string) => Promise<any>;
  }
  const walletRef = useRef<WalletRefType | null>(null);
  const [price, setPrice] = useState(0);
  const [messageText, setMessageText] = useState("");
  const [progressVisible, setProgressVisible] = useState(false);

  const { onPosted, nftAddress } = props;

  const post = async (price: number) => {
    if (walletRef && walletRef.current && price > 0) {
      setProgressVisible(true);

      const tx1 = await walletRef.current.postToStore(nftAddress, price);

      if (tx1) {
        const rc = await tx1.wait();
        console.log('Transaction hash:', tx1.hash);
        setMessageText("Transaction hash:: " + tx1.hash)
        
        const tx2 = await walletRef.current.postForSale(nftAddress);
        if (tx2) {
          const rc = await tx2.wait();
          console.log('Transaction hash:', tx2.hash);
          setMessageText("Transaction hash:: " + tx2.hash)
          return true;
        }
      }
    }
    setProgressVisible(false);
  };

  const handleSubmit = async () => {
    if (await post(price)) {
      onPosted(true);
    }
  };

  return (
    <div>
      <Heading text="Step 4: Post to the Store"></Heading>
      <div className="flex max-w-[687px] w-full gap-x-2">
        <Wallet ref={walletRef} />
        <div className="flex-1">
          <Input
            label="Set item price in ETH"
            id="item"
            name="item"
            type="text"
            placeholder="e.g. 0.01"
            onChange={(event) => setPrice(parseInt(event.target.value)) }
          />
      </div>
      </div>
      <button className="text-center text-orange-500 text-base font-semibold leading-normal px-6 py-3 bg-white rounded-xl border border-slate-300 " onClick={() => handleSubmit()}>Next</button>
      <MessageOverlay text={messageText}></MessageOverlay>
      <ProgressOverlay visible={progressVisible}></ProgressOverlay>
    </div>
  );
}
