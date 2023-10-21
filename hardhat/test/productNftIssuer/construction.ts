import { expect } from "chai";
import {
    getTestAddresses,
    deploySecurityManager,
    deployProductNftFactory,
    deployProductNftIssuer,
    expectRevert
} from "../utils";
import {
    ProductNftFactory,
    ProductNftIssuer,
    SecurityManager
} from "typechain";
import * as constants from "../constants";


describe("ProductNftIssuer: Construction", function () {
    let securityManager: SecurityManager;
    let nftFactory: ProductNftFactory;
    let nftIssuer: ProductNftIssuer;

    let addresses: any = {}

    this.beforeEach(async function () {
        addresses = await getTestAddresses(['admin'])
        securityManager = await deploySecurityManager(addresses.admin);
        nftFactory = await deployProductNftFactory(securityManager.target);
        nftIssuer = await deployProductNftIssuer(securityManager.target, nftFactory.target);
    });

    describe("Construction", function () {
        it("initial property values", async function () {
            expect(await nftIssuer.securityManager()).to.equal(securityManager.target);
            expect(await nftIssuer.nftFactory()).to.equal(nftFactory.target);
        });

        it("can't pass 0 address for securityManager", async function () {
            await expectRevert(
                () => deployProductNftIssuer(constants.addresses.zeroAddress, nftFactory.target),
                constants.errorMessages.ZERO_ADDRESS
            );
        });

        it("can't pass invalid address for securityManager", async function () {
            await expectRevert(
                () => deployProductNftIssuer(nftFactory.target, nftFactory.target),
                constants.errorMessages.INVALID_CONTRACT_METHOD
            );
        });
    });
});