"use client";
import Card, { FooterCard } from "@/Components/Card/Card";
import RowLayout from "@/Components/RowLayout/RowLayout";
import image from "@/images/imgCollection1.png";
import Heading from "@/Components/Heading/Heading";
import { CreateNft } from "@/Components/CreateNft/CreateNft"; 
import Wallet from "@/Web3/Wallet";
import { useState, useRef } from "react";
import { AttachPolicies } from "@/Components/AttachPolicies/AttachPolicies";
import { MintNfts } from "@/Components/MintNfts/MintNfts";
import { PostToStore } from "@/Components/PostToStore/PostToStore";

export default function Home() {
  const walletRef = useRef(null);
  const [files, setFiles] = useState();
  const [item, setItem] = useState("");
  const [nftAddress, setNftAddress] = useState("");
  const [policiesAttached, setPoliciesAttached] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [minted, setMinted] = useState(false);

  const onDropFile = (files: any) => {
    setFiles(files);
  };
  
  const onNftCreated = (nftAddress: any) => {
    setNftAddress(nftAddress);
  }
  
  const onPoliciesAttached = (done: boolean) => {
    setPoliciesAttached(done);
  }

  const onMinted = (done: boolean) => {
    setMinted(done);
  }

  const onPosted = (done: boolean) => {
    //Changed this to an empty string from null, let's hope it doesn't break anything
    setNftAddress('');
    setPoliciesAttached(false);
    setMinted(false);
  }
  
  const onFileDropped = () => {
    setPreviewVisible(true);
  }

  return (
    <main className="flex flex-col items-center justify-center">
      <RowLayout fit>
        <div className="flex w-full mb-20">
          <div className="flex-1">
            <Heading text="Add new NFT" />
              <div>


              {!nftAddress && 
                <CreateNft onNftCreated={onNftCreated} onFileDropped={onFileDropped}/> 
              }


              {nftAddress && !policiesAttached && 
                <AttachPolicies onPoliciesAttached={onPoliciesAttached} nftAddress={nftAddress}/>
              }


              {nftAddress && policiesAttached && !minted && 
                <MintNfts onMinted={onMinted} nftAddress={nftAddress}/>
              }


              {nftAddress && policiesAttached && minted && 
                <PostToStore onPosted={onPosted} nftAddress={nftAddress} />
              }
            
              </div>
          </div>
          {previewVisible && 
          <div className="flex flex-1 justify-center h-[568px]">
            <Card
              alt="imagen"
              flow="0.03"
              image={image}
              title="Men's Drinking Flask Set"
              isPreview
              footer={<FooterCard likes={33} />}
            />
          </div>
          }
          {!previewVisible &&
            <div className="flex flex-1 justify-center h-[568px]">
              &nbsp;
            </div>
          }
        </div>
      </RowLayout>
    </main>
  );
}
