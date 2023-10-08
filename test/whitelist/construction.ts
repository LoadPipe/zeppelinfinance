import { expect } from "chai";
import {
    getTestAccounts,
    deploySecurityManager,
    deployWhitelist, 
    expectRevert
} from "../utils";
import * as constants from "../constants";
import { SecurityManager, Whitelist } from "typechain";


describe("Whitelist: Construction", function () {
    let whitelist: Whitelist;
    let securityManager: SecurityManager;
    let addresses: any = {};
    let accounts: any = {};

    this.beforeEach(async function () {
        let acc = await getTestAccounts(['admin', 'addr1', 'addr2', 'whitelistManager', 'whitelisted', 'nonWhitelisted']);
        addresses = acc.addresses;
        accounts = acc.accounts;
        
        securityManager = await deploySecurityManager(addresses.admin);
        whitelist = await deployWhitelist(securityManager.target);
        
        //assign roles 
        await securityManager.grantRole(constants.roles.whitelistManager, addresses.whitelistManager);
    });

    describe("Construction", function () {
        it("initial property values", async function () {
            expect(await whitelist.whitelistOn()).to.equal(true);
            expect(await whitelist.securityManager()).to.equal(securityManager.target);
        });

        it("nobody is whitelisted", async function () {
            expect(await whitelist.isWhitelisted(addresses.admin)).to.equal(false);
            expect(await whitelist.isWhitelisted(addresses.whitelistManager)).to.equal(false);
            expect(await whitelist.isWhitelisted(addresses.whitelisted)).to.equal(false);
            expect(await whitelist.isWhitelisted(addresses.nonWhitelisted)).to.equal(false);
            expect(await whitelist.isWhitelisted(addresses.addr1)).to.equal(false);
            expect(await whitelist.isWhitelisted(addresses.addr2)).to.equal(false);
        });
        
        it("can't pass zero address for security manager", async function () {
            await expectRevert(
                () => deployWhitelist(constants.addresses.zeroAddress),
                constants.errorMessages.ZERO_ADDRESS
            );
        });

        it("can't pass bogus security manager", async function () {
            await expectRevert(
                () => deployWhitelist(whitelist.target),
                constants.errorMessages.FUNCTION_NOT_RECOGNIZED
            );
        });
    });
    
    //TODO: (TEST) test for specific abilities (things you can/can't do when whitelisted)
});