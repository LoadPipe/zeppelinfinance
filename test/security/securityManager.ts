import { expect } from "chai";
import * as constants from "../constants";
import { ProductNft, SecurityManager } from "typechain";
import { 
    getTestAccounts, 
    deploySecurityManager,
    expectEvent, 
    expectRevert, 
    grantRole,
    deployProductNft
} from "../utils";

describe("SecurityManager", function () {
    let securityManager: SecurityManager;
    let productNft: ProductNft;
    let addresses: any = { };
    let accounts: any = { };
    
    this.beforeEach(async function () {
        let acc = await getTestAccounts(['admin', 'nonAdmin1', 'nonAdmin2' ]);
        addresses = acc.addresses;
        accounts = acc.accounts;
        
        securityManager = await deploySecurityManager(addresses.admin);
        productNft = await deployProductNft(securityManager.target, accounts.admin);
    });

    describe("Construction", function () {
        it("initial state", async function () {
            expect(await securityManager.hasRole(constants.roles.admin, addresses.admin)).to.be.true;
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin1)).to.be.false;
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin2)).to.be.false;

            expect(await securityManager.buyerWhitelist()).to.equal(constants.addresses.zeroAddress);
            expect(await securityManager.sellerWhitelist()).to.equal(constants.addresses.zeroAddress);
        }); 

        it("can grant admin to a different address at construction", async function () {
            const secMan = await deploySecurityManager(addresses.nonAdmin1);
            
            expect(await secMan.hasRole(constants.roles.admin, addresses.admin)).to.be.false;
            expect(await secMan.hasRole(constants.roles.admin, addresses.nonAdmin1)).to.be.true;
            expect(await secMan.hasRole(constants.roles.admin, addresses.nonAdmin2)).to.be.false;
        });
    });


    describe("Restrictions", function () {

        this.beforeEach(async function () {
            await grantRole(securityManager, constants.roles.upgrader, addresses.admin, accounts.admin);
            await grantRole(securityManager, constants.roles.whitelistManager, addresses.admin, accounts.admin);
            await grantRole(securityManager, constants.roles.pauser, addresses.admin, accounts.admin);
            await grantRole(securityManager, constants.roles.nftIssuer, addresses.admin, accounts.admin);
        });

        it("cannot set zero address to security manager", async function () {
            await expectRevert(
                () => productNft.setSecurityManager(constants.addresses.zeroAddress),
                constants.errorMessages.ZERO_ADDRESS
            )
        });

        it("cannot set zero address to product nft security manager", async function () {
            await expectRevert(
                () => productNft.setSecurityManager(constants.addresses.zeroAddress),
                constants.errorMessages.ZERO_ADDRESS
            )
        });

        it("cannot set zero address to whitelist security manager", async function () {
            await expectRevert(
                () => productNft.setSecurityManager(constants.addresses.zeroAddress),
                constants.errorMessages.ZERO_ADDRESS
            )
        });

        it("cannot set bogus address for security manager", async function () {
            await expectRevert(
                () => productNft.setSecurityManager(productNft.target.toString()),
                constants.errorMessages.INVALID_CONTRACT_METHOD
            );
        });

        it("admin cannot renounce admin role", async function () {

            //admin has admin role
            expect(await securityManager.hasRole(constants.roles.admin, addresses.admin)).to.be.true;

            //try to renounce
            await securityManager.renounceRole(constants.roles.admin, addresses.admin);

            //role not renounced (should fail silently)
            expect(await securityManager.hasRole(constants.roles.admin, addresses.admin)).to.be.true;
        });

        it("admin can renounce non-admin role", async function () {

            //admin has role
            expect(await securityManager.hasRole(constants.roles.pauser, addresses.admin)).to.be.true;
            expect(await securityManager.hasRole(constants.roles.upgrader, addresses.admin)).to.be.true;

            //try to renounce
            await securityManager.renounceRole(constants.roles.pauser, addresses.admin);
            await securityManager.renounceRole(constants.roles.upgrader, addresses.admin);

            //role is renounced
            expect(await securityManager.hasRole(constants.roles.pauser, addresses.admin)).to.be.false;
            expect(await securityManager.hasRole(constants.roles.upgrader, addresses.admin)).to.be.false;
        });

        it("admin can revoke their own non-admin role", async function () {

            //admin has admin role
            expect(await securityManager.hasRole(constants.roles.pauser, addresses.admin)).to.be.true;
            expect(await securityManager.hasRole(constants.roles.upgrader, addresses.admin)).to.be.true;

            //try to renounce
            await securityManager.revokeRole(constants.roles.pauser, addresses.admin);
            await securityManager.revokeRole(constants.roles.upgrader, addresses.admin);

            //role is renounced
            expect(await securityManager.hasRole(constants.roles.pauser, addresses.admin)).to.be.false;
            expect(await securityManager.hasRole(constants.roles.upgrader, addresses.admin)).to.be.false;
        });

        it("admin cannot revoke their own admin role", async function () {

            //admin has admin role
            expect(await securityManager.hasRole(constants.roles.admin, addresses.admin)).to.be.true;

            //try to renounce
            await securityManager.revokeRole(constants.roles.admin, addresses.admin);

            //role not renounced (should fail silently)
            expect(await securityManager.hasRole(constants.roles.admin, addresses.admin)).to.be.true;
        });

        it("admin role can be revoked by another admin", async function () {

            //grant admin to another 
            await securityManager.grantRole(constants.roles.admin, addresses.nonAdmin1);

            //now both users are admin 
            expect(await securityManager.hasRole(constants.roles.admin, addresses.admin)).to.be.true;
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin1)).to.be.true;

            //2 admins enter, 1 admin leaves
            await securityManager.connect(accounts.nonAdmin1).revokeRole(constants.roles.admin, addresses.admin);

            //only one admin remains
            expect(await securityManager.hasRole(constants.roles.admin, addresses.admin)).to.be.false;
            expect(await securityManager.hasRole(constants.roles.admin, addresses.nonAdmin1)).to.be.true;
        });

        it("admin role can be transferred in two steps", async function () {

            const a = accounts.admin;
            const b = accounts.nonAdmin1;

            //beginning state: a is admin, b is not 
            expect(await securityManager.hasRole(constants.roles.admin, a.address)).to.be.true;
            expect(await securityManager.hasRole(constants.roles.admin, b.address)).to.be.false;

            //transfer in two steps 
            await securityManager.grantRole(constants.roles.admin, b.address);
            await securityManager.connect(b).revokeRole(constants.roles.admin, a.address);

            //beginning state: b is admin, a is not 
            expect(await securityManager.hasRole(constants.roles.admin, a.address)).to.be.false;
            expect(await securityManager.hasRole(constants.roles.admin, b.address)).to.be.true;

        });

        it("cannot renounce another address's role", async function () {
            await securityManager.grantRole(constants.roles.pauser, addresses.nonAdmin1);
            await securityManager.grantRole(constants.roles.pauser, addresses.nonAdmin2);

            expect(await securityManager.hasRole(constants.roles.pauser, addresses.nonAdmin1)).to.be.true;
            expect(await securityManager.hasRole(constants.roles.pauser, addresses.nonAdmin2)).to.be.true;

            await expectRevert(
                () => securityManager.connect(accounts.nonAdmin1).renounceRole(constants.roles.pauser, addresses.nonAdmin2),
                constants.errorMessages.ACCESS_CONTROL_RENOUNCE
            );

            await expectRevert(
                () => securityManager.connect(accounts.nonAdmin2).renounceRole(constants.roles.pauser, addresses.nonAdmin1),
                constants.errorMessages.ACCESS_CONTROL_RENOUNCE
            );

            await expect(securityManager.connect(accounts.nonAdmin1).renounceRole(constants.roles.pauser, addresses.nonAdmin1)).to.not.be.reverted;
            await expect(securityManager.connect(accounts.nonAdmin2).renounceRole(constants.roles.pauser, addresses.nonAdmin2)).to.not.be.reverted;
        });
    });
    //TODO: (TEST) shared security

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