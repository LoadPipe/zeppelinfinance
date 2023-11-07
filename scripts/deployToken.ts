import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
    deployLoadpipeToken
} from "./lib/deployment";
import { run } from "./lib/runner";
import { addresses } from "./constants";
import { getSecurityManagerContract } from "./utils";
import { security } from "typechain/@openzeppelin/contracts";

run(async (provider: HardhatEthersProvider, owner: HardhatEthersSigner) => {
    //deploy security manager 
    console.log(owner.address);
    console.log(addresses[addresses.NETWORK].securityManager);
    console.log(); 
    
    const securityManager = await getSecurityManagerContract(addresses.NETWORK);
        
    const token = await deployLoadpipeToken(securityManager.target, 1000000); 
    console.log(token.target);
    
    await securityManager.grantRole(ethers.keccak256(ethers.toUtf8Bytes("TOKEN_MINTER_ROLE")), owner.address);
    
}); 