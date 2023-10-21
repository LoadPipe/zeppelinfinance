import { expect } from "chai";
import {
    getTestAccounts,
    deploySecurityManager,
    deployZeppelinOracle
} from "../utils";
import { ethers } from "ethers";
import * as constants from "../constants";
import { SecurityManager, ZeppelinOracle } from "typechain";


describe("ZeppelinOracle: Push and Read Data", function () {
    let securityManager: SecurityManager;
    let zeppelinOracle: ZeppelinOracle;
    let addresses: any = {};

    this.beforeEach(async function () {
        let acc = await getTestAccounts(['admin']);
        addresses = acc.addresses;

        securityManager = await deploySecurityManager(addresses.admin);
        zeppelinOracle = await deployZeppelinOracle(securityManager.target);

        await securityManager.grantRole(constants.roles.system, addresses.admin);
    });

    describe("Push Sales Data", function () {
        it("can push and get raw sales data", async function () {
            let rawSales = 0; 
            const productId = ethers.keccak256(ethers.toUtf8Bytes("Product ID")); 
            
            //check initial values
            rawSales = parseInt(await zeppelinOracle.getRawSales(productId));
            expect(rawSales).to.equal(0);
            
            //push some sales 
            await zeppelinOracle.setSalesData(productId, 1000, 100000);

            rawSales = parseInt(await zeppelinOracle.getRawSales(productId));
            expect(rawSales).to.equal(100000);
            
            //push more sales 
            await zeppelinOracle.setSalesData(productId, 2000, 200000);

            //check again
            rawSales = parseInt(await zeppelinOracle.getRawSales(productId));
            expect(rawSales).to.equal(200000);
        });

        it("can push and get raw sales data at inventory", async function () {
            let rawSales = 0;
            let salesAtInv = 0;
            const productId = ethers.keccak256(ethers.toUtf8Bytes("Product ID"));

            //check initial values
            rawSales = parseInt(await zeppelinOracle.getRawSales(productId));
            salesAtInv = parseInt(await zeppelinOracle.getRawSalesForInventory(productId, 100000));
            expect(rawSales).to.equal(0);
            expect(salesAtInv).to.equal(0);

            //push some sales 
            await zeppelinOracle.setSalesData(productId, 1000, 100000);

            rawSales = parseInt(await zeppelinOracle.getRawSales(productId));
            salesAtInv = parseInt(await zeppelinOracle.getRawSalesForInventory(productId, 1000));
            expect(rawSales).to.equal(100000);
            expect(salesAtInv).to.equal(100000);

            //push more sales 
            await zeppelinOracle.setSalesData(productId, 2000, 200000);

            //check again
            rawSales = parseInt(await zeppelinOracle.getRawSales(productId));
            salesAtInv = parseInt(await zeppelinOracle.getRawSalesForInventory(productId, 1000));
            expect(rawSales).to.equal(200000);
            expect(salesAtInv).to.equal(100000);

            salesAtInv = parseInt(await zeppelinOracle.getRawSalesForInventory(productId, 2000));
            expect(salesAtInv).to.equal(200000);
        });
    });

    describe("Events", function () {
        //TODO: (TEST) test for events
    });
});