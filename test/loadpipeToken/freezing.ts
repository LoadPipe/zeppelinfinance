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

async function getVersionString(contract: any): Promise<string> {
    const version = await contract.version();
    return `${parseInt(version[0])}.${parseInt(version[1])}`;
}

describe("LoadpipeToken: Freeze", function () {
    let securityManager: SecurityManager;
    let loadpipeToken: any;
    let addresses: any = {}
    const initial_supply = 1000000000;

    this.beforeEach(async function () {
        addresses = await getTestAddresses(['admin'])
        securityManager = await deploySecurityManager(addresses.admin);
        loadpipeToken = await deployLoadpipeToken(securityManager.target, initial_supply);

        await securityManager.grantRole(constants.roles.upgrader, addresses.admin);
    });

    it("freeze v1", async function () {
        await loadpipeToken.freeze();

        //test that upgrade cannot be done
        await expectRevert(
            () => upgradeProxy(loadpipeToken.target, "LoadpipeTokenV2"),
            "UpgradeFrozen()"
        ); 
    });

    it("freeze v2", async function () {
        const newTokenV2 = await upgradeProxy(loadpipeToken.target, "LoadpipeTokenV2");
        await newTokenV2.freeze();

        //test that upgrade cannot be done
        await expectRevert(
            () => upgradeProxy(newTokenV2.target, "LoadpipeTokenV3"),
            "UpgradeFrozen()"
        ); 
    });
});