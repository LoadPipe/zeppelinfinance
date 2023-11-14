import { expect } from "chai";
import { ethers } from "hardhat";
import * as constants from "../constants";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { LoadpipeToken, ProductNft, SecurityManager, SecurityManager__factory, Whitelist, ZeppelinOracle } from "typechain";
import {
    expectEvent,
    expectRevert,
    getTestAccounts,
    deploySecurityManager,
    deployWhitelist,
    deployProductNft,
    grantRole,
    revokeRole,
    deployLoadpipeToken,
    deployZeppelinOracle
} from "../utils";

/*
Roles 
------
ADMIN_ROLE 
WHITELIST_MANAGER_ROLE
PAUSER_ROLE 
UPGRADER_ROLE 
NFT_ISSUER_ROLE 
NFT_SELLER_ROLE 
TOKEN_MINTER_ROLE 
TOKEN_BURNER_ROLE
SYSTEM_ROLE 


ADMIN_ROLE 
- grant permissions 
- revoke permissions 
- set/change security manager

WHITELIST_MANAGER_ROLE
- set whitelist 
- add/remove whitelist 
- add/remove whitelist in bulk 
- turn whitelist on/off

PAUSER_ROLE 
- pause/unpause LoadpipeToken
- pause/unpause ZeppelinOracle

UPGRADER_ROLE 
- upgrade token 
- freeze token upgrading

NFT_ISSUER_ROLE 
- ProductNft.mint
- ProductNft.setField 
- ProductNft.setInstanceField 
- ProductNftFactory.createProductNft
- ProductNftStore.postForSale

NFT_SELLER_ROLE 
- ProductNftIssuer.attachNftPolicies (only token owner)
- ProductNftIssuer.postToStore (only token owner)
- ProductNftIssuer.mintNfts (only token owner)
- ProductNftIssuer.createNft 
- ProductNftStore.sellerWithdraw
- createAffiliateRewardPolicy
- createFinancingRewardPolicy

TOKEN_MINTER_ROLE 
- LoadpipeToken.mint

TOKEN_BURNER_ROLE
- LoadpipeToken.burn

SYSTEM_ROLE 
- ZeppelinOracle.setSalesData
- ZeppelinOracle.setAffiliateSales
*/

describe("SecurityManager: Roles", function () {
    let securityManager: SecurityManager;
    let productNft: ProductNft;
    let whitelist: Whitelist;
    let loadpipeToken: any;
    let zeppelinOracle: ZeppelinOracle;
    let addresses: any = {};
    let accounts: any = {};

    this.beforeEach(async function () {
        let acc = await getTestAccounts(['admin', 'addr1', 'addr2', 'addr3', 'whitelistManager', 'pauser', 'upgrader', 'nftIssuer', 'nftSeller', 'tokenMinter', 'tokenBurner']);
        addresses = acc.addresses;
        accounts = acc.accounts;

        securityManager = await deploySecurityManager(addresses.admin);
        productNft = await deployProductNft(securityManager.target, addresses.admin, "a", "b");
        whitelist = await deployWhitelist(securityManager.target);
        loadpipeToken = await deployLoadpipeToken(securityManager.target);
        zeppelinOracle = await deployZeppelinOracle(securityManager.target);

        //assign roles 
        await securityManager.grantRole(constants.roles.whitelistManager, addresses.whitelistManager);
        await securityManager.grantRole(constants.roles.pauser, addresses.pauser);
        await securityManager.grantRole(constants.roles.upgrader, addresses.upgrader);
        await securityManager.grantRole(constants.roles.nftIssuer, addresses.nftIssuer);
        await securityManager.grantRole(constants.roles.nftSeller, addresses.nftSeller);
        await securityManager.grantRole(constants.roles.tokenMinter, addresses.tokenMinter);
        //await securityManager.grantRole(constants.roles.tokenBurner, addresses.tokenBurner);
    });

    async function assertCan(func: any) {
        await expect(
            func()
        ).to.not.be.reverted;
    }

    async function assertCannot(func: any, expectedError: string) {
        await expectRevert(
            () => func(),
            expectedError
        );
    }

    async function hasExpectedRoles(account: HardhatEthersSigner, allowedRoles: string[]) {
        const roles: any = {};
        roles[constants.roles.admin] = false;
        roles[constants.roles.nftIssuer] = false;
        roles[constants.roles.nftSeller] = false;
        roles[constants.roles.pauser] = false;
        roles[constants.roles.upgrader] = false;
        roles[constants.roles.whitelistManager] = false;
        roles[constants.roles.system] = false;

        for (let r of allowedRoles) {
            roles[r] = true;
        };

        for (let r in roles) {
            if ((await securityManager.hasRole(r, account.address)) != roles[r]) {
                console.log(`security role ${r} expected ${roles[r]}`);
                return false;
            }
        }

        return true;
    }

    async function assertRoleCanBeGranted(account: HardhatEthersSigner, role: string) {
        expect(await securityManager.hasRole(role, account.address)).to.be.false;
        await securityManager.grantRole(role, account.address);
        expect(await securityManager.hasRole(role, account.address)).to.be.true;
    }

    async function assertRoleCanBeRevoked(account: HardhatEthersSigner, role: string) {
        expect(await securityManager.hasRole(role, account.address)).to.be.true;
        await securityManager.revokeRole(role, account.address);
        expect(await securityManager.hasRole(role, account.address)).to.be.false;
    }

    async function assertRoleCanBeRenounced(account: HardhatEthersSigner, role: string) {
        await securityManager.grantRole(role, account.address);
        expect(await securityManager.hasRole(role, account.address)).to.be.true;
        await securityManager.connect(account).renounceRole(role, account.address);
        expect(await securityManager.hasRole(role, account.address)).to.be.false;
    }

    async function assertSetWhitelistPermission(account: HardhatEthersSigner, expectAllowed: boolean = true) {
        //TODO: (TEST) fill this in
    }

    async function assertAddRemoveWhitelistPermission(account: HardhatEthersSigner, expectAllowed: boolean = true) {
        const func = async () => {
            await whitelist.connect(account).addRemoveWhitelist(addresses.addr1, true);
        }
        if (expectAllowed)
            await assertCan(func);
        else
            await assertCannot(
                func,
                "revert with unrecognized return data or custom error"
                //constants.errorMessages.CUSTOM_ACCESS_CONTROL(
                //    constants.roles.whitelistManager,
                //    account.address
                //)
            );
    }

    async function assertAddRemoveWhitelistBulkPermission(account: HardhatEthersSigner, expectAllowed: boolean = true) {
        const func = async () => {
            await whitelist.connect(account).addRemoveWhitelistBulk([addresses.addr1], true);
        }
        if (expectAllowed)
            await assertCan(func);
        else
            await assertCannot(
                func,
                "revert with unrecognized return data or custom error"
                //constants.errorMessages.CUSTOM_ACCESS_CONTROL(
                //    constants.roles.whitelistManager,
                //    account.address
                //)
            );
    }

    async function assertTurnWhitelistOnOffPermission(account: HardhatEthersSigner, expectAllowed: boolean = true) {
        const func = async () => {
            await whitelist.connect(account).setWhitelistOnOff(true);
        }
        if (expectAllowed)
            await assertCan(func);
        else
            await assertCannot(
                func,
                "revert with unrecognized return data or custom error"
                //constants.errorMessages.CUSTOM_ACCESS_CONTROL(
                //    constants.roles.whitelistManager,
                //    account.address
                //)
            );
    }

    //assert that account has permission to grant roles
    async function assertGrantRolePermission(account: HardhatEthersSigner, expectAllowed: boolean = true) {
        const func = async () => { await grantRole(securityManager, constants.roles.admin, addresses.addr1, account); }

        if (expectAllowed)
            await assertCan(func);
        else
            await assertCannot(
                func,
                constants.errorMessages.ACCESS_CONTROL
            );
    }

    //assert that account has permission to revoke roles
    async function assertRevokeRolePermission(account: HardhatEthersSigner, expectAllowed: boolean = true) {
        const role = constants.roles.admin;
        const func = async () => { await revokeRole(securityManager, role, addresses.addr1, account); }

        if (expectAllowed)
            await assertCan(func);
        else
            await assertCannot(
                func,
                constants.errorMessages.ACCESS_CONTROL
            );
    }

    //assert that account has permission to set security manager on a contract
    async function assertSetSecurityManagerPermission(contract: any, account: HardhatEthersSigner, expectAllowed: boolean = true) {
        const func = async () => { await contract.connect(account).setSecurityManager(await contract.securityManager()); }
        if (expectAllowed)
            await assertCan(func);
        else
            await assertCannot(
                func,
                "revert with unrecognized return data or custom error"
                //constants.errorMessages.CUSTOM_ACCESS_CONTROL(
                //    constants.roles.admin, account.address
                //)
            );
    }
    
    async function assertPausePermission(contract: any, account: HardhatEthersSigner, expectAllowed: boolean = true) {
        const func = async () => { await contract.connect(account).pause(); }
        if (expectAllowed)
            await assertCan(func);
        else
            await assertCannot(
                func,
                "revert with unrecognized return data or custom error"
                //constants.errorMessages.CUSTOM_ACCESS_CONTROL(
                //    constants.roles.admin, account.address
                //)
            );
    }
    
    async function assertUnpausePermission(contract: any, account: HardhatEthersSigner, expectAllowed: boolean = true) {
        const func = async () => { await contract.connect(account).unpause(); }
        if (expectAllowed)
            await assertCan(func);
        else
            await assertCannot(
                func,
                "revert with unrecognized return data or custom error"
                //constants.errorMessages.CUSTOM_ACCESS_CONTROL(
                //    constants.roles.admin, account.address
                //)
            );
    }
    
    


    //assert that account has all the permissions that an admin should have 
    async function assertAdminPermissions(account: HardhatEthersSigner, expectAllowed: boolean = true) {
        
        //can grant roles 
        await assertGrantRolePermission(account, expectAllowed);

        //can revoke roles 
        await assertRevokeRolePermission(account, expectAllowed);
        
        //can set/change security manager 
        await assertSetSecurityManagerPermission(productNft, account, expectAllowed);
        await assertSetSecurityManagerPermission(whitelist, account, expectAllowed);
    }

    //assert that account has all the permissions that a whitelist manager should have 
    async function assertWhitelistManagerPermissions(account: HardhatEthersSigner, expectAllowed: boolean = true) {
        
        //can set whitelist 
        await assertSetWhitelistPermission(account, expectAllowed);
        
        //can add/remove addresses to/from whitelist
        await assertAddRemoveWhitelistPermission(account, expectAllowed);
        
        //can add/remove addresses to/from whitelist in bulk 
        await assertAddRemoveWhitelistBulkPermission(account, expectAllowed);
        
        //can turn whitelist on/off
        await assertTurnWhitelistOnOffPermission(account, expectAllowed);
    }

    //assert that account has all the permissions that a pauser should have 
    async function assertPauserPermissions(account: HardhatEthersSigner, expectAllowed: boolean = true) {

        //can pause/unpause ZeppelinOracle
        await assertPausePermission(zeppelinOracle, account, expectAllowed);
        expect(await zeppelinOracle.paused()).to.equal(expectAllowed);
        await assertUnpausePermission(zeppelinOracle, account, expectAllowed);

        //can pause/unpause ZeppelinOracle
        await assertPausePermission(loadpipeToken, account, expectAllowed);
        expect(await loadpipeToken.paused()).to.equal(expectAllowed);
        await assertUnpausePermission(loadpipeToken, account, expectAllowed);
    }

    describe("Admin Role", function () {
        let primaryUser: any;
        let roleTested: string;

        beforeEach(async function () {
            roleTested = constants.roles.admin;
            primaryUser = accounts.addr2;

            await securityManager.grantRole(roleTested, primaryUser.address);
        });

        it("has correct roles", async function () {
            expect(await hasExpectedRoles(primaryUser, [roleTested])).to.be.true;
        });

        it("role can be granted", async function () {
            await assertRoleCanBeGranted(accounts.addr1, roleTested);
            await assertAdminPermissions(accounts.addr1);
        });

        it("role can be revoked", async function () {
            await assertRoleCanBeRevoked(primaryUser, roleTested);
            await assertAdminPermissions(primaryUser, false);
        });

        it("role can be renounced", async function () {
            await assertRoleCanBeRevoked(primaryUser, roleTested);
            await assertAdminPermissions(primaryUser, false);
        });

        it("admin has admin permissions", async function () {
            await assertAdminPermissions(primaryUser, true);
        });

        it("admin does not have whitelist manager permissions", async function () {
            await assertWhitelistManagerPermissions(primaryUser, false);
        });
    });

    describe("Whitelist Manager Role", function () {
        let primaryUser: any;
        let roleTested: string;

        beforeEach(async function () {
            roleTested = constants.roles.whitelistManager;
            primaryUser = accounts.whitelistManager;
        });

        it("has correct roles", async function () {
            expect(await hasExpectedRoles(primaryUser, [roleTested])).to.be.true;
        });

        it("role can be granted", async function () {
            await assertRoleCanBeGranted(accounts.addr1, roleTested);
            await assertWhitelistManagerPermissions(accounts.addr1);
        });

        it("role can be revoked", async function () {
            await assertRoleCanBeRevoked(primaryUser, roleTested);
            await assertWhitelistManagerPermissions(primaryUser, false);
        });

        it("role can be renounced", async function () {
            await assertRoleCanBeRenounced(accounts.addr1, roleTested);
            await assertWhitelistManagerPermissions(accounts.addr1, false);
        });

        it("whitelist manager has whitelist manager permissions", async function () {
            await assertWhitelistManagerPermissions(primaryUser, true);
        });

        it("whitelist manager does not have admin permissions", async function () {
            await assertAdminPermissions(primaryUser, false);
        });
    });

    describe("Pauser Role", function () {
        let primaryUser: any;
        let roleTested: string;

        beforeEach(async function () {
            roleTested = constants.roles.pauser;
            primaryUser = accounts.pauser;
        });

        it("has correct roles", async function () {
            expect(await hasExpectedRoles(primaryUser, [roleTested])).to.be.true;
        });

        it("role can be granted", async function () {
            await assertRoleCanBeGranted(accounts.addr1, roleTested);
            await assertPauserPermissions(accounts.addr1);
        });

        it("role can be revoked", async function () {
            await assertRoleCanBeRevoked(primaryUser, roleTested);
            await assertPauserPermissions(primaryUser, false);
        });

        it("role can be renounced", async function () {
            await assertRoleCanBeRenounced(accounts.addr1, roleTested);
            await assertPauserPermissions(accounts.addr1, false);
        });

        it("pauser has pauser permissions", async function () {
            await assertPauserPermissions(primaryUser, true);
        });

        it("pauser does not have admin permissions", async function () {
            await assertAdminPermissions(primaryUser, false);
        });
    });

    describe("Minter Role", function () {
    });

    //TODO: (TEST) other roles
});