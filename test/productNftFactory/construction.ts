import { expect } from "chai";
import {
    getTestAddresses,
    deploySecurityManager,
    deployProductNftFactory,
    expectRevert
} from "../utils";
import {
    ProductNftFactory,
    SecurityManager
} from "typechain";
import * as constants from "../constants";


describe("ProductNftFactory: Construction", function () {
    let securityManager: SecurityManager;
    let nftFactory: ProductNftFactory;
    let addresses: any = {}

    this.beforeEach(async function () {
        addresses = await getTestAddresses(['admin'])
        securityManager = await deploySecurityManager(addresses.admin);
        nftFactory = await deployProductNftFactory(securityManager.target);
    });

    describe("Construction", function () {
        it("initial property values", async function () {
            expect(await nftFactory.securityManager()).to.equal(securityManager.target);
        });

        it("can't pass 0 address for securityManager", async function () {
            await expectRevert(
                () => deployProductNftFactory(constants.addresses.zeroAddress),
                constants.errorMessages.ZERO_ADDRESS
            );
        });

        it("can't pass invalid address for securityManager", async function () {
            await expectRevert(
                () => deployProductNftFactory(nftFactory.target),
                constants.errorMessages.INVALID_CONTRACT_METHOD
            );
        });
    });
});