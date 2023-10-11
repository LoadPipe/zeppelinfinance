/**
 * @type import('hardhat/config').HardhatUserConfig
 */

import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-solhint";
import "@openzeppelin/hardhat-upgrades"
import "@typechain/hardhat";
import "dotenv/config";
import "hardhat-deploy";
import "solidity-coverage";

import "./tasks/accounts";
import "./tasks/balance";
import "./tasks/block-number";
import "./tasks/create-collectibles";

const MAINNET_RPC_URL =
    process.env.MAINNET_RPC_URL ||
    process.env.ALCHEMY_MAINNET_RPC_URL ||
    "https://eth-mainnet.alchemyapi.io/v2/your-api-key";
    
const MNEMONIC = process.env.MNEMONIC || "your mnemonic";

const ETHERSCAN_API_KEY =
    process.env.ETHERSCAN_API_KEY || "Your etherscan API key";

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            // // If you want to do some forking, uncomment this
            // forking: {
            //   url: MAINNET_RPC_URL
            // }
        }, 
        goerli: {
            accounts: [`${process.env.PRIVATE_KEY}`],
            chainId: 5,
            url: `https://eth-goerli.g.alchemy.com/v2/${process.env.GOERLI_API_KEY}`,
        },
        opgoerli: {
            accounts: [`${process.env.PRIVATE_KEY}`],
            chainId: 420,
            url: `https://goerli.optimism.io`,
        },
        sepolia: {
            accounts: [`${process.env.PRIVATE_KEY}`],
            chainId: 11155111,
            url: `https://sepolia.infura.io/v3/${process.env.SEPOLIA_API_KEY}`,
        },
        opsepolia: {
            accounts: [`${process.env.PRIVATE_KEY}`],
            chainId: 11155420,
            url: `https://sepolia.optimism.io`,
        },
        bsc_testnet: {  
            accounts: [`${process.env.PRIVATE_KEY}`],
            chainId: 97, 
            url: `https://data-seed-prebsc-1-s3.binance.org:8545`
        },
        zkevm_testnet: {
            accounts: [`${process.env.PRIVATE_KEY}`],
            chainId: 1442,
            url: `https://rpc.public.zkevm-test.net`
        },
        mantle_testnet: {
            accounts: [`${process.env.PRIVATE_KEY}`],
            chainId: 5001,
            url: `https://rpc.testnet.mantle.xyz`
        },
        filecoin_testnet: {
            accounts: [`${process.env.PRIVATE_KEY}`],
            chainId: 314159,
            url: `https://filecoin-calibration.chainup.net/rpc/v1`
        }
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer.
        },
        feeCollector: {
            default: 1,
        },
    },
    solidity: {
        settings: {
            optimizer: {
                enabled: true,
                runs: 5000
            },
        },
        compilers: [
            {
                version: "0.8.16",
            },
        ],
    },
    mocha: {
        timeout: 100000,
    },
    typechain: {
        outDir: "typechain",
        target: "ethers-v5",
    },
};
