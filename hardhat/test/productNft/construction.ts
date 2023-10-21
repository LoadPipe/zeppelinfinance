import { expect } from "chai";
import { 
    getTestAddresses, 
    deploySecurityManager, 
    deployProductNft 
} from "../utils";
import { ProductNft, SecurityManager } from "typechain";


describe("ProductNft: Construction", function () {
    let productNft: ProductNft;
    let securityManager: SecurityManager;
    let addresses: any = {}
    const nftName = "ProductNFT"; 
    const nftSymbol = "PNFT";

    this.beforeEach(async function () {
        addresses = await getTestAddresses(['admin'])
        securityManager = await deploySecurityManager(addresses.admin); 
        productNft = await deployProductNft(securityManager.target, addresses.admin, nftName, nftSymbol);
    });

    describe("Construction", function () {
        it("initial property values", async function () {
            expect(await productNft.name()).to.equal(nftName);
            expect(await productNft.symbol()).to.equal(nftSymbol);
            expect(await productNft.securityManager()).to.equal(securityManager.target);
        });
    });
});