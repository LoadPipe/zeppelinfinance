import { expect } from "chai";
import {
    getTestAddresses,
    deploySecurityManager,
    deployProductNftStore,
    expectRevert
} from "../utils";
import {
    ProductNftStore,
    SecurityManager
} from "typechain";
import * as constants from "../constants";


describe("ProductNftStore: Construction", function () {
    let securityManager: SecurityManager;
    let nftStore: ProductNftStore;

    let addresses: any = {}

    this.beforeEach(async function () {
        addresses = await getTestAddresses(['admin'])
        securityManager = await deploySecurityManager(addresses.admin);
        nftStore = await deployProductNftStore(securityManager.target);
    });

    describe("Construction", function () {
        it("initial property values", async function () {
            expect(await nftStore.securityManager()).to.equal(securityManager.target);
        });

        it("can't pass 0 address for securityManager", async function () {
            await expectRevert(
                () => deployProductNftStore(constants.addresses.zeroAddress),
                constants.errorMessages.ZERO_ADDRESS
            );
        });

        it("can't pass invalid address for securityManager", async function () {
            await expectRevert(
                () => deployProductNftStore(nftStore.target),
                constants.errorMessages.INVALID_CONTRACT_METHOD
            );
        });
    });
});