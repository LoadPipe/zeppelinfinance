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

export async function getSecurityManagerContract(network: string, address: string | Addressable | null = null) {
    if (!address)
        address = addresses[network].securityManager;

    return await ethers.getContractAt("SecurityManager", address);
}

export async function getNftContract(address: string | Addressable) {
    return await ethers.getContractAt("ProductNft", address);
}

export async function getNftIssuerContract(network: string) {
    return await ethers.getContractAt("ProductNftIssuer", addresses[network].productNftIssuer)
}

export async function getNftFactoryContract(network: string) {
    return await ethers.getContractAt("ProductNftFactory", addresses[network].productNftFactory)
}

export async function getNftStoreContract(network: string) {
    return await ethers.getContractAt("ProductNftStore", addresses[network].productNftStore)
}

export async function getZeppelinContract(network: string) {
    return await ethers.getContractAt("ZeppelinOracle", addresses[network].zeppelinOracle)
}

export async function getPayoutContract(network: string) {
    return await ethers.getContractAt("AffiliatePayout", addresses[network].affiliatePayout)
}

export async function getPolicyFactoryContract(network: string) {
    return await ethers.getContractAt("NftPolicyFactory", addresses[network].policyFactory)
}

export async function getLoadpipeTokenContract(network: string) {
    return await ethers.getContractAt("LoadpipeToken", addresses[network].loadpipeToken)
}