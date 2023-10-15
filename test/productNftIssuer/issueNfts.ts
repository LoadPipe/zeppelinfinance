import { expect } from "chai";
import {
    deploySecurityManager,
    deployProductNftFactory,
    deployProductNftIssuer,
    deployProductNftStore,
    deployFinancingRewardPolicy,
    expectRevert,
    getTestAccounts
} from "../utils";
import {
    ProductNftFactory,
    ProductNftIssuer,
    SecurityManager,
    FinancingRewardPolicy, 
    ProductNftStore
} from "typechain";
import * as constants from "../constants";
import { ethers } from "hardhat";


describe("ProductNftIssuer: Issue Nfts", function () {
    let securityManager: SecurityManager;
    let nftFactory: ProductNftFactory;
    let nftIssuer: ProductNftIssuer;
    let rewardPolicy: FinancingRewardPolicy;
    let nftStore: ProductNftStore;

    let addresses: any = {};
    let accounts: any = {};

    this.beforeEach(async function () {
        const acc = await getTestAccounts(['admin', 'seller', 'buyer']);
        addresses = acc.addresses;
        accounts = acc.accounts;

        securityManager = await deploySecurityManager(addresses.admin);
        nftFactory = await deployProductNftFactory(securityManager.target);
        nftStore = await deployProductNftStore(securityManager.target);
        nftIssuer = await deployProductNftIssuer(securityManager.target, nftFactory.target, nftStore.target);
        rewardPolicy = await deployFinancingRewardPolicy(100);
        
        //roles to admin 
        await securityManager.grantRole(constants.roles.nftSeller, addresses.admin);

        //roles to seller 
        await securityManager.grantRole(constants.roles.nftSeller, addresses.seller);

        //roles to contract 
        await securityManager.grantRole(constants.roles.nftIssuer, nftIssuer.target.toString());
    });

    async function createNft(
        productName: string,
        symbol: string,
        fieldNames: string[],
        fieldValues: string[]
    ): Promise<any> {
        return await new Promise(async (resolve, reject) => {
            nftFactory.on("NftCreated", (creatorAddr, nftAddr) => {
                resolve({
                    creator: creatorAddr,
                    nftAddress: nftAddr
                });
            });

            await nftIssuer.createNft(
                productName,
                symbol,
                fieldNames,
                fieldValues
            );
        });
    }

    async function mintNfts(
        nftAddress: string,
        fieldNames: string[],
        fieldValues: any[],
        quantity: number
    ): Promise<any[]> {
        const eventOutputs: any[] = [];

        return await new Promise(async (resolve, reject) => {
            nftIssuer.on("NftMinted", (creatorAddr, nftAddr, tokenId) => {

                eventOutputs.push({
                    creator: creatorAddr,
                    nftAddress: nftAddr,
                    tokenId: tokenId
                });

                if (eventOutputs.length == quantity) {
                    resolve(eventOutputs);
                }
            });

            await nftIssuer.mintNfts(
                nftAddress,
                quantity,
                fieldNames, []
            );
        });
    }

    describe("Issue NFTs", function () {

        it("can create NFTs", async function () {
            const productName = "Product name";
            const nftSymbol = "ABC";
            const fieldNames = ["field1", "field2", "field3"];
            const fieldValues = ["value1", "value2", "value3"];

            const eventOutput: any = await createNft(productName, nftSymbol, fieldNames, fieldValues);

            expect(eventOutput.creator).to.equal(addresses.admin);
            expect(eventOutput.nftAddress.length).to.equal(42);

            //get the newly created nft 
            const productNft = await ethers.getContractAt("ProductNft", eventOutput.nftAddress);

            expect(await productNft.name()).to.equal(productName);
            expect(await productNft.symbol()).to.equal(nftSymbol);

            //test field names 
            fieldNames.forEach(async (field, i) => {
                expect(await productNft.getField(field)).to.equal(fieldValues[i]);
            });
        });

        it("can create and mint NFTs", async function () {
            const productName = "Product name";
            const nftSymbol = "ABC";
            const quantity = 3;

            const createOutput: any = await createNft(productName, nftSymbol, [], []);

            //get the newly created nft 
            const productNft = await ethers.getContractAt("ProductNft", createOutput.nftAddress);

            //TODO: (TEST) test with field instance values 
            const instanceFieldNames: string[] = [];
            const instanceFieldValues: any[] = [];
            const mintOutputs: any[] = await mintNfts(
                createOutput.nftAddress, instanceFieldNames, instanceFieldValues, quantity
            );

            expect(mintOutputs.length).to.equal(quantity);
            mintOutputs.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));

            //test event parameters 
            mintOutputs.forEach((output, i) => {
                expect(output.creator).to.equal(addresses.admin);
                expect(output.nftAddress).to.equal(createOutput.nftAddress);
                expect(parseInt(output.tokenId)).to.equal(i + 1);

                //test field values 
                instanceFieldNames.forEach(async (field, n) => {
                    expect(await productNft.getInstanceFieldString(field)).to.equal(instanceFieldValues[n])
                });
            });

            //token quantity 
            expect(parseInt(await productNft.totalMinted())).to.equal(quantity)
            expect(parseInt(await productNft.balanceOf(addresses.admin))).to.equal(quantity)
        });

        it("can post minted NFTs for sale", async function () {
            const productName = "Product name";
            const nftSymbol = "ABC";
            const quantity = 3;
            const price = 1000000;

            const createOutput: any = await createNft(productName, nftSymbol, [], []);

            //mint NFTs 
            const mintOutputs: any[] = await mintNfts(
                createOutput.nftAddress, [], [], quantity
            );

            //post NFTs for sale in store 
            await nftIssuer.postToStore(createOutput.nftAddress, price);
            expect(parseInt(await nftStore.getPrice(createOutput.nftAddress))).to.equal(price);
        });

        it("can attach policies to created NFTs", async function () {
            const productName = "Product name";
            const nftSymbol = "ABC";

            const createOutput: any = await createNft(productName, nftSymbol, [], []);

            //get the newly created nft 
            const productNft = await ethers.getContractAt("ProductNft", createOutput.nftAddress);

            await nftIssuer.attachNftPolicy(
                createOutput.nftAddress,
                rewardPolicy.target.toString()
            );

            const policies = await productNft.getPolicies();
            expect(policies.length).to.equal(1);
            expect(policies[0]).to.equal(rewardPolicy.target.toString());

            //TODO: (TEST) test the param values 
            //TODO: (TEST) test with a second policy
        });

        it("cannot attach more than a max number of policies", async function () {
            //TODO: (TEST) cannot attach more than a max number of policies
        });

        it("cannot attach the same policy twice", async function () {
            //TODO: (TEST) cannot attach the same policy twice
        }); 
    });

    describe("Restrictions", function () {

        it("cannot create NFT if not authorized seller", async function () {
            await expectRevert(
                () => nftIssuer.connect(accounts.buyer).createNft("product", "PRD", [], []),
                //constants.errorMessages.UNAUTHORIZED_ACCESS
            );
            //TODO: (HIGH) test the inverse
        });

        it("NFT non-creator/owner cannot mint NFTs", async function () {
            //create NFT
            const createOutput = await createNft("product", "PRD", [], []);

            //mint NFTs 
            await expectRevert(
                () => nftIssuer.connect(accounts.seller).mintNfts(createOutput.nftAddress, 3, [], [])
                //constants.errorMessages.NOT_NFT_OWNER(addresses.seller, createOutput.nftAddress)
            );
            //TODO: (HIGH) test the inverse
        });

        it("NFT non-creator/owner cannot attach policies", async function () {
            //create NFT 
            const createOutput = await createNft("product", "PRD", [], []);

            //attach NFT policy 
            await expectRevert(
                () => nftIssuer.connect(accounts.seller).attachNftPolicy(createOutput.nftAddress, rewardPolicy.target.toString()),
                null //constants.errorMessages.NOT_NFT_OWNER(addresses.seller, createOutput.nftAddress)
            );
            //TODO: (HIGH) test the inverse
        });

        it("cannot attach policies if any NFTs already minted", async function () {
            //create NFT 
            const createOutput: any = await createNft("product", "PRD", [], []);

            //mint NFTs 
            const mintOutputs: any[] = await mintNfts(
                createOutput.nftAddress, [], [], 1
            );

            //attach NFT policy 
            await expectRevert(
                () => nftIssuer.attachNftPolicy(createOutput.nftAddress, rewardPolicy.target.toString()),
                constants.errorMessages.INVALID_ACTION
            );
        });

        it("cannot post for sale if not NFT owner", async function () {
            //create NFT
            const createOutput = await createNft("product", "PRD", [], []);

            //mint NFTs 
            const mintOutputs: any[] = await mintNfts(
                createOutput.nftAddress, [], [], 1
            );

            //post for sale 
            await expectRevert(
                () => nftIssuer.connect(accounts.seller).postToStore(createOutput.nftAddress, 100000000),
                null //constants.errorMessages.NOT_NFT_OWNER(addresses.seller, createOutput.nftAddress)
            );
            //TODO: (HIGH) test the inverse
        });
    });
});