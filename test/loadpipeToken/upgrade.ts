import { expect } from "chai";
import {
    getTestAddresses,
    deploySecurityManager,
    deployLoadpipeToken,
    expectRevert
} from "../utils";
import {
    LoadpipeToken,
    SecurityManager
} from "typechain";
import { upgradeProxy } from "../../scripts/lib/deployment";
import * as constants from "../constants";
import { token } from "typechain/@openzeppelin/contracts";

async function getVersionString(contract: any) : Promise<string> {
    const version = await contract.version(); 
    return `${parseInt(version[0])}.${parseInt(version[1])}`; 
}

describe("LoadpipeToken: Upgrade", function () {
    let securityManager: SecurityManager;
    let loadpipeToken: any;
    let addresses: any = {}
    const initial_supply = 1000000000; 

    this.beforeEach(async function () {
        addresses = await getTestAddresses(['admin', 'user1'])
        securityManager = await deploySecurityManager(addresses.admin);
        loadpipeToken = await deployLoadpipeToken(securityManager.target, initial_supply);
        
        await securityManager.grantRole(constants.roles.upgrader, addresses.admin);
        await securityManager.grantRole(constants.roles.tokenMinter, addresses.admin);
        await securityManager.grantRole(constants.roles.pauser, addresses.admin);
    });
    
    it("upgrade version v2", async function () {
        expect(await getVersionString(loadpipeToken)).to.equal("1.0");
        const newToken = await upgradeProxy(loadpipeToken.target, "LoadpipeTokenV2"); 
        expect(await getVersionString(newToken)).to.equal("2.1");
    });

    it("upgrade behavior v2: not pausable", async function () {

        //can pause original 
        await loadpipeToken.pause(); 
        expect(await loadpipeToken.paused()).to.be.true;
        await loadpipeToken.unpause();
        expect(await loadpipeToken.paused()).to.be.false;

        //cannot pause V2
        const newToken = await upgradeProxy(loadpipeToken.target, "LoadpipeTokenV2");
        
        await expectRevert(
            () => newToken.pause(), 
            "NotPausable()"
        );
    });

    it("upgrade behavior v2: transferable", async function () {
        const newToken = await upgradeProxy(loadpipeToken.target, "LoadpipeTokenV2");
        const transferAmount = 100000;

        expect(parseInt(await newToken.balanceOf(addresses.admin))).to.equal(initial_supply);
        await newToken.transfer(addresses.user1, transferAmount);
        expect(parseInt(await newToken.balanceOf(addresses.admin))).to.equal(initial_supply - transferAmount);
        expect(parseInt(await newToken.balanceOf(addresses.user1))).to.equal(transferAmount);
    });

    it("upgrade behavior v2: balances remain", async function () {
        const transferAmount = 100000;
        
        await loadpipeToken.transfer(addresses.user1, transferAmount);
        const newToken = await upgradeProxy(loadpipeToken.target, "LoadpipeTokenV2");

        expect(parseInt(await newToken.balanceOf(addresses.admin))).to.equal(initial_supply - transferAmount);
        expect(parseInt(await newToken.balanceOf(addresses.user1))).to.equal(transferAmount);
    });

    it("upgrade version v2 -> v3", async function () {
        expect(await getVersionString(loadpipeToken)).to.equal("1.0");
        const newTokenV2 = await upgradeProxy(loadpipeToken.target, "LoadpipeTokenV2");
        expect(await getVersionString(newTokenV2)).to.equal("2.1");
        const newTokenV3 = await upgradeProxy(newTokenV2.target, "LoadpipeTokenV3");
        expect(await getVersionString(newTokenV2)).to.equal("3.0");
    });

    it("upgrade behavior v2 -> v3: not transferable", async function () {
        const newTokenV2 = await upgradeProxy(loadpipeToken.target, "LoadpipeTokenV2");
        const newTokenV3 = await upgradeProxy(newTokenV2.target, "LoadpipeTokenV3");
        
        //test that transfers cannot be done
        await expectRevert(
            () => newTokenV3.transfer(addresses.user1, 100), 
            "NotTransferable()"
        );
    });

    it("upgrade behavior v2 -> v3: not upgradeable", async function () {
        const newTokenV2 = await upgradeProxy(loadpipeToken.target, "LoadpipeTokenV2");
        const newTokenV3 = await upgradeProxy(newTokenV2.target, "LoadpipeTokenV3");

        //test that upgrade cannot be done
        await expectRevert(
            () => upgradeProxy(newTokenV2.target, "LoadpipeTokenV2"), 
            "UpgradeFrozen()"
        ); 
    });

    it("upgrade behavior v2 -> v3: pausable", async function () {
        const newTokenV2 = await upgradeProxy(loadpipeToken.target, "LoadpipeTokenV2");
        const newTokenV3 = await upgradeProxy(newTokenV2.target, "LoadpipeTokenV3");

        await newTokenV3.pause();
        expect(await newTokenV3.paused()).to.equal(true);
    });

    it("upgrade behavior v3: balances remain", async function () {
        const transferAmount = 100000;

        await loadpipeToken.transfer(addresses.user1, transferAmount);
        const newTokenV2 = await upgradeProxy(loadpipeToken.target, "LoadpipeTokenV2");
        const newTokenV3 = await upgradeProxy(newTokenV2.target, "LoadpipeTokenV3");

        expect(parseInt(await newTokenV3.balanceOf(addresses.admin))).to.equal(initial_supply - transferAmount);
        expect(parseInt(await newTokenV3.balanceOf(addresses.user1))).to.equal(transferAmount);
    });
});