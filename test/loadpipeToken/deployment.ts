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
import { getProxyAdminFactory } from "@openzeppelin/hardhat-upgrades/dist/utils";

describe.only("LoadpipeToken: Deployment", function () {
    let securityManager: SecurityManager;
    let loadpipeToken: any;
    let addresses: any = {}
    let initial_supply = "1000000000000000000";

    this.beforeEach(async function () {
        addresses = await getTestAddresses(['admin'])
        securityManager = await deploySecurityManager(addresses.admin);
        loadpipeToken = await deployLoadpipeToken(securityManager.target, BigInt(initial_supply));
    });

    describe("Initial Values", function () {
        it("initial property values with initial supply", async function () {
            //properties
            expect(await loadpipeToken.symbol()).to.equal("LOAD");
            expect(await loadpipeToken.name()).to.equal("Loadpipe");
            expect(await loadpipeToken.frozen()).to.equal(false);
            expect(parseInt(await loadpipeToken.decimals())).to.equal(18);
            
            //version
            const version = (await loadpipeToken.version());
            expect(version.length).to.equal(2);
            expect(parseInt(version[0])).to.equal(1);
            expect(parseInt(version[1])).to.equal(0);
            
            //supply
            expect(await loadpipeToken.totalSupply()).to.equal(BigInt(initial_supply));
            expect(await loadpipeToken.balanceOf(addresses.admin)).to.equal(BigInt(initial_supply));
        });

        it("initial property values with zero initial supply", async function () {
            const token = await deployLoadpipeToken(securityManager.target);

            //properties
            expect(await token.symbol()).to.equal("LOAD");
            expect(await token.name()).to.equal("Loadpipe");
            expect(await token.frozen()).to.equal(false);
            expect(parseInt(await token.decimals())).to.equal(18);

            //supply
            expect(parseInt(await token.totalSupply())).to.equal(0);
            expect(parseInt(await token.balanceOf(addresses.admin))).to.equal(0);
        });
    });
});