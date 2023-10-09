import { expect } from "chai";
import {
    getTestAccounts,
    deploySecurityManager,
    deployWhitelist,
    listenForEvent,
    expectRevert
} from "../utils";
import * as constants from "../constants";
import { SecurityManager, Whitelist } from "typechain";


describe("Whitelist: Adding/Removing", function () {
    let whitelist: Whitelist;
    let securityManager: SecurityManager;
    let addresses: any = {};
    let accounts: any = {};

    this.beforeEach(async function () {
        let acc = await getTestAccounts(['admin', 'addr1', 'addr2', 'whitelistManager', 'whitelisted', 'nonWhitelisted']);
        addresses = acc.addresses;
        accounts = acc.accounts;

        securityManager = await deploySecurityManager(addresses.admin);
        whitelist = await deployWhitelist(securityManager.target);

        //assign roles 
        await securityManager.grantRole(constants.roles.whitelistManager, addresses.whitelistManager);
    });
    
    describe("Whitelist on/off", function () {
        it("can turn whitelist off", async function () {
            expect(await whitelist.whitelistOn()).to.equal(true);
            await whitelist.connect(accounts.whitelistManager).setWhitelistOnOff(false);
            expect(await whitelist.whitelistOn()).to.equal(false);
        });

        it("can turn whitelist on", async function () {
            await whitelist.connect(accounts.whitelistManager).setWhitelistOnOff(false);
            expect(await whitelist.whitelistOn()).to.equal(false);
            await whitelist.connect(accounts.whitelistManager).setWhitelistOnOff(true);
            expect(await whitelist.whitelistOn()).to.equal(true);
        });
    });

    describe("Adding/removing Addresses", function () {
        it("add single addresses", async function () {
            //expect not whitelisted
            expect(await whitelist.isWhitelisted(addresses.addr1)).to.be.false;
            expect(await whitelist.isWhitelisted(addresses.addr2)).to.be.false;

            //add to whitelist 
            await whitelist.connect(accounts.whitelistManager).addRemoveWhitelist(addresses.addr1, true);
            await whitelist.connect(accounts.whitelistManager).addRemoveWhitelist(addresses.addr2, true);

            //expect whitelisted 
            expect(await whitelist.isWhitelisted(addresses.addr1)).to.be.true;
            expect(await whitelist.isWhitelisted(addresses.addr2)).to.be.true;
        });

        it("remove single addresses", async function () {
            //add to whitelist
            await whitelist.connect(accounts.whitelistManager).addRemoveWhitelist(addresses.addr1, true);
            await whitelist.connect(accounts.whitelistManager).addRemoveWhitelist(addresses.addr2, true);

            //expect whitelisted 
            expect(await whitelist.isWhitelisted(addresses.addr1)).to.be.true;
            expect(await whitelist.isWhitelisted(addresses.addr2)).to.be.true;

            //remove from whitelist 
            await whitelist.connect(accounts.whitelistManager).addRemoveWhitelist(addresses.addr1, false);
            await whitelist.connect(accounts.whitelistManager).addRemoveWhitelist(addresses.addr2, false);

            //expect not whitelisted
            expect(await whitelist.isWhitelisted(addresses.addr1)).to.be.false;
            expect(await whitelist.isWhitelisted(addresses.addr2)).to.be.false;
        });

        it("add multiple addresses", async function () {
            const addrs = Object.keys(addresses).map((a: string) => addresses[a]); 

            //add an array 
            await whitelist.connect(accounts.whitelistManager).addRemoveWhitelistBulk(addrs, true);

            //check that each one is added 
            for (let n = 0; n < addrs.length; n++) {
                expect(await whitelist.isWhitelisted(addrs[n])).to.be.true;
            }
        });

        it("remove multiple addresses", async function () {
            const addrs = Object.keys(addresses).map((a: string) => addresses[a]); 
            
            //add an array 
            await whitelist.connect(accounts.whitelistManager).addRemoveWhitelistBulk(addrs, true);

            //choose a subset to remove 
            const toRemove = addrs.slice(3, 10);

            //remove them
            await whitelist.connect(accounts.whitelistManager).addRemoveWhitelistBulk(toRemove, false);

            //check that each one is removed 
            for (let n = 0; n < addrs.length; n++) {
                expect(await whitelist.isWhitelisted(addrs[n])).to.equal(n < 3 || n >= 10);
            }

            //remove the rest
            await whitelist.connect(accounts.whitelistManager).addRemoveWhitelistBulk(addrs, false);

            //check that each one is removed 
            for (let n = 0; n < addrs.length; n++) {
                expect(await whitelist.isWhitelisted(addrs[n])).to.be.false;
            }
        });

        it("cannot whitelist zero address", async function () {
            await expectRevert(
                () => whitelist.connect(accounts.whitelistManager).addRemoveWhitelist(constants.addresses.zeroAddress, true),
                constants.errorMessages.ZERO_ADDRESS
            );
        });
    });
    
    describe("Events", function () {
        it("WhitelistOnOffChanged fires when turned on", async () => {
            let eventFired: boolean = false;

            //turn whitelist off first 
            await whitelist.connect(accounts.whitelistManager).setWhitelistOnOff(false); 
            expect(await whitelist.whitelistOn()).to.be.false;

            //trigger event 
            const eventOutput = await listenForEvent(
                whitelist,
                "WhitelistOnOffChanged",
                () => whitelist.connect(accounts.whitelistManager).setWhitelistOnOff(true),
                ["sender", "onOff"]
            );

            //check values 
            expect(eventOutput.eventFired).to.be.true;
            expect(eventOutput.sender).to.equal(addresses.whitelistManager);
            expect(eventOutput.onOff).to.equal(true); 
        });

        it("WhitelistOnOffChanged fires when turned off", async () => {

            //turn whitelist off first 
            await whitelist.connect(accounts.whitelistManager).setWhitelistOnOff(true);
            expect(await whitelist.whitelistOn()).to.be.true;

            //trigger event 
            const eventOutput = await listenForEvent(
                whitelist, 
                "WhitelistOnOffChanged",
                () => whitelist.connect(accounts.whitelistManager).setWhitelistOnOff(false), 
                ["sender", "onOff"]
            );
            
            //check values 
            expect(eventOutput.eventFired).to.be.true;
            expect(eventOutput.sender).to.equal(addresses.whitelistManager);
            expect(eventOutput.onOff).to.equal(false); 
        });

        it("WhitelistOnOffChanged doesnt fire if no actual change", async () => {

            //turn whitelist off first 
            await whitelist.connect(accounts.whitelistManager).setWhitelistOnOff(true);
            expect(await whitelist.whitelistOn()).to.be.true;

            //trigger event 
            const eventOutput = await listenForEvent(
                whitelist,
                "WhitelistAddedRemoved",
                () => whitelist.connect(accounts.whitelistManager).setWhitelistOnOff(true),
                ["sender", "address", "addRemove"], 
                1000
            );

            //check values 
            expect(eventOutput.eventFired).to.be.false;
        });

        it("WhitelistAddedRemoved fires when single added", async () => {

            //ensure that address is not yet whitelisted 
            expect(await whitelist.isWhitelisted(addresses.addr1)).to.be.false; 
            
            //trigger event 
            const eventOutput = await listenForEvent(
                whitelist,
                "WhitelistAddedRemoved",
                () => whitelist.connect(accounts.whitelistManager).addRemoveWhitelist(addresses.addr1, true),
                ["sender", "address", "addRemove"]
            );

            //check values 
            expect(eventOutput.eventFired).to.be.true;
            expect(eventOutput.sender).to.equal(addresses.whitelistManager);
            expect(eventOutput.address).to.equal(addresses.addr1);
            expect(eventOutput.addRemove).to.equal(true); 
        });

        it("WhitelistAddedRemoved doesnt fire if no actual change", async () => {

            //ensure that address is not yet whitelisted 
            expect(await whitelist.isWhitelisted(addresses.addr1)).to.be.false;

            //trigger event 
            const eventOutput = await listenForEvent(
                whitelist,
                "WhitelistAddedRemoved",
                () => whitelist.connect(accounts.whitelistManager).addRemoveWhitelist(addresses.addr1, false),
                ["sender", "address", "addRemove"], 
                1000
            );

            //check values 
            expect(eventOutput.eventFired).to.be.false;
        });

        it("WhitelistAddedRemoved fires when bulk added", async () => {

            //ensure that address is not yet whitelisted 
            expect(await whitelist.isWhitelisted(addresses.addr1)).to.be.false;
            expect(await whitelist.isWhitelisted(addresses.addr2)).to.be.false;

            const eventOutput: any[] = await new Promise(async (resolve, reject) => {
                const output: any[] = []; 
                
                whitelist.on("WhitelistAddedRemoved", (sender, address, action) => {
                    output.push({
                        sender, address, action
                    });
                    if (output.length >= 2) 
                        resolve(output);
                }); 
                await whitelist.connect(accounts.whitelistManager).addRemoveWhitelistBulk([addresses.addr1, addresses.addr2], true); 
            }); 

            //check values 
            expect(eventOutput.length).to.equal(2);
            expect(eventOutput[0].action).to.equal(true);
            expect(eventOutput[1].action).to.equal(true);
            expect(eventOutput[0].sender).to.equal(addresses.whitelistManager);
            expect(eventOutput[1].sender).to.equal(addresses.whitelistManager);
            expect(eventOutput.find(i => i.address == addresses.addr1)).to.be.not.null;
            expect(eventOutput.find(i => i.address == addresses.addr2)).to.be.not.null;
        });

        it("WhitelistAddedRemoved fires when single removed", async () => {
            
            //ensure that address is added to whitelist 
            await whitelist.connect(accounts.whitelistManager).addRemoveWhitelist(addresses.addr1, true); 
            expect(await whitelist.isWhitelisted(addresses.addr1)).to.be.true;

            //trigger event 
            const eventOutput = await listenForEvent(
                whitelist,
                "WhitelistAddedRemoved",
                () => whitelist.connect(accounts.whitelistManager).addRemoveWhitelist(addresses.addr1, false),
                ["sender", "address", "addRemove"]
            );

            //check values 
            expect(eventOutput.eventFired).to.be.true;
            expect(eventOutput.sender).to.equal(addresses.whitelistManager);
            expect(eventOutput.address).to.equal(addresses.addr1);
            expect(eventOutput.addRemove).to.equal(false); 
        });

        it("WhitelistAddedRemoved fires when bulk removed", async () => {
            //ensure that address is added to whitelist 
            await whitelist.connect(accounts.whitelistManager).addRemoveWhitelist(addresses.addr1, true);
            expect(await whitelist.isWhitelisted(addresses.addr1)).to.be.true;
            await whitelist.connect(accounts.whitelistManager).addRemoveWhitelist(addresses.addr2, true);
            expect(await whitelist.isWhitelisted(addresses.addr2)).to.be.true;

            const eventOutput: any[] = await new Promise(async (resolve, reject) => {
                const output: any[] = [];

                whitelist.on("WhitelistAddedRemoved", (sender, address, action) => {
                    output.push({
                        sender, address, action
                    });
                    if (output.length >= 2)
                        resolve(output);
                });
                await whitelist.connect(accounts.whitelistManager).addRemoveWhitelistBulk([addresses.addr1, addresses.addr2], false);
            });

            //check values 
            expect(eventOutput.length).to.equal(2);
            expect(eventOutput[0].action).to.equal(false);
            expect(eventOutput[1].action).to.equal(false);
            expect(eventOutput[0].sender).to.equal(addresses.whitelistManager);
            expect(eventOutput[1].sender).to.equal(addresses.whitelistManager);
            expect(eventOutput.find(i => i.address == addresses.addr1)).to.be.not.null;
            expect(eventOutput.find(i => i.address == addresses.addr2)).to.be.not.null;
        });
    });
});