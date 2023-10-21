"use client";
import Input from "@/Components/Input/Input";
import UploadFile from "@/Components/UploadFile/UploadFile";
import Subtitle from "@/Components/Subtitle/Subtitle";
import Wallet from "@/Web3/Wallet";
import Heading from "../Heading/Heading";
import { useState, useRef } from "react";

//TODO: loading screens 

//TODO: controls should be invisible if not a seller 

export const CreateNft = (props: { onNftCreated: any, onFileDropped: any }) => {
  interface WalletRefType {
    createNft: (productName: string, fieldNames: string[], fieldValues: string[]) => Promise<any>;
  }
  const walletRef = useRef<WalletRefType | null>(null);
  const [files, setFiles] = useState();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");

  const onDropFile = (files: any) => {
    setFiles(files);
    onFileDropped();
  };

  const { onNftCreated, onFileDropped } = props;

  const createNft = async (productName: string, brandName: string, url: string) => {
    const fieldNames = ["brand", "url"];
    const fieldValues = [brandName, url];
    
    if (walletRef && walletRef.current) {
      const tx = await walletRef.current.createNft(productName, fieldNames, fieldValues);
      let newNftAddress = null;

      if (tx) {
        console.log(tx);
        const rc = await tx.wait();
        console.log('Transaction hash:', tx.hash);

        //TODO: logs not available, can't get nft address 
        //get the new NFT's address 
        rc.events.forEach((e: any) => {
          console.log(e);
          if (e.event == "NftCreated") {
            newNftAddress = e.args.nftAddress;
          }
        });
      }

      return newNftAddress;
    }
  };

  const handleSubmit = async () => {
    const newNftAddress: any = await createNft( name, brand, "" );
    //const newNftAddress = "0xa67c54759a64e853c8386adc345bc3d8527d6ecf";
    console.log("new NFT:", newNftAddress);

    onNftCreated(newNftAddress);
  };

  return (
    <div>
      <Heading text="Step 1: Create a new NFT" />
      <Wallet ref={walletRef}/>
      <div>
        <div className="my-6">
          <Subtitle
            subtitle="Upload a Product Image"
            text="But each one takes a different approach and makes different tradeoffs."
          />
        </div>
        <div className="max-w-[628px] h-[320px]">
          <UploadFile onDrop={onDropFile} />
        </div>
      </div>
      <div>
        <div className="max-w-[687px] w-full flex flex-col">
          <Input
            label="Name"
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Redeemable T-Shirt with Logo"
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            label="Brand"
            id="Brand"
            name="Brand"
            type="text"
            placeholder="e.g.Levi"
            onChange={(event) => setBrand(event.target.value)}
          />
        </div>
      </div>
      
      <button className="text-center text-orange-500 text-base font-semibold leading-normal px-6 py-3 bg-white rounded-xl border border-slate-300 " onClick={() => handleSubmit()}>Next</button>
    </div>
  );
}
