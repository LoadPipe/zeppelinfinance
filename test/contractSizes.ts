import { expect } from "chai";
import {
    deploySecurityManager,
    deployWhitelist,
    deployProductNft,
    deployProductNftFactory,
    deployProductNftIssuer,
    deployProductNftStore,
    deployZeppelinOracle,
    deployAffiliatePayout,
    deployContractSizer,
    getTestAddresses
} from "./utils";
import * as constants from "./constants";
import {
    ContractSizer,
    SecurityManager,
    Whitelist,
    ProductNft,
    ProductNftFactory,
    ProductNftIssuer,
    ProductNftStore,
    ZeppelinOracle,
    AffiliatePayout
} from "typechain";

describe("Contract Sizes", function () {
    let contractSizer: ContractSizer;
    let securityManager: SecurityManager;
    let whitelist: Whitelist;
    let productNft: ProductNft;
    let productNftFactory: ProductNftFactory; 
    let productNftIssuer: ProductNftIssuer;
    let productNftStore: ProductNftStore;
    let affiliatePayout: AffiliatePayout;
    let zeppelin: ZeppelinOracle;

    this.beforeEach(async function () {
        const addresses = await getTestAddresses(["admin"]);
        contractSizer = await deployContractSizer();
        securityManager = await deploySecurityManager(addresses.admin);

        await securityManager.grantRole(constants.roles.nftIssuer, addresses.admin);

        whitelist = await deployWhitelist(securityManager.target.toString());
        productNft = await deployProductNft(securityManager.target.toString(), addresses.admin);
        productNftFactory = await deployProductNftFactory(securityManager.target);
        productNftStore = await deployProductNftStore(securityManager.target.toString());
        zeppelin = await deployZeppelinOracle(securityManager.target.toString());
        affiliatePayout = await deployAffiliatePayout(securityManager.target.toString(), zeppelin.target.toString());
        productNftIssuer = await deployProductNftIssuer(
            securityManager.target.toString(), productNftFactory.target.toString(), productNftStore.target.toString()
        );
    });

    describe("Read Contract Sizes", function () {
        it("contract sizes", async function () {
            const contractNames = [
                "ProductNft",
                "Whitelist",
                "SecurityManager",
                "ProductNftFactory",
                "ProductNftStore",
                "ProductNftIssuer",
                "AffiliatePayout",
                "ZeppelinOracle"
            ];
            const contractSizes = await Promise.all([
                contractSizer.getContractSize(productNft.target.toString()),
                contractSizer.getContractSize(productNftFactory.target.toString()),
                contractSizer.getContractSize(productNftStore.target.toString()),
                contractSizer.getContractSize(productNftIssuer.target.toString()),
                contractSizer.getContractSize(affiliatePayout.target.toString()),
                contractSizer.getContractSize(zeppelin.target.toString()),
                contractSizer.getContractSize(whitelist.target.toString()),
                contractSizer.getContractSize(securityManager.target.toString())
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