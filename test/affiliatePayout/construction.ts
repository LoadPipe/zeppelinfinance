import { expect } from "chai";
import {
    getTestAccounts,
    deploySecurityManager,
    deployAffiliatePayout,
    deployZeppelinOracle,
    expectRevert
} from "../utils";
import * as constants from "../constants";
import { AffiliatePayout, SecurityManager, ZeppelinOracle } from "typechain";


describe("AffiliatePayout: Construction", function () {
    let securityManager: SecurityManager;
    let affiliatePayout: AffiliatePayout;
    let zeppelinOracle: ZeppelinOracle;
    let addresses: any = {};

    this.beforeEach(async function () {
        let acc = await getTestAccounts(['admin']);
        addresses = acc.addresses;

        securityManager = await deploySecurityManager(addresses.admin);
        zeppelinOracle = await deployZeppelinOracle(securityManager.target);
        affiliatePayout = await deployAffiliatePayout(securityManager.target, zeppelinOracle.target);
    });

    describe("Construction", function () {
        it("initial property values", async function () {
            expect(await affiliatePayout.securityManager()).to.equal(securityManager.target);
        });

        it("can't pass 0 address for securityManager", async function () {
            await expectRevert(
                () => deployAffiliatePayout(constants.addresses.zeroAddress, zeppelinOracle.target),
                constants.errorMessages.ZERO_ADDRESS
            );
        });

        it("can't pass 0 address for zeppelin", async function () {
            await expectRevert(
                () => deployAffiliatePayout(securityManager.target, constants.addresses.zeroAddress),
                constants.errorMessages.ZERO_ADDRESS
            );
        });

        it("can't pass invalid address for securityManager", async function () {
            await expectRevert(
                () => deployAffiliatePayout(zeppelinOracle.target, zeppelinOracle.target),
                constants.errorMessages.INVALID_CONTRACT_METHOD
            );
        });
    });
});