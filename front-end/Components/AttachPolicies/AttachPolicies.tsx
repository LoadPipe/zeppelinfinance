"use client";
import Subtitle from "@/Components/Subtitle/Subtitle";
import Wallet from "@/Web3/Wallet";
import Checkbox from "@/Components/CheckBox/CheckBox";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { useState, useRef } from "react";
import Heading from "../Heading/Heading";
import { initialChain } from "@/Chains/chains";
import { getContractAddresses } from "@/Web3/Wallet";
import MessageOverlay from "@/Components/MessageOverlay/MessageOverlay";
import ProgressOverlay from "@/Components/ProgressOverlay/ProgressOverlay";

const addresses = getContractAddresses(initialChain);

export const AttachPolicies = (props: { onPoliciesAttached: any, nftAddress: string}) => {
  interface WalletRefType {
    attachNftPolicies: (nftAddress: string, policies: string[]) => Promise<any>;
  }
  const walletRef = useRef<WalletRefType | null>(null);
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [checkbox3, setCheckbox3] = useState(false);
  const [checkbox4, setCheckbox4] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [progressVisible, setProgressVisible] = useState(false);

  const { onPoliciesAttached, nftAddress } = props;

  const attachPolicies = async (policies: string[]) => {
    if (walletRef && walletRef.current && policies.length) {
      setProgressVisible(true);
      const tx = await walletRef.current.attachNftPolicies(nftAddress, policies);
      if (tx) {
        const rc = await tx.wait();
        console.log('Transaction hash:', tx.hash);
        setMessageText("Transaction hash:: " + tx.hash)
        return true;
      }
    }
    setProgressVisible(false);
    return false;
  };

  //TODO: link policies to actual things 
  const handleSubmit = async () => {
    if (checkbox1 || checkbox2 || checkbox3 || checkbox4) {
      if (await attachPolicies([addresses.affiliatePolicy, addresses.financingPolicy])) {
        onPoliciesAttached(true);
      }
    }
    else {
      onPoliciesAttached(true);
    }
  };
  
  return (
    <div>
      <Heading text="Step 2: Attach Reward Policies" />
      <Wallet ref={walletRef} />
      <div>
        <div className="my-12">
          <Subtitle
            subtitle="Add Reward Policies"
            text="Or create a new custom reward policy."
          />
          <Checkbox
            label="1% of sales (unlimited)"
            checked={checkbox1}
            onChange={(event) => setCheckbox1(event.target.checked)}
          />
          <Checkbox
            label="1.2% of affiliate sales"
            checked={checkbox4}
            onChange={(event) => setCheckbox4(event.target.checked)}
          />
          <Checkbox
            label="2% of sales, shared"
            checked={checkbox2}
            onChange={(event) => setCheckbox2(event.target.checked)}
          />
          <Checkbox
            label="3% of sales up to 25 units of inventory sold"
            checked={checkbox3}
            onChange={(event) => setCheckbox3(event.target.checked)}
          />
        </div>
        <SecondaryButton>create new policy</SecondaryButton>
      </div>

      <br/>
      <button className="text-center text-orange-500 text-base font-semibold leading-normal px-6 py-3 bg-white rounded-xl border border-slate-300 " onClick={() => handleSubmit()}>Next</button>
      <MessageOverlay text={messageText}></MessageOverlay>
      <ProgressOverlay visible={progressVisible}></ProgressOverlay>
    </div>
  );
}
