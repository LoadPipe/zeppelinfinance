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


describe("NftStore: Buying", function () {
    let securityManager: SecurityManager;
    let nftStore: ProductNftStore;
    let productNft: ProductNft;
    let addresses: any = {};
    let accounts: any = {};

    this.beforeEach(async function () {
        let acc = await getTestAccounts(['admin', 'seller', 'buyer1', 'buyer2']);
        addresses = acc.addresses;
        accounts = acc.accounts;

        securityManager = await deploySecurityManager(addresses.admin);
        nftStore = await deployProductNftStore(securityManager.target);
        productNft = await deployProductNft(securityManager.target, addresses.seller, "My Product", "MPT");

        await securityManager.grantRole(constants.roles.nftSeller, addresses.admin);
        await securityManager.grantRole(constants.roles.nftIssuer, addresses.admin);
        await securityManager.grantRole(constants.roles.nftIssuer, addresses.seller);
    });

    async function postInstanceForSale(address: string, price: number) {
        await nftStore.postForSale(address, price);
    }

    async function mintInstances(quantity: number) {
        await productNft.mint(await productNft.owner(), quantity, []);
    }

    async function setStoreApproval() {
        await productNft.connect(accounts.seller).setApprovalForAll(
            nftStore.target.toString(), true
        );
    }

    describe("Purchasing", function () {
        const price = 1000000;

        this.beforeEach(async function () {
            await postInstanceForSale(productNft.target.toString(), price);
        });

        it("cannot purchase instance for less than price", async function () {
            await mintInstances(3);
            await setStoreApproval();

            await expectRevert(
                () => nftStore.connect(accounts.buyer1).purchaseNft(productNft.target.toString(), 1, { value: price - 1 }),
                constants.errorMessages.INSUFFICIENT_PAYMENT(price, price - 1)
            );
        });

        it("cannot purchase nonexistent instance", async function () {
            await mintInstances(3);
            await setStoreApproval();

            await expectRevert(
                () => nftStore.connect(accounts.buyer1).purchaseNft(productNft.target.toString(), 4, { value: price }),
                'ERC721: invalid token ID'
            );
        });

        it("cannot purchase unavailable instance", async function () {
            await mintInstances(3);
            await setStoreApproval();
            const tokenId = 2;

            const anotherNft = await deployProductNft(securityManager.target, addresses.seller, "Another Product", "APT");

            await expectRevert(
                () => nftStore.connect(accounts.buyer1).purchaseNft(anotherNft.target.toString(), tokenId, { value: price }),
                constants.errorMessages.NFT_INSTANCE_UNAVAILABLE(productNft.target.toString(), tokenId)
            );
        });

        it("cannot purchase instance that's already been sold", async function () {
            await mintInstances(3);
            await setStoreApproval();
            const tokenId = 2;

            await nftStore.connect(accounts.buyer1).purchaseNft(productNft.target.toString(), tokenId, { value: price });

            await expectRevert(
                () => nftStore.connect(accounts.buyer2).purchaseNft(productNft.target.toString(), tokenId, { value: price }),
                constants.errorMessages.NFT_INSTANCE_UNAVAILABLE(productNft.target.toString(), tokenId)
            );
        });

        it("cannot purchase instance if token owner hasn't approved store", async function () {
            await mintInstances(3);

            await expectRevert(
                () => nftStore.connect(accounts.buyer1).purchaseNft(productNft.target.toString(), 2, { value: price }),
                'ERC721: caller is not token owner or approved'
            );
        });

        it("can purchase at price", async function () {
            await mintInstances(3);
            await setStoreApproval();

            await nftStore.connect(accounts.buyer1).purchaseNft(productNft.target.toString(), 1, { value: price });

            expect(await productNft.ownerOf(1)).to.equal(addresses.buyer1);
            expect(parseInt(await productNft.balanceOf(addresses.buyer1))).to.equal(1);
        });

        it("can purchase at more than price", async function () {
            await mintInstances(3);
            await setStoreApproval();

            await nftStore.connect(accounts.buyer1).purchaseNft(productNft.target.toString(), 1, { value: price + 1 });

            expect(await productNft.ownerOf(1)).to.equal(addresses.buyer1);
            expect(parseInt(await productNft.balanceOf(addresses.buyer1))).to.equal(1);
        });
    });
});