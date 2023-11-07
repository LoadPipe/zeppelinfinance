import { expect } from "chai";
import {
    getTestAddresses,
    deploySecurityManager,
    deployLoadpipeToken
} from "../utils";
import {
    LoadpipeToken,
    SecurityManager
} from "typechain";
import * as constants from "../constants";

describe("LoadpipeToken: Introspection", function () {
    let securityManager: SecurityManager;
    let loadpipeToken: any;
    let addresses: any = {}

    this.beforeEach(async function () {
        addresses = await getTestAddresses(['admin'])
        securityManager = await deploySecurityManager(addresses.admin);
        loadpipeToken = await deployLoadpipeToken(securityManager.target);
    });

    describe("Supports Interfaces", function () {
        it("supports correct interfaces: IERC20", async function () {
            expect(await loadpipeToken.supportsInterface(constants.interfaceIds.IERC20)).to.equal(true);
        });

        it("supports correct interfaces: IERC165", async function () {
            expect(await loadpipeToken.supportsInterface(constants.interfaceIds.IERC165)).to.equal(true);
        });

        it("doesn't support incorrect interfaces", async function () {
            expect(await loadpipeToken.supportsInterface("0x00000000")).to.equal(false);
            expect(await loadpipeToken.supportsInterface(constants.interfaceIds.IERC721)).to.equal(false);
            expect(await loadpipeToken.supportsInterface(constants.interfaceIds.IERC2981)).to.equal(false);
            expect(await loadpipeToken.supportsInterface(constants.interfaceIds.IERC20Metadata)).to.equal(false);
        });
    });
});