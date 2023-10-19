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
        it("initial property values default", async function () {
            expect(await policyFactory.securityManager()).to.equal(securityManager.target);
            expect(parseInt(await policyFactory.policiesTableId())).to.equal(0);
            expect(await policyFactory.supportsTableland()).to.equal(false);
            expect(await policyFactory.policiesTablePrefix()).to.equal("");
        });

        it("initial property values with tableland", async function () {
            const policyFactory2 = await deployNftPolicyFactory(securityManager.target, true, "policies", 11);
            
            expect(await policyFactory2.securityManager()).to.equal(securityManager.target);
            expect(parseInt(await policyFactory2.policiesTableId())).to.equal(11);
            expect(await policyFactory2.supportsTableland()).to.equal(true);
            expect(await policyFactory2.policiesTablePrefix()).to.equal("policies");
        });
    });
});