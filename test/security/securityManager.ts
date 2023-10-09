import { expect } from "chai";
import * as constants from "../constants";
import { SecurityManager } from "typechain";
import { 
    getTestAccounts, 
    deploySecurityManager,
    expectEvent
} from "../utils";

describe("SecurityManager", function () {
    let securityManager: SecurityManager;
    let addresses: any = { };
    let accounts: any = { };
    
    this.beforeEach(async function () {
        let acc = await getTestAccounts(['admin', 'nonAdmin1', 'nonAdmin2' ]);
        addresses = acc.addresses;
        accounts = acc.accounts;
        
        securityManager = await deploySecurityManager(addresses.admin);
    });

    describe("Construction", function () {
        it("initial state", async function () {
            expect(await securityManager.hasRole(constants.roles.admin, addresses.admin)).to.be.true;
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin1)).to.be.false;
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin2)).to.be.false;
        }); 

        it("can grant admin to a different address at construction", async function () {
            const secMan = await deploySecurityManager(addresses.nonAdmin1);
            
            expect(await secMan.hasRole(constants.roles.admin, addresses.admin)).to.be.false;
            expect(await secMan.hasRole(constants.roles.admin, addresses.nonAdmin1)).to.be.true;
            expect(await secMan.hasRole(constants.roles.admin, addresses.nonAdmin2)).to.be.false;
        });
    });

    describe("Transfer Adminship", function () {
        it("can grant admin to self", async function () {
            await securityManager.grantRole(constants.roles.admin, addresses.admin);

            expect(await securityManager.hasRole(constants.roles.admin, addresses.admin)).to.be.true;
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin1)).to.be.false;
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin2)).to.be.false;
        });

        it("can transfer admin to another", async function () {
            await securityManager.grantRole(constants.roles.admin, addresses.nonAdmin1);

            //now there are two admins
            expect(await securityManager.hasRole(constants.roles.admin, addresses.admin)).to.be.true;
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin1)).to.be.true;
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin2)).to.be.false;

            await securityManager.connect(accounts.nonAdmin1).revokeRole(constants.roles.admin, addresses.admin);

            //now origin admin has had adminship revoked 
            expect(await securityManager.hasRole(constants.roles.admin, addresses.admin)).to.be.false;
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin1)).to.be.true;
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin2)).to.be.false;
        });

        it("can pass adminship along", async function () {
            await securityManager.grantRole(constants.roles.admin, addresses.nonAdmin1);
            await securityManager.connect(accounts.nonAdmin1).revokeRole(constants.roles.admin, addresses.admin);
            await securityManager.connect(accounts.nonAdmin1).grantRole(constants.roles.admin, addresses.nonAdmin2);
            await securityManager.connect(accounts.nonAdmin2).revokeRole(constants.roles.admin, addresses.nonAdmin1);
            
            //in the end, adminship has passed from admin to nonAdmin1 to nonAdmin2
            expect(await securityManager.hasRole(constants.roles.admin, addresses.admin)).to.be.false;
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin1)).to.be.false;
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin2)).to.be.true;
        });
    });

    describe("Events", function () {
        it("rolegranted event fires on grantRole", async () => {
            expectEvent(async () => await securityManager.grantRole(constants.roles.admin, addresses.nonAdmin1),
                "RoleGranted", [constants.roles.admin, addresses.nonAdmin1, addresses.admin]);
        });

        it("roleRevoked event fires on revokeRole", async () => {
            await securityManager.grantRole(constants.roles.admin, addresses.nonAdmin1);
            
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin1)).to.be.true;
            expectEvent(async () => await securityManager.revokeRole(constants.roles.admin, addresses.nonAdmin1),
                "RoleRevoked", [constants.roles.admin, addresses.nonAdmin1, addresses.admin]);
        });

        it("roleRevoked event fires on renounceRole", async () => {
            expectEvent(async () => await securityManager.renounceRole(constants.roles.admin, addresses.admin),
                "RoleRevoked", [constants.roles.admin, addresses.nonAdmin1, addresses.admin]);
        });
    });
});