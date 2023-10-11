import { expect } from "chai";
import {
    getTestAccounts,
    deploySecurityManager,
    deployProductNft,
    deployProductNftStore,
    expectRevert
} from "../utils";
import * as constants from "../constants";
import { ProductNft, ProductNftStore, SecurityManager } from "typechain";


describe("NftStore: Selling", function () {
    let securityManager: SecurityManager;
    let nftStore: ProductNftStore;
    let productNft: ProductNft;
    let addresses: any = {};

    this.beforeEach(async function () {
        let acc = await getTestAccounts(['admin', 'seller', 'buyer']);
        addresses = acc.addresses;

        securityManager = await deploySecurityManager(addresses.admin);
        nftStore = await deployProductNftStore(securityManager.target);
        productNft = await deployProductNft(securityManager.target, addresses.seller, "My Product", "MPT");

        await securityManager.grantRole(constants.roles.nftSeller, addresses.admin);
        await securityManager.grantRole(constants.roles.nftIssuer, addresses.admin);
    });

    describe("Post for Sale", function () {
        it("authorized account can post for sale", async function () {
            const price = 100000;
            let nftsForSale = [];

            expect(parseInt(await nftStore.getPrice(productNft.target.toString()))).to.equal(0);
            nftsForSale = await nftStore.getNftsForSale();
            expect(nftsForSale.length).to.equal(0);

            await nftStore.postForSale(productNft.target.toString(), price);

            expect(parseInt(await nftStore.getPrice(productNft.target.toString()))).to.equal(price);
            nftsForSale = await nftStore.getNftsForSale();
            expect(nftsForSale.length).to.equal(1);
            expect(nftsForSale[0]).to.equal(productNft.target.toString());
        });

        it("cannot post for sale for zero price", async function () {
            await expectRevert(
                () => nftStore.postForSale(productNft.target.toString(), 0),
                constants.errorMessages.ZERO_VALUE
            );
        });
    });
});