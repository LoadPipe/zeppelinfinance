import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
    deploySecurityManager,
    deployProductNftIssuer,
    deployProductNftStore,
    deployWhitelist,
    deployProductNftFactory,
    deployZeppelinOracle,
    deployAffiliatePayout,
} from "./lib/deployment";
import { run } from "./lib/runner";
import { getSecurityManagerContract, sleep } from "./utils";
import { addresses } from "./constants";

const DELAY = 6000;

async function deploy1(ownerAddress: string) {
    const securityManager = await deploySecurityManager(ownerAddress);
    console.log("security manager:", securityManager.target);
    addresses.securityManager = securityManager.target.toString();
    await sleep(DELAY);
    return securityManager;
}

async function deploy2() {
    const nftFactory = await deployProductNftFactory(
        addresses.securityManager
    );
    console.log("nft factory:", nftFactory.target);
    addresses.nftFactory = nftFactory.target.toString();
    await sleep(DELAY);
    return nftFactory;
}

async function deploy3() {
    const nftStore = await deployProductNftStore(addresses.securityManager);
    console.log("nft store:", nftStore.target);
    addresses.nftStore = nftStore.target.toString();
    await sleep(DELAY);
    return nftStore;
}

async function deploy4() {
    const nftIssuer = await deployProductNftIssuer(
        addresses.securityManager,
        addresses.nftFactory,
        addresses.nftStore,
    );
    console.log("nft issuer:", nftIssuer.target);
    addresses.nftIssuer = nftIssuer.target.toString();
    await sleep(DELAY);
    return nftIssuer;
}

async function deploy5() {
    const zeppelin = await deployZeppelinOracle(addresses.securityManager);
    console.log("zeppelin oracle:", zeppelin.target);
    addresses.zeppelin = zeppelin.target.toString();
    await sleep(DELAY);
    return zeppelin;
}

async function deploy6() {
    const affiliatePayout = await deployAffiliatePayout(addresses.securityManager, addresses.zeppelin);
    console.log("affiliate payout:", affiliatePayout.target);
    addresses.affiliatePayout = affiliatePayout.target.toString();
    await sleep(DELAY);
    return affiliatePayout;
}

run(async (provider: HardhatEthersProvider, owner: HardhatEthersSigner) => {

    //deploy security manager 
    console.log(owner.address);
    console.log();

    //deploy security manager
    await deploy1(owner.address);

    //deploy nft factory
    await deploy2();

    //deploy nft store 
    await deploy3();

    //deploy nft issuer 
    await deploy4();

    //set permissions 
    const securityManager = await getSecurityManagerContract();
    await securityManager.grantRole(ethers.keccak256(ethers.toUtf8Bytes("NFT_ISSUER_ROLE")), owner.address);
    await securityManager.grantRole(ethers.keccak256(ethers.toUtf8Bytes("NFT_SELLER_ROLE")), owner.address);
    await securityManager.grantRole(ethers.keccak256(ethers.toUtf8Bytes("NFT_ISSUER_ROLE")), addresses.nftIssuer);
    await securityManager.grantRole(ethers.keccak256(ethers.toUtf8Bytes("SYSTEM_ROLE")), owner.address);
    await sleep(DELAY);

    //deploy zeppelin oracle 
    await deploy5();

    //deploy affiliate payment 
    await deploy6();

    console.log(addresses);
}); 