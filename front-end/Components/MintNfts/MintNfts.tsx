"use client";
import Wallet from "@/Web3/Wallet";
import { useState, useRef } from "react";
import Select from "@/Components/Select/Select";
import Heading from "../Heading/Heading";
import MessageOverlay from "@/Components/MessageOverlay/MessageOverlay";
import ProgressOverlay from "@/Components/ProgressOverlay/ProgressOverlay";
import { ethers } from "ethers";

export const MintNfts = (props: { onMinted: any, nftAddress: string }) => {
  interface WalletRefType {
    mintNfts: (nftAddress: string, quantity: number, fieldNames: string[], fieldValues: string[]) => Promise<any>;
  }
  const walletRef = useRef<WalletRefType | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [messageText, setMessageText] = useState("");
  const [progressVisible, setProgressVisible] = useState(false);

  const { onMinted, nftAddress } = props;

  const mint = async (quantity: number) => {
    if (walletRef && walletRef.current && quantity > 0) {
      setProgressVisible(true);
      
      const affiliateIds = [];
      for (let n = 0; n < quantity; n++) {
        affiliateIds.push(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(nftAddress + (n + 1).toString())).substring(0, 20));
      }
      
      const tx = await walletRef.current.mintNfts(nftAddress, quantity, ["affiliateId"], affiliateIds);

      if (tx) {
        const rc = await tx.wait();
        console.log('Transaction hash:', tx.hash);
        setMessageText("Transaction hash:: " + tx.hash)
        return true;
      }

      setProgressVisible(false);
    }
  };

  const handleSubmit = async () => {
    if (quantity > 0) {
      if (await mint(quantity)) {
        onMinted(true);
      }
    }
    else 
      onMinted(true);
  };

  return (
    <div>
      <Heading text="Step 3: Mint new Instances"/>
      <Wallet ref={walletRef} />

      <div className="flex max-w-[687px] w-full gap-x-2">
        <div className="flex-1">
          <Select
            label="Quantity"
            id="opcion"
            name="opcion"
            placeholder="Select an amount"
            onChange={(event) => setQuantity(parseInt(event.target.value))}
          >
            {Array.from({ length: 10 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <button className="text-center text-orange-500 text-base font-semibold leading-normal px-6 py-3 bg-white rounded-xl border border-slate-300 " onClick={() => handleSubmit()}>Next</button>
      <MessageOverlay text={messageText}></MessageOverlay>
      <ProgressOverlay visible={progressVisible}></ProgressOverlay>
    </div>
  );
}
