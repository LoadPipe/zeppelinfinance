import { expect } from "chai";
import {
    getTestAccounts,
    deploySecurityManager,
    deployZeppelinOracle,
    expectRevert,
    listenForEvent
} from "../utils";
import { ethers } from "ethers";
import * as constants from "../constants";
import { SecurityManager, ZeppelinOracle } from "typechain";


describe("ZeppelinOracle: Pausable", function () {
    let securityManager: SecurityManager;
    let zeppelinOracle: ZeppelinOracle;
    let addresses: any = {};
    let accounts: any = {};

    this.beforeEach(async function () {
        let acc = await getTestAccounts(['admin', 'pauser']);
        addresses = acc.addresses;
        accounts = acc.accounts;

        securityManager = await deploySecurityManager(addresses.admin);
        zeppelinOracle = await deployZeppelinOracle(securityManager.target);

        await securityManager.grantRole(constants.roles.pauser, addresses.pauser);
        await securityManager.grantRole(constants.roles.system, addresses.admin);
    });

    describe("Pausing and Unpausing", function () {
        it("pauser can pause", async function () {
            expect(await zeppelinOracle.paused()).to.be.false;
            await zeppelinOracle.connect(accounts.pauser).pause();
            expect(await zeppelinOracle.paused()).to.be.true;
        });

        it("pauser can pause and unpause", async function () {
            await zeppelinOracle.connect(accounts.pauser).pause();
            expect(await zeppelinOracle.paused()).to.be.true;

            await zeppelinOracle.connect(accounts.pauser).unpause();
            expect(await zeppelinOracle.paused()).to.be.false;
        });
    });

    describe("Effects of Pausing", function () {
        it("cannot pause when paused", async function () {
            await zeppelinOracle.connect(accounts.pauser).pause();

            await expectRevert(
                () => zeppelinOracle.connect(accounts.pauser).pause(),
                constants.errorMessages.PAUSED
            );
        });

        it("cannot unpause when not paused", async function () {
            await expectRevert(
                () => zeppelinOracle.connect(accounts.pauser).unpause(),
                constants.errorMessages.NOT_PAUSED
            );
        });

        it("cannot push sales data when paused", async function () {
            await zeppelinOracle.connect(accounts.pauser).pause();

            await expectRevert(
                () => zeppelinOracle.setSalesData(ethers.keccak256(ethers.toUtf8Bytes("Product ID")), 1000, 100000),
                constants.errorMessages.PAUSED
            );
        });

        it("cannot push affiliate data when paused", async function () {
            await zeppelinOracle.connect(accounts.pauser).pause();

            await expectRevert(
                () => zeppelinOracle.setAffiliateSales(ethers.keccak256(ethers.toUtf8Bytes("Affiliate ID")), 1000),
                constants.errorMessages.PAUSED
            );
        });
    });

    describe("Events", function () {
        it("pausing emits Paused", async function () {
            const eventOutput = await listenForEvent(
                zeppelinOracle,
                "Paused",
                () => zeppelinOracle.connect(accounts.pauser).pause(),
                ["sender"]
            );

            expect(eventOutput.eventFired).to.be.true;
            expect(eventOutput.sender).to.equal(addresses.pauser);
        });

        it("unpausing emits Unpaused", async function () {
            await zeppelinOracle.connect(accounts.pauser).pause();

            const eventOutput = await listenForEvent(
                zeppelinOracle,
                "Unpaused",
                () => zeppelinOracle.connect(accounts.pauser).unpause(),
                ["sender"]
            );

            expect(eventOutput.eventFired).to.be.true;
            expect(eventOutput.sender).to.equal(addresses.pauser);
        });
    });
});