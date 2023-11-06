import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
    deploySecurityManager,
    deployProductNftIssuer,
    deployProductNftStore,
    deployWhitelist,
    deployNftRefundPolicy,
    deployProductNftFactory,
    deployZeppelinOracle,
    deployAffiliatePayout,
    deployAffiliateRewardPolicy,
    deployFinancingRewardPolicy,
    deployNftPolicyFactory,
} from "./lib/deployment";
import { run } from "./lib/runner";
import {
    getSecurityManagerContract,
    getPolicyFactoryContract,
    sleep
} from "./utils";
import { addresses } from "./constants";
import { Database } from "@tableland/sdk";

const DELAY = 30000;

async function deploy1(ownerAddress: string) {
    const securityManager = await deploySecurityManager(ownerAddress);
    console.log("security manager:", securityManager.target);
    addresses[addresses.NETWORK].securityManager = securityManager.target.toString();
    await sleep(DELAY);
    return securityManager;
}

async function deploy2() {
    const nftFactory = await deployProductNftFactory(
        addresses[addresses.NETWORK].securityManager
    );
    console.log("nft factory:", nftFactory.target);
    addresses[addresses.NETWORK].productNftFactory = nftFactory.target.toString();
    await sleep(DELAY);
    return nftFactory;
}

async function deploy3() {
    const nftStore = await deployProductNftStore(addresses[addresses.NETWORK].securityManager);
    console.log("nft store:", nftStore.target);
    addresses[addresses.NETWORK].productNftStore = nftStore.target.toString();
    await sleep(DELAY);
    return nftStore;
}

async function deploy4() {
    const nftIssuer = await deployProductNftIssuer(
        addresses[addresses.NETWORK].securityManager,
        addresses[addresses.NETWORK].productNftFactory,
        addresses[addresses.NETWORK].productNftStore,
    );
    console.log("nft issuer:", nftIssuer.target);
    addresses[addresses.NETWORK].productNftIssuer = nftIssuer.target.toString();
    await sleep(DELAY);
    return nftIssuer;
}

async function deploy5() {
    const zeppelin = await deployZeppelinOracle(addresses[addresses.NETWORK].securityManager);
    console.log("zeppelin oracle:", zeppelin.target);
    addresses[addresses.NETWORK].zeppelinOracle = zeppelin.target.toString();
    await sleep(DELAY);
    return zeppelin;
}

async function deploy6() {
    const affiliatePayout = await deployAffiliatePayout(addresses[addresses.NETWORK].securityManager, addresses[addresses.NETWORK].zeppelinOracle);
    console.log("affiliate payout:", affiliatePayout.target);
    addresses[addresses.NETWORK].affiliatePayout = affiliatePayout.target.toString();
    await sleep(DELAY);
    return affiliatePayout;
}

async function deploy7() {
    const refundPolicy = await deployNftRefundPolicy(addresses[addresses.NETWORK].securityManager);
    console.log("refund policy:", refundPolicy.target);
    addresses[addresses.NETWORK].refundPolicy = refundPolicy.target.toString();
    await sleep(DELAY);
    return refundPolicy;
}

async function deploy8() {
    const rewardPolicy = await deployAffiliateRewardPolicy(120);
    console.log("affiliate reward policy:", rewardPolicy.target);
    addresses[addresses.NETWORK].affiliatePolicy = rewardPolicy.target.toString();
    await sleep(DELAY);
    return rewardPolicy;
}

async function deploy9() {
    const rewardPolicy = await deployFinancingRewardPolicy(100);
    console.log("financing reward policy:", rewardPolicy.target);
    addresses[addresses.NETWORK].financingPolicy = rewardPolicy.target.toString();
    await sleep(DELAY);
    return rewardPolicy;
}

async function deploy10(supportsTable: boolean, tablePrefix: string = '', tableId: number = 0) {
    const policyFactory = await deployNftPolicyFactory(
        addresses[addresses.NETWORK].securityManager,
        supportsTable,
        tablePrefix,
        tableId
    );
    console.log("policy factory:", policyFactory.target);
    addresses[addresses.NETWORK].policyFactory = policyFactory.target.toString();
    await sleep(DELAY);
    return policyFactory;
}

run(async (provider: HardhatEthersProvider, owner: HardhatEthersSigner) => {
    //deploy security manager 
    console.log(owner.address);
    console.log();
    /*

    //deploy security manager
    await deploy1(owner.address);

    //deploy nft factory
    await deploy2();

    //deploy nft store 
    await deploy3();

    //deploy nft issuer 
    await deploy4();

    //set permissions 
    const securityManager = await getSecurityManagerContract(addresses.NETWORK);
    await securityManager.grantRole(ethers.keccak256(ethers.toUtf8Bytes("NFT_ISSUER_ROLE")), addresses[addresses.NETWORK].productNftIssuer);
    console.log('1')
    await securityManager.grantRole(ethers.keccak256(ethers.toUtf8Bytes("NFT_SELLER_ROLE")), owner.address);
    console.log('2')
    await securityManager.grantRole(ethers.keccak256(ethers.toUtf8Bytes("NFT_ISSUER_ROLE")), owner.address);
    console.log('3')
    await securityManager.grantRole(ethers.keccak256(ethers.toUtf8Bytes("SYSTEM_ROLE")), owner.address);
    console.log('4')

    return;
    await sleep(DELAY);
    */

    //deploy zeppelin oracle 
    await deploy5();

    //deploy affiliate payment 
    await deploy6();

    //deploy refund policy
    await deploy7();

    //deploy affiliate reward policy 
    await deploy8();

    //deploy financing reward policy
    await deploy9();

    //deploy nft policy factory
    //nft_policies_2_80001_7877
    //await deploy10(true, 'nft_policies_2', 7877);
    await deploy10(false);

    console.log(addresses);
}); 