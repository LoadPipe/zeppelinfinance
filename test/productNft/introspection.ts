import { expect } from "chai";
import { 
    getTestAddresses, 
    deploySecurityManager, 
    deployProductNft 
} from "../utils";
import { ProductNft, SecurityManager } from "typechain";
import * as constants from "../constants";


describe("ProductNft: Introspection", function () {
    let productNft: ProductNft;
    let securityManager: SecurityManager;

    let addresses: any = {}

    this.beforeEach(async function () {
        addresses = await getTestAddresses(['admin'])
        securityManager = await deploySecurityManager(addresses.admin);
        productNft = await deployProductNft(securityManager.target, addresses.admin);
    });

    describe("Supports Interfaces", function () {
        it("supports correct interfaces: IERC721", async function () {
            expect(await productNft.supportsInterface(constants.interfaceIds.IERC721)).to.equal(true);
        });

        it("supports correct interfaces: IERC165", async function () {
            expect(await productNft.supportsInterface(constants.interfaceIds.IERC165)).to.equal(true);
        });

        it("doesn't support incorrect interfaces", async function () {
            expect(await productNft.supportsInterface("0x00000000")).to.equal(false);
            expect(await productNft.supportsInterface(constants.interfaceIds.IERC20)).to.equal(false);
            expect(await productNft.supportsInterface(constants.interfaceIds.IERC2981)).to.equal(false);
            expect(await productNft.supportsInterface(constants.interfaceIds.IERC20Metadata)).to.equal(false);
        });
    });
});