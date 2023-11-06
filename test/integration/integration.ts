import { expect } from "chai";
import {
    deploySecurityManager,
    deployFinancingRewardPolicy,
    deployProductNftStore,
    deployProductNftIssuer,
    getTestAccounts,
    deployZeppelinOracle,
    deployAffiliatePayout
} from "../utils";
import {
    ProductNft,
    ProductNftIssuer,
    ProductNftStore,
    FinancingRewardPolicy,
    SecurityManager,
    ZeppelinOracle,
    AffiliatePayout
} from "typechain";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import * as constants from "../constants";


describe("Integration: Happy Path #1", function () {   
    let securityManager: SecurityManager;
    let rewardPolicy: FinancingRewardPolicy;
    let nftStore: ProductNftStore;
    let nftIssuer: ProductNftIssuer;
    let nftFactory: Contract;
    let zeppelin: ZeppelinOracle;
    let affiliatePayout: AffiliatePayout;

    let addresses: any = {};
    let accounts: any = {};

    this.beforeEach(async function () {
        const acc = await getTestAccounts(['admin', 'seller1', 'seller2', 'buyer1', 'buyer2'])
        addresses = acc.addresses;
        accounts = acc.accounts;

        securityManager = await deploySecurityManager(addresses.admin);
        rewardPolicy = await deployFinancingRewardPolicy(100);
        nftStore = await deployProductNftStore(securityManager.target);
        nftIssuer = await deployProductNftIssuer(securityManager.target, null, nftStore.target);
        nftFactory = await ethers.getContractAt("ProductNftFactory", await nftIssuer.nftFactory());
        zeppelin = await deployZeppelinOracle(securityManager.target);
        affiliatePayout = await deployAffiliatePayout(securityManager.target, zeppelin.target);

        //security roles 
        await securityManager.grantRole(constants.roles.nftSeller, addresses.seller1);
        await securityManager.grantRole(constants.roles.nftSeller, addresses.seller2);

        //roles to contracts
        await securityManager.grantRole(constants.roles.nftSeller, nftIssuer.target.toString());
        await securityManager.grantRole(constants.roles.nftIssuer, nftIssuer.target.toString());

        //admin roles 
        await securityManager.grantRole(constants.roles.system, addresses.admin);

        //fund affiliate payout contract
        await accounts.admin.sendTransaction({
            to: affiliatePayout.target,
            value: 100000000
        });
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

    describe("Integration", function () {
        it("the happiest path", async function () {
            //let seller deploy an NFT 
            const productName = "A Product";
            const productUrl = "http://prod.url";

            const nftAddress = await deployNewNFT(
                accounts.seller1,
                "My New NFT",
                "MNF",
                [
                    {
                        name: "productId",
                        value: productName
                    },
                    {
                        name: "productUrl",
                        value: productUrl
                    }
                ]
            );

            //get the NFT contract 
            const productNft = await ethers.getContractAt("ProductNft", nftAddress);
            expect(await productNft.getField("productUrl")).to.equal(productUrl);
            //expect(await productNft.getField("productId")).to.equal(productName);

            //set policies 
            await nftIssuer.connect(accounts.seller1).attachNftPolicies(nftAddress, [rewardPolicy.target.toString()]);
            const policies = await productNft.getPolicies();
            expect(policies.length).to.equal(1);
            expect(policies[0]).to.equal(rewardPolicy.target.toString());

            //mint NFTs 
            const mintQuantity = 10;
            await nftIssuer.connect(accounts.seller1).mintNfts(nftAddress, mintQuantity, [], []);
            expect(parseInt(await productNft.totalMinted())).to.equal(mintQuantity);
            expect(parseInt(await productNft.balanceOf(addresses.seller1))).to.equal(mintQuantity);

            //post for sale in store 
            const price = 100000;
            await nftIssuer.connect(accounts.seller1).postToStore(nftAddress, price);
            await productNft.connect(accounts.seller1).setApprovalForAll(nftStore.target.toString(), true);

            //push some sales data 
            const productIdBytes = await productNft.productId();
            await zeppelin.setSalesData(productIdBytes, 10, (price * 10));

            //someone buys nft
            await nftStore.connect(accounts.buyer1).purchaseNft(nftAddress, 3, { value: price });
            expect(parseInt(await productNft.totalMinted())).to.equal(mintQuantity);
            expect(parseInt(await productNft.balanceOf(addresses.seller1))).to.equal(mintQuantity - 1);
            expect(parseInt(await productNft.balanceOf(addresses.buyer1))).to.equal(1);
            expect(await productNft.ownerOf(3)).to.equal(addresses.buyer1);

            //someone else buys another nft
            await nftStore.connect(accounts.buyer2).purchaseNft(nftAddress, 5, { value: price });
            expect(parseInt(await productNft.totalMinted())).to.equal(mintQuantity);
            expect(parseInt(await productNft.balanceOf(addresses.seller1))).to.equal(mintQuantity - 2);
            expect(parseInt(await productNft.balanceOf(addresses.buyer2))).to.equal(1);
            expect(await productNft.ownerOf(5)).to.equal(addresses.buyer2);

            //how much is owed? 
            expect(parseInt(await affiliatePayout.getAmountOwed(nftAddress, 3))).to.equal(10000);
            expect(parseInt(await affiliatePayout.getAmountOwed(nftAddress, 5))).to.equal(10000);

            //pull payout 
            await affiliatePayout.connect(accounts.buyer1).buyerWithdraw(nftAddress, 3);

            //how much is owed now? 
            expect(parseInt(await affiliatePayout.getAmountOwed(nftAddress, 3))).to.equal(0);
            expect(parseInt(await affiliatePayout.getAmountOwed(nftAddress, 5))).to.equal(10000);
        });
    });
});