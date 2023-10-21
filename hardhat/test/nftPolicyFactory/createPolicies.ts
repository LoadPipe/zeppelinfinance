import { expect } from "chai";
import {
    getTestAddresses,
    deploySecurityManager,
    deployNftPolicyFactory,
    listenForEvent
} from "../utils";
import { NftPolicyFactory, SecurityManager } from "typechain";
import * as constants from "../constants";
import { ethers } from "hardhat";


describe("NftPolicyFactory: Create Policies", function () {
    let policyFactory: NftPolicyFactory;
    let securityManager: SecurityManager;
    let addresses: any = {};

    this.beforeEach(async function () {
        addresses = await getTestAddresses(['admin'])
        securityManager = await deploySecurityManager(addresses.admin);
        policyFactory = await deployNftPolicyFactory(securityManager.target);
        
        await securityManager.grantRole(constants.roles.nftSeller, addresses.admin);
    });

    describe("Create Policies", function () {
        it("create FinancingRewardPolicy", async function () {
            const percentageBps = 100;
            const inventoryLimit = 50; 
            const shared = true; 
            const fillOrKill = true;

            const eventOutput = await listenForEvent(
                policyFactory,
                "PolicyCreated",
                () => policyFactory.createFinancingRewardPolicy(percentageBps, inventoryLimit, shared, fillOrKill),
                ["creator", "policy"]
            );
            
            expect(eventOutput.creator).to.equal(addresses.admin); 
            
            //test properties of policy
            const policy = await ethers.getContractAt("FinancingRewardPolicy", eventOutput.policy); 
            expect(parseInt(await policy.percentageBps())).to.equal(percentageBps);
            expect(parseInt(await policy.inventoryLimit())).to.equal(inventoryLimit);
            expect(await policy.shared()).to.equal(shared);
            expect(await policy.isFillOrKill()).to.equal(fillOrKill);
            
            //test json values 
            const json = JSON.parse(await policy.getPolicyInfoJson());
            expect(json.policyType).to.equal("FinancingRewardPolicy");
            expect(json.percentageBps).to.equal(percentageBps);
            expect(json.inventoryLimit).to.equal(inventoryLimit);
            expect(json.shared).to.equal(shared);
            expect(json.fillOrKill).to.equal(fillOrKill); 
        });

        it("create AffiliateRewardPolicy", async function () {
            const percentageBps = 100;

            const eventOutput = await listenForEvent(
                policyFactory,
                "PolicyCreated",
                () => policyFactory.createAffiliateRewardPolicy(percentageBps),
                ["creator", "policy"]
            );

            expect(eventOutput.creator).to.equal(addresses.admin);

            //test properties of policy
            const policy = await ethers.getContractAt("AffiliateRewardPolicy", eventOutput.policy);
            expect(parseInt(await policy.percentageBps())).to.equal(percentageBps);

            //test json values 
            const json = JSON.parse(await policy.getPolicyInfoJson());
            expect(json.policyType).to.equal("AffiliateRewardPolicy");
            expect(json.percentageBps).to.equal(percentageBps); 
        });
    });
});