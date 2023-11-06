import { expect } from "chai";
import {
    deploySecurityManager,
    deployAffiliateRewardPolicy,
    deployProductNftStore,
    deployProductNftIssuer,
    getTestAccounts
} from "../utils";
import {
    ProductNftIssuer,
    ProductNftStore,
    AffiliateRewardPolicy,
    SecurityManager
} from "typechain";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import * as constants from "../constants";


describe("Policies: Affiliate", function () {
    let securityManager: SecurityManager;
    let affiliatePolicy: AffiliateRewardPolicy;
    let nftStore: ProductNftStore;
    let nftIssuer: ProductNftIssuer;
    let nftFactory: Contract;
    let addresses: any = {};
    let accounts: any = {};

    this.beforeEach(async function () {
        const acc = await getTestAccounts(['admin', 'seller1', 'seller2', 'buyer1', 'buyer2'])
        addresses = acc.addresses;
        accounts = acc.accounts;

        securityManager = await deploySecurityManager(addresses.admin);
        affiliatePolicy = await deployAffiliateRewardPolicy(100);
        nftStore = await deployProductNftStore(securityManager.target);
        nftIssuer = await deployProductNftIssuer(securityManager.target, null, nftStore.target);
        nftFactory = await ethers.getContractAt("ProductNftFactory", await nftIssuer.nftFactory());

        //security roles 
        await securityManager.grantRole(constants.roles.nftSeller, addresses.seller1);
        await securityManager.grantRole(constants.roles.nftSeller, addresses.seller2);

        //roles to contracts
        await securityManager.grantRole(constants.roles.nftIssuer, nftIssuer.target.toString());
        await securityManager.grantRole(constants.roles.nftSeller, nftIssuer.target.toString());

        //admin roles 
        await securityManager.grantRole(constants.roles.system, addresses.admin);
        await securityManager.grantRole(constants.roles.nftSeller, addresses.admin);
        await securityManager.grantRole(constants.roles.nftIssuer, addresses.admin);
    });

    async function deployNewNFT(
        deployerAccount: Signer,
        productName: string,
        symbol: string,
        fields: { name: string, value: string }[]
    ): Promise<string> {
        return new Promise(async (resolve, reject) => {
            nftFactory.on("NftCreated", (creatorAddr, nftAddr) => {
                resolve(nftAddr);
            });
            await nftIssuer.connect(deployerAccount).createNft(
                productName,
                symbol,
                fields.map(f => f.name),
                fields.map(f => f.value)
            );
        });
    }

    describe("Policy Rewards", function () {
        it("can attach a policy", async function () {
            //let seller deploy an NFT 
            const nftAddress = await deployNewNFT(
                accounts.seller1,
                "New NFT",
                "MNF",
                []
            );

            //get the NFT contract 
            const productNft = await ethers.getContractAt("ProductNft", nftAddress);

            //set policy 
            await productNft.attachPolicy(affiliatePolicy.target.toString());
            const policies = await productNft.getPolicies();
            expect(policies.length).to.equal(1);
            expect(policies[0]).to.equal(affiliatePolicy.target.toString());
        });

        it("can generate rewards for a policy", async function () {
            //TODO: (TEST) test this 
        });
    });
});