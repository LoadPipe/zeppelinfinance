import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Addressable } from "ethers";
import { ethers } from "hardhat";

import {
    addresses
} from "./constants";

export async function sleep(ms: number) {
    return await (new Promise(resolve => setTimeout(resolve, ms)));
}

export async function getSecurityManagerContract(address: string | Addressable | null = null) {
    if (!address)
        address = addresses.securityManager;

    return await ethers.getContractAt("SecurityManager", address);
}

export async function getNftContract(address: string | Addressable) {
    return await ethers.getContractAt("ProductNft", address);
}

export async function getNftIssuerContract() {
    return await ethers.getContractAt("ProductNftIssuer", addresses.nftIssuer)
}

export async function getNftStoreContract() {
    return await ethers.getContractAt("ProductNftStore", addresses.nftStore)
}

export async function getZeppelinContract() {
    return await ethers.getContractAt("ZeppelinOracle", addresses.zeppelin)
}

export async function getPayoutContract() {
    return await ethers.getContractAt("AffiliatePayout", addresses.affiliatePayout)
}