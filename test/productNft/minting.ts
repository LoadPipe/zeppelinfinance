import { expect } from "chai";
import { 
    getTestAccounts, 
    deploySecurityManager, 
    deployProductNft, 
    listenForEvent
} from "../utils";
import { ProductNft, SecurityManager } from "typechain";
import * as constants from "../constants";


describe("ProductNft: Minting", function () {
    let productNft: ProductNft;
    let securityManager: SecurityManager;

    let addresses: any = {};
    let accounts: any = {};

    this.beforeEach(async function () {
        let acc = await getTestAccounts(['admin', 'minter', 'addr1', 'addr2', 'addr3']);
        addresses = acc.addresses;
        accounts = acc.accounts;
        securityManager = await deploySecurityManager(addresses.admin);
        productNft = await deployProductNft(securityManager.target, addresses.admin);

        //grant pauser role 
        await securityManager.grantRole(constants.roles.nftIssuer, addresses.minter);
    });

    describe("Initial State", function () {
        it("initial balances", async function () {
            const promises = await Promise.all([
                productNft.balanceOf(addresses.admin),
                productNft.balanceOf(addresses.minter),
                productNft.balanceOf(addresses.addr1),
                productNft.balanceOf(addresses.addr2),
                productNft.balanceOf(addresses.addr3),
            ]);
            
            for(let i=0; i<promises.length; i++) {
                expect(parseInt(await promises[i])).to.equal(0);
            }
        });
    });

    describe("Minting Behavior", function () {
        it("minter mint single quantity to self", async function () {
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);
            
            //mint
            await productNft.connect(accounts.minter).mint(addresses.minter, 1, [])
            
            //minter is owner, balance is 1
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(1);
            expect(await productNft.ownerOf(1)).to.equal(addresses.minter);
        });

        it("minter mint single quantity to another", async function () {
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);
            expect(parseInt(await productNft.balanceOf(addresses.addr1))).to.equal(0);
            
            //mint
            await productNft.connect(accounts.minter).mint(addresses.addr1, 1, [])
            
            //minter's balance is still 0
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);
            
            //recipient's balance is 1
            expect(parseInt(await productNft.balanceOf(addresses.addr1))).to.equal(1);
            
            //recipient is owner
            expect(await productNft.ownerOf(1)).to.equal(addresses.addr1);
        });
        
        it("minter mint multiple quantity to self", async function () {
            const quantity = 3;
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);

            //mint
            await productNft.connect(accounts.minter).mint(addresses.minter, quantity, [])

            //minter balance is quantity
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(quantity);
            
            //minter is owner
            for (let n = 0; n < quantity; n++) {
                expect(await productNft.ownerOf(n+1)).to.equal(addresses.minter);
            }
        });

        it("minter mint multiple quantity to another", async function () {
            const quantity = 3;
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);

            //mint
            await productNft.connect(accounts.minter).mint(addresses.addr1, quantity, [])

            //recipient balance is quantity
            expect(parseInt(await productNft.balanceOf(addresses.addr1))).to.equal(quantity);

            //recipient is owner
            for (let n = 0; n < quantity; n++) {
                expect(await productNft.ownerOf(n + 1)).to.equal(addresses.addr1);
            }
        });

        it("minting to zero address results in ownership by owner", async function () {
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);

            //mint to zero address
            await productNft.connect(accounts.minter).mint(constants.addresses.zeroAddress, 1, []);
            
            const owner = await productNft.owner();
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);
            expect(parseInt(await productNft.balanceOf(owner))).to.equal(1);
            expect(await productNft.ownerOf(1)).to.equal(owner);
        });
    });

    describe("Events", function () {
        //TODO: (TEST) why no event?
        it.skip("minting to self emits Transfer", async function () {
            const eventOutput = await listenForEvent(
                productNft,
                "Transfer",
                () => productNft.connect(accounts.minter).mint(addresses.minter, 1, []),
                ["from", "to", "tokenId"]
            );

            expect(eventOutput.eventFired).to.be.true;
            expect(eventOutput.from).to.equal(constants.addresses.zeroAddress);
            expect(eventOutput.to).to.equal(addresses.minter);
            expect(eventOutput.tokenId.toString()).to.equal('1');
        });

        it("minting to another emits Transfer", async function () {
            const eventOutput = await listenForEvent(
                productNft,
                "Transfer",
                () => productNft.connect(accounts.minter).mint(addresses.addr1, 1, []),
                ["from", "to", "tokenId"]
            );

            expect(eventOutput.eventFired).to.be.true;
            expect(eventOutput.from).to.equal(constants.addresses.zeroAddress);
            expect(eventOutput.to).to.equal(addresses.addr1);
            expect(eventOutput.tokenId.toString()).to.equal('1');
        });
    });
});