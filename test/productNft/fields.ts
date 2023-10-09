import { expect } from "chai";
import { ethers } from "hardhat";
import { 
    getTestAccounts, 
    deploySecurityManager, 
    deployProductNft
} from "../utils";
import { ProductNft, SecurityManager } from "typechain";
import { expectRevert } from "../utils";
import * as constants from "../constants";


describe("ProductNft: Fields", function () {
    let productNft: ProductNft;
    let securityManager: SecurityManager;

    let addresses: any = {};
    let accounts: any = {};
    
    async function getField(name: string) : Promise<string> {
        return (await productNft.getField(name)).toString().trim();
    }
    
    async function setField(contract: any, name: string, value: string, account: any = null) {
        
        if (account) {
            await contract.connect(account).setField(name, value); 
        } else {
            await contract.setField(name, value); 
        }
    }

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
        it("initial field values", async function () {
            await expectRevert(
                () => productNft.getField(ethers.keccak256(ethers.toUtf8Bytes("fieldA"))),
                constants.errorMessages.FIELD_NOT_FOUND
            );
        });
    });

    describe("Set & Get Fields", function () {
        it("non-authorized user cannot set a field", async function () {
            await expectRevert(
                () => productNft.setField(
                    "fieldA", 
                    ethers.encodeBytes32String("valueA")
                ),
                constants.errorMessages.UNAUTHORIZED_ACCESS
            );
        });

        it("authorized user can set a field", async function () {
            await setField(productNft, "fieldA", "valueA", accounts.minter);
        });

        it("set and read back a field", async function () {
            await setField(productNft, "fieldA", "valueA", accounts.minter);

            expect(
                await getField("fieldA")
            ).to.equal("valueA");
        });

        it("set, modify, and ready back a field", async function () {
            await setField(productNft, "fieldA", "valueA", accounts.minter);

            expect(
                await getField("fieldA")
            ).to.equal("valueA");

            await setField(productNft, "fieldA", "valueX", accounts.minter);

            expect(
                await getField("fieldA")
            ).to.equal("valueX");
        });
    });
    
    //TODO: (TEST) instance fields 
});