import { expect } from "chai";
import * as constants from "../constants";
import { SecurityManager, Whitelist } from "typechain";
import {
    getTestAccounts,
    deploySecurityManager,
    deployWhitelist
} from "../utils";

describe("SecurityManager: Set Whitelists", function () {
    let securityManager: SecurityManager;
    let buyerWhitelist: Whitelist;
    let sellerWhitelist: Whitelist;
    let addresses: any = {};

    this.beforeEach(async function () {
        let acc = await getTestAccounts(['admin', 'nonAdmin1', 'nonAdmin2']);
        addresses = acc.addresses;

        securityManager = await deploySecurityManager(addresses.admin);
        buyerWhitelist = await deployWhitelist(securityManager.target);
        sellerWhitelist = await deployWhitelist(securityManager.target);
    });

    describe("Set Whitelists", function () {
        it("can set buyer whitelist", async function () {
            expect(await securityManager.buyerWhitelist()).to.equal(constants.addresses.zeroAddress);
            await securityManager.setBuyerWhitelist(buyerWhitelist.target.toString());
            expect(await securityManager.buyerWhitelist()).to.equal(buyerWhitelist.target.toString());
        });

        it("can set seller whitelist", async function () {
            expect(await securityManager.sellerWhitelist()).to.equal(constants.addresses.zeroAddress);
            await securityManager.setSellerWhitelist(sellerWhitelist.target.toString());
            expect(await securityManager.sellerWhitelist()).to.equal(sellerWhitelist.target.toString());
        });
    });
});