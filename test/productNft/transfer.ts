import { expect } from "chai";
import { 
    getTestAccounts, 
    deploySecurityManager, 
    deployProductNft, 
    expectRevert, 
    expectEvent, 
    listenForEvent
} from "../utils";
import { ProductNft, SecurityManager } from "typechain";
import * as constants from "../constants";


describe("ProductNft", function () {
    let productNft: ProductNft;
    let securityManager: SecurityManager;

    let addresses: any = {};
    let accounts: any = {};

    this.beforeEach(async function () {
        let acc = await getTestAccounts(['admin', 'minter', 'operator1', 'recipient1', 'recipient2', 'recipient3']);
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
                productNft.balanceOf(addresses.recipient1),
                productNft.balanceOf(addresses.recipient2),
                productNft.balanceOf(addresses.recipient3),
            ]);

            for (let i = 0; i < promises.length; i++) {
                expect(parseInt(await promises[i])).to.equal(0);
            }
        });
    });

    describe("Transfer Behavior", function () {
        it("minter can mint and transfer", async function () {
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);

            //mint
            await productNft.connect(accounts.minter).mint(addresses.minter, 1, []);

            //minter is owner, balance is 1
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(1);
            expect(await productNft.ownerOf(1)).to.equal(addresses.minter);
            
            //transfer to recipient
            await productNft.connect(accounts.minter).transferFrom(addresses.minter, addresses.recipient1, 1); 

            //minter is no longer owner
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);
            expect(parseInt(await productNft.balanceOf(addresses.recipient1))).to.equal(1);
            expect(await productNft.ownerOf(1)).to.equal(addresses.recipient1);
        });
        
        it("recipient of transfer can transfer to a second owner ", async function () {
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);

            //mint
            await productNft.connect(accounts.minter).mint(addresses.minter, 1, []);
            
            //transfer to recipient
            await productNft.connect(accounts.minter).transferFrom(addresses.minter, addresses.recipient1, 1);

            //verify
            expect(parseInt(await productNft.balanceOf(addresses.recipient1))).to.equal(1);
            expect(await productNft.ownerOf(1)).to.equal(addresses.recipient1);
            
            //transfer to a new owner
            await productNft.connect(accounts.recipient1).transferFrom(addresses.recipient1, addresses.recipient2, 1); 

            //verify
            expect(parseInt(await productNft.balanceOf(addresses.recipient1))).to.equal(0);
            expect(parseInt(await productNft.balanceOf(addresses.recipient2))).to.equal(1);
            expect(await productNft.ownerOf(1)).to.equal(addresses.recipient2);
        });

        it("non-owner cannot transfer", async function () {
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);

            //mint
            await productNft.connect(accounts.minter).mint(addresses.minter, 1, []);
            
            //transfer to a new owner should revert
            await expectRevert(
                () => productNft.connect(accounts.recipient1).transferFrom(addresses.recipient1, addresses.recipient2, 1),
                constants.errorMessages.TRANSFER_NOT_OWNER
            );
        });
        
        it("can transfer only once", async function () {
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);

            //mint
            await productNft.connect(accounts.minter).mint(addresses.minter, 1, []);

            //transfer to recipient
            await productNft.connect(accounts.minter).transferFrom(addresses.minter, addresses.recipient1, 1);

            //transfer to a new owner
            await productNft.connect(accounts.recipient1).transferFrom(addresses.recipient1, addresses.recipient2, 1);

            //verify
            expect(parseInt(await productNft.balanceOf(addresses.recipient1))).to.equal(0);
            expect(parseInt(await productNft.balanceOf(addresses.recipient2))).to.equal(1);
            expect(await productNft.ownerOf(1)).to.equal(addresses.recipient2);

            //another transfer to a new owner should revert
            await expectRevert(
                () => productNft.connect(accounts.recipient1).transferFrom(addresses.recipient1, addresses.recipient2, 1),
                constants.errorMessages.TRANSFER_NOT_OWNER
            );
        });
        
        it("transfers correct token by id", async function () {
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);

            //mint
            await productNft.connect(accounts.minter).mint(addresses.minter, 7, []);

            const tokenId1 = 3;
            const tokenId2 = 7;
            
            //transfer specific tokens to recipient
            await productNft.connect(accounts.minter).transferFrom(addresses.minter, addresses.recipient1, tokenId1);
            await productNft.connect(accounts.minter).transferFrom(addresses.minter, addresses.recipient1, tokenId2);

            //verify ownership
            expect(parseInt(await productNft.balanceOf(addresses.recipient1))).to.equal(2);
            expect(await productNft.ownerOf(tokenId1)).to.equal(addresses.recipient1);
            expect(await productNft.ownerOf(tokenId2)).to.equal(addresses.recipient1);
            
            //verify ownership of other tokens has not changed 
            const count = await productNft.totalMinted();
            for (let i=0; i<count; i++) {
                let tokenId = i + 1;
                if (tokenId != tokenId1 && tokenId != tokenId2) {
                    expect(await productNft.ownerOf(tokenId)).to.equal(addresses.minter);
                }
            }
        });
    });
    
    describe("Approve and Transfer", function () {
        it("approved operator can transfer", async function () {
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);

            //mint
            await productNft.connect(accounts.minter).mint(addresses.minter, 1, []);
            
            //transfer to recipient1
            await productNft.connect(accounts.minter).transferFrom(addresses.minter, addresses.recipient1, 1);
            expect(await productNft.ownerOf(1)).to.equal(addresses.recipient1); 
            expect(await productNft.getApproved(1)).to.equal(constants.addresses.zeroAddress); 
            
            //recipient1 approves recipient2
            await productNft.connect(accounts.recipient1).approve(addresses.recipient2, 1);
            expect(await productNft.getApproved(1)).to.equal(addresses.recipient2); 
            
            //recipient2 transfers to recipient3
            await productNft.connect(accounts.recipient2).transferFrom(addresses.recipient1, addresses.recipient3, 1);
            expect(await productNft.getApproved(1)).to.equal(constants.addresses.zeroAddress); 
            expect(await productNft.ownerOf(1)).to.equal(addresses.recipient3); 
        });
        
        it("can't transfer to zero address", async function () {
            //mint
            await productNft.connect(accounts.minter).mint(addresses.minter, 1, []);

            //transfer to zero address 
            await expectRevert( 
                () => productNft.connect(accounts.minter).transferFrom(addresses.minter, constants.addresses.zeroAddress, 1), 
                'ERC721: transfer to the zero address'
            ); 
        });
        
        it("can't transfer from zero address", async function () {
        });
        
        it("can't transfer again after approval is used up", async function () {
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);

            //mint
            await productNft.connect(accounts.minter).mint(addresses.minter, 1, []);

            //transfer to recipient1
            await productNft.connect(accounts.minter).transferFrom(addresses.minter, addresses.recipient1, 1);

            //recipient1 approves operator1
            await productNft.connect(accounts.recipient1).approve(addresses.operator1, 1);

            //operator1 transfers to recipient3
            await productNft.connect(accounts.operator1).transferFrom(addresses.recipient1, addresses.recipient3, 1);
            expect(await productNft.ownerOf(1)).to.equal(addresses.recipient3); 

            //operator1 tries to transfer back to recipient1
            await expectRevert(
                () => productNft.connect(accounts.operator1).transferFrom(addresses.recipient2, addresses.recipient1, 1),
                constants.errorMessages.TRANSFER_NOT_OWNER
            );
            //operator1 tries to transfer from recipient3 to recipient1
            await expectRevert(
                () => productNft.connect(accounts.operator1).transferFrom(addresses.recipient2, addresses.recipient1, 1),
                constants.errorMessages.TRANSFER_NOT_OWNER
            );
        });

        it("approved operator can transfer to self", async function () {
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);

            //mint
            await productNft.connect(accounts.minter).mint(addresses.minter, 1, []);

            //transfer to recipient1
            await productNft.connect(accounts.minter).transferFrom(addresses.minter, addresses.recipient1, 1);

            //recipient1 approves operator1
            await productNft.connect(accounts.recipient1).approve(addresses.operator1, 1);
            expect(await productNft.getApproved(1)).to.equal(addresses.operator1); 

            //operator1 transfers to self
            await productNft.connect(accounts.operator1).transferFrom(addresses.recipient1, addresses.operator1, 1);
            expect(await productNft.ownerOf(1)).to.equal(addresses.operator1);
            expect(await productNft.getApproved(1)).to.equal(constants.addresses.zeroAddress); 
        });

        it("approved can transfer back to owner", async function () {
            expect(parseInt(await productNft.balanceOf(addresses.minter))).to.equal(0);

            //mint
            await productNft.connect(accounts.minter).mint(addresses.minter, 1, []);

            //transfer to recipient1
            await productNft.connect(accounts.minter).transferFrom(addresses.minter, addresses.recipient1, 1);

            //recipient1 approves operator1
            await productNft.connect(accounts.recipient1).approve(addresses.operator1, 1);
            expect(await productNft.getApproved(1)).to.equal(addresses.operator1); 

            //operator1 transfers back to owner
            await productNft.connect(accounts.operator1).transferFrom(addresses.recipient1, addresses.recipient1, 1);
            expect(await productNft.ownerOf(1)).to.equal(addresses.recipient1);
            expect(await productNft.getApproved(1)).to.equal(constants.addresses.zeroAddress); 
        });
        
        it("can't approve self as spender", async function () {
            await productNft.connect(accounts.minter).mint(addresses.recipient1, 1, []);
            
            await expectRevert(
                () => productNft.connect(accounts.recipient1).approve(addresses.recipient1, 1), 
                'ERC721: approval to current owner'
            ); 
        });

        it("can cancel approval by approving 0x0", async function () {
            
            //mint
            await productNft.connect(accounts.minter).mint(addresses.recipient1, 1, []);

            //recipient1 approves recipient2
            await productNft.connect(accounts.recipient1).approve(addresses.recipient2, 1);
            expect(await productNft.getApproved(1)).to.equal(addresses.recipient2); 
            
            //cancel approval 
            await productNft.connect(accounts.recipient1).approve(constants.addresses.zeroAddress, 1);
            expect(await productNft.getApproved(1)).to.equal(constants.addresses.zeroAddress); 
            
            //cannot transfer 
            await expectRevert(
                () => productNft.transferFrom(accounts.recipient1, accounts.recipient3, 1), 
                ''
            )
        });

        it("can cancel approval by setApprovalForAll", async function () {

            //mint
            await productNft.connect(accounts.minter).mint(addresses.recipient1, 1, []);

            //recipient1 approves recipient2
            await productNft.connect(accounts.recipient1).approve(addresses.recipient2, 1);
            expect(await productNft.getApproved(1)).to.equal(addresses.recipient2);

            //cancel approval 
            await productNft.connect(accounts.recipient1).setApprovalForAll(addresses.recipient2, false);

            //cannot transfer 
            await expectRevert(
                () => productNft.transferFrom(accounts.recipient1, accounts.recipient3, 1),
                'ERC721: caller is not token owner or approved'
            );
        });

        it("can't transfer for unapproved token", async function () {
            //mint
            await productNft.connect(accounts.minter).mint(addresses.recipient1, 3, []);

            //approve token 2 only
            await productNft.connect(accounts.recipient1).approve(addresses.recipient2, 2);
            
            //cannot transfer without approval for specific token
            await expectRevert(
                () => productNft.transferFrom(accounts.recipient1, accounts.recipient3, 1),
                'ERC721: caller is not token owner or approved'
            );
        });
        
        it("can't transfer without approval", async function () {
            //mint
            await productNft.connect(accounts.minter).mint(addresses.recipient1, 1, []);

            //cannot transfer without approval
            await expectRevert(
                () => productNft.transferFrom(accounts.recipient1, accounts.recipient3, 1),
                'ERC721: caller is not token owner or approved'
            );
        });
    });

    //TODO: (TEST) approveForAll

    describe("Events", function () {
        describe("Approval Events", function () {
            it("approving for single token emits Approval", async function () {
                await productNft.connect(accounts.minter).mint(addresses.minter, 1, []);

                const eventOutput = await listenForEvent(
                    productNft,
                    "Approval",
                    () => productNft.connect(accounts.minter).approve(addresses.operator1, 1),
                    ["owner", "operator"]
                );

                expect(eventOutput.eventFired).to.be.true;
                expect(eventOutput.owner).to.equal(addresses.minter);
                expect(eventOutput.operator).to.equal(addresses.operator1);
            });

            it("approving for all emits ApprovalForAll", async function () {
                await productNft.connect(accounts.minter).mint(addresses.minter, 1, []);

                const eventOutput = await listenForEvent(
                    productNft,
                    "ApprovalForAll",
                    () => productNft.connect(accounts.minter).setApprovalForAll(addresses.operator1, true),
                    ["owner", "operator", "approved"]
                );

                expect(eventOutput.eventFired).to.be.true;
                expect(eventOutput.owner).to.equal(addresses.minter);
                expect(eventOutput.operator).to.equal(addresses.operator1);
                expect(eventOutput.approved).to.be.true;
            });

            it("undoing approval for all emits ApprovalForAll", async function () {
                await productNft.connect(accounts.minter).mint(addresses.minter, 1, []);

                const eventOutput = await listenForEvent(
                    productNft,
                    "ApprovalForAll",
                    () => productNft.connect(accounts.minter).setApprovalForAll(addresses.operator1, false),
                    ["owner", "operator", "approved"]
                );

                expect(eventOutput.eventFired).to.be.true;
                expect(eventOutput.owner).to.equal(addresses.minter);
                expect(eventOutput.operator).to.equal(addresses.operator1);
                expect(eventOutput.approved).to.be.false;
            });
        }); 

        describe("Transfer Events", function () {
            it("transfer by owner emits Transfer", async function () {
                await productNft.connect(accounts.minter).mint(addresses.minter, 1, []);

                const eventOutput = await listenForEvent(
                    productNft,
                    "Transfer",
                    () => productNft.connect(accounts.minter).transferFrom(addresses.minter, addresses.recipient1, 1),
                    ["from", "to", "tokenId"]
                );

                expect(eventOutput.eventFired).to.be.true;
                expect(eventOutput.from).to.equal(addresses.minter);
                expect(eventOutput.to).to.equal(addresses.recipient1);
                expect(eventOutput.tokenId.toString()).to.equal('1');
            });

            it("transfer by operator emits Transfer", async function () {
                await productNft.connect(accounts.minter).mint(addresses.minter, 1, []);
                await productNft.connect(accounts.minter).approve(addresses.operator1, 1);

                const eventOutput = await listenForEvent(
                    productNft,
                    "Transfer",
                    () => productNft.connect(accounts.operator1).transferFrom(addresses.minter, addresses.recipient1, 1),
                    ["from", "to", "tokenId"]
                );

                expect(eventOutput.eventFired).to.be.true;
                expect(eventOutput.from).to.equal(addresses.minter);
                expect(eventOutput.to).to.equal(addresses.recipient1);
                expect(eventOutput.tokenId.toString()).to.equal('1');
            });
        }); 
    }); 
});