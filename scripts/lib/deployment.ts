import { ethers } from "hardhat";
import { 
    SecurityManager, 
    Whitelist, 
    ContractSizer, 
    ProductNft, 
    ProductNftFactory
} from "typechain";
import { Addressable } from "ethers";


export async function deployContractSizer() {
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "ContractSizer",
        accounts[0]
    ));

    return (await factory.deploy()) as ContractSizer;
}

export async function deploySecurityManager(adminAddress: string): Promise<SecurityManager> {
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "SecurityManager",
        accounts[0]
    ));

    return (await factory.deploy(adminAddress)) as SecurityManager;
}

export async function deployWhitelist(
    securityMgrAddr: string | Addressable
): Promise<Whitelist> {

    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "Whitelist",
        accounts[0]
    ));

    return (await factory.deploy(securityMgrAddr)) as Whitelist;
}

export async function deployProductNft(
    securityMgrAddr: string | Addressable,
    ownerAddress: string,
    name: string = "ProductNFT",
    symbol: string = "PNFT"
): Promise<ProductNft> {

    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "ProductNft",
        accounts[0]
    ));

    return (await factory.deploy(securityMgrAddr, ownerAddress, name, symbol)) as ProductNft;
}

export async function deployProductNftFactory(
    securityMgrAddr: string | Addressable
) {
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "ProductNftFactory",
        accounts[0]
    ));

    return (await factory.deploy(securityMgrAddr)) as ProductNftFactory;
}