import { expect } from "chai";
import {
    getTestAccounts,
    deploySecurityManager,
    deployZeppelinOracle,
    expectRevert
} from "../utils";
import * as constants from "../constants";
import { SecurityManager, ZeppelinOracle } from "typechain";


describe("ZeppelinOracle: Construction", function () {
    let securityManager: SecurityManager;
    let zeppelinOracle: ZeppelinOracle;
    let addresses: any = {};

    this.beforeEach(async function () {
        let acc = await getTestAccounts(['admin']);
        addresses = acc.addresses;

        securityManager = await deploySecurityManager(addresses.admin);
        zeppelinOracle = await deployZeppelinOracle(securityManager.target);
    });

    describe("Construction", function () {
        it("initial property values", async function () {
            expect(await zeppelinOracle.securityManager()).to.equal(securityManager.target);
            expect(await zeppelinOracle.paused()).to.be.false;
        });

        it("can't pass 0 address for securityManager", async function () {
            await expectRevert(
                () => deployZeppelinOracle(constants.addresses.zeroAddress),
                constants.errorMessages.ZERO_ADDRESS
            );
        });

        it("can't pass invalid address for securityManager", async function () {
            await expectRevert(
                () => deployZeppelinOracle(zeppelinOracle.target),
                constants.errorMessages.INVALID_CONTRACT_METHOD
            );
        });
    });
});