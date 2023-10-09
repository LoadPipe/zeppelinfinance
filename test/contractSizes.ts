import { expect } from "chai";
import {
    deploySecurityManager,
    deployWhitelist,
    deployProductNft,
    deployContractSizer,
    getTestAddresses
} from "./utils";
import * as constants from "./constants";
import {
    ContractSizer,
    SecurityManager,
    Whitelist,
    ProductNft
} from "typechain";

//TODO: (TEST) size all contracts

describe("Contract Sizes", function () {
    let contractSizer: ContractSizer;
    let productNft: ProductNft;
    let securityManager: SecurityManager;
    let whitelist: Whitelist;

    this.beforeEach(async function () {
        const addresses = await getTestAddresses(["admin"]);
        contractSizer = await deployContractSizer();
        securityManager = await deploySecurityManager(addresses.admin);

        await securityManager.grantRole(constants.roles.nftIssuer, addresses.admin);

        whitelist = await deployWhitelist(securityManager.target.toString());
        productNft = await deployProductNft(securityManager.target.toString(), addresses.admin, "hey", "jude");
    });

    describe("Read Contract Sizes", function () {
        it("contract sizes", async function () {
            const contractNames = [
                "ProductNft",
                "ProductNftFactory",
                "ProductNftStore",
                "ProductNftIssuer",
                "AffiliatePayout",
                "ZeppelinOracle",
                "Whitelist",
                "SecurityManager"
            ];
            const contractSizes = await Promise.all([
                contractSizer.getContractSize(productNft.target.toString()),
                contractSizer.getContractSize(whitelist.target.toString()),
                contractSizer.getContractSize(securityManager.target.toString()),
            ]);

            const warningLimit = 23000;
            const errorLimit = 23750;

            for (let n = 0; n < contractNames.length; n++) {
                const name = contractNames[n];
                const size = parseInt(contractSizes[n].toString());
                console.log(`${name}: ${size}`);
                if (size > warningLimit) {
                    console.log(`${name} is over ${warningLimit}`)
                }
            }

            for (let n = 0; n < contractNames.length; n++) {
                const size = parseInt(contractSizes[n].toString());
                expect(size).is.lessThan(errorLimit);
            }
        });
    });
});