import { expect } from "chai";
import {
    getTestAddresses,
    deploySecurityManager,
    deployNftPolicyFactory
} from "../utils";
import { NftPolicyFactory, SecurityManager } from "typechain";


describe("NftPolicyFactory: Construction", function () {
    let policyFactory: NftPolicyFactory;
    let securityManager: SecurityManager;
    let addresses: any = {};

    this.beforeEach(async function () {
        addresses = await getTestAddresses(['admin'])
        securityManager = await deploySecurityManager(addresses.admin);
        policyFactory = await deployNftPolicyFactory(securityManager.target);
    });

    describe("Construction", function () {
        it("initial property values", async function () {
            expect(await policyFactory.securityManager()).to.equal(securityManager.target);
        });
    });
});