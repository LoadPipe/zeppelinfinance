import { expect } from "chai";
import {
    getTestAddresses,
    deploySecurityManager,
    deployProductNftFactory,
    listenForEvent
} from "../utils";
import {
    ProductNftFactory,
    SecurityManager
} from "typechain";
import * as constants from "../constants";
import { ethers } from "hardhat";


describe("ProductNftFactory: Create NFTs", function () {
    let securityManager: SecurityManager;
    let nftFactory: ProductNftFactory;
    let addresses: any = {}

    this.beforeEach(async function () {
        addresses = await getTestAddresses(['admin', 'seller'])
        securityManager = await deploySecurityManager(addresses.admin);
        nftFactory = await deployProductNftFactory(securityManager.target);

        await securityManager.grantRole(constants.roles.nftIssuer, addresses.admin);
    });

    describe("Create NFT", function () {
        it("create an NFT with the correct values", async function () {
            const productName = "productName";
            const nftSymbol = "PRD";

            const eventOutput = await listenForEvent(
                nftFactory,
                "NftCreated",
                () => nftFactory.createProductNft(
                    addresses.seller,
                    productName,
                    nftSymbol
                ),
                ["creator", "nftAddress"]
            );

            expect(eventOutput.eventFired).to.be.true;
            const productNft = await ethers.getContractAt("ProductNft", eventOutput.nftAddress);
            expect(eventOutput.creator).to.equal(addresses.seller);
            expect(await productNft.name()).to.equal(productName);
            expect(await productNft.symbol()).to.equal(nftSymbol);
            expect(parseInt(await productNft.totalMinted())).to.equal(0);
        });
    });
    
    //TODO: (TEST) more ProductNftFactory tests
});