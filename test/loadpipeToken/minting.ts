import { expect } from "chai";
import {
    deploySecurityManager,
    deployLoadpipeToken,
    getTestAccounts,
    expectRevert,
    listenForEvent
} from "../utils";
import {
    LoadpipeToken,
    SecurityManager
} from "typechain";
import * as constants from "../constants";

describe("LoadpipeToken: Minting", function () {
    let securityManager: SecurityManager;
    let token: any;
    let addresses: any = {}
    let accounts: any = {}
    let initial_supply = "1000000000000000000";

    this.beforeEach(async function () {
        const acc = await getTestAccounts(['admin', 'minter', 'user']);
        addresses = acc.addresses;
        accounts = acc.accounts;
        securityManager = await deploySecurityManager(addresses.admin);
        token = await deployLoadpipeToken(securityManager.target, BigInt(initial_supply));
        
        await securityManager.grantRole(constants.roles.tokenMinter, addresses.minter);
    });

    describe("Authorized Minting", function () {
        it("minter can mint to self", async function () {
            const quantity = 25000;
            const initialBalance = parseInt(await token.balanceOf(addresses.minter));
            const initialSupply = parseInt(await token.totalSupply());
            await token.connect(accounts.minter).mint(addresses.minter, quantity);

            //user balance and total supply have both increased 
            expect(parseInt(await token.balanceOf(addresses.minter))).to.equal(initialBalance + quantity);
            expect(parseInt(await token.totalSupply())).to.equal(initialSupply + quantity); 
        });

        it("minter can mint to another address", async function () {
            const quantity = 25000;
            const initialBalance = parseInt(await token.balanceOf(addresses.user));
            const initialSupply = parseInt(await token.totalSupply());
            await token.connect(accounts.minter).mint(addresses.user, quantity);

            //user balance and total supply have both increased 
            expect(parseInt(await token.balanceOf(addresses.user))).to.equal(initialBalance + quantity);
            expect(parseInt(await token.totalSupply())).to.equal(initialSupply + quantity); 
        });

        it("cannot mint to zero address", async function () {
            await expectRevert(
                () => token.connect(accounts.minter).mint(constants.addresses.zeroAddress, 1), 
                //TODO: (TEST) get the actual error msg here
            );
        });
    });

    describe("Events", function () {

        it("minting to another emits Transfer", async function () {
            const transferAmount = 10000;
            const eventOutput = await listenForEvent(
                token,
                "Transfer",
                () => token.connect(accounts.minter).mint(addresses.user, transferAmount),
                ["from", "to", "amount"]
            );

            expect(eventOutput.eventFired).to.be.true;
            expect(eventOutput.from).to.equal(constants.addresses.zeroAddress);
            expect(eventOutput.to).to.equal(addresses.user);
            expect(parseInt(eventOutput.amount)).to.equal(transferAmount);
        });

        it("minting to self emits Transfer", async function () {
            const transferAmount = 10000;
            const eventOutput = await listenForEvent(
                token,
                "Transfer",
                () => token.connect(accounts.minter).mint(addresses.minter, transferAmount),
                ["from", "to", "amount"]
            );

            expect(eventOutput.eventFired).to.be.true;
            expect(eventOutput.from).to.equal(constants.addresses.zeroAddress);
            expect(eventOutput.to).to.equal(addresses.minter);
            expect(parseInt(eventOutput.amount)).to.equal(transferAmount);
        });
    });
});