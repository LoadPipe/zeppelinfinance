import { ethers, upgrades } from "hardhat";
import {
    SecurityManager,
    Whitelist,
    ContractSizer,
    ProductNft,
    ProductNftFactory,
    ProductNftIssuer,
    ProductNftStore,
    ZeppelinOracle,
    AffiliatePayout,
    NftPolicyFactory,
    FinancingRewardPolicy,
    AffiliateRewardPolicy,
    NftRefundPolicy
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

export async function deployProductNftIssuer(
    securityMgrAddr: string | Addressable,
    nftFactoryAddr: string | Addressable | null = null,
    storeAddr: string | Addressable | null = null,
    refundPolicyAddr: string | Addressable | null = null
) {
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "ProductNftIssuer",
        accounts[0]
    ));

    //create nft factory if no address is supplied 
    if (!nftFactoryAddr) {
        const nftFactory = await deployProductNftFactory(securityMgrAddr);
        nftFactoryAddr = nftFactory.target.toString();
    }

    //create store if no address is supplied 
    if (!storeAddr) {
        const nftStore = await deployProductNftStore(securityMgrAddr);
        storeAddr = nftStore.target.toString();
    }

    //create refund policy if no address is supplied 
    if (!refundPolicyAddr) {
        const factory: any = (await ethers.getContractFactory(
            "NftRefundPolicy",
            accounts[0]
        ));
        const refundPolicy = await factory.deploy(securityMgrAddr);
        refundPolicyAddr = refundPolicy.target;
    }

    return (await factory.deploy(securityMgrAddr, nftFactoryAddr, storeAddr, refundPolicyAddr)) as ProductNftIssuer;
}

export async function deployProductNftStore(
    securityMgrAddr: string | Addressable
) {
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "ProductNftStore",
        accounts[0]
    ));

    return (await factory.deploy(securityMgrAddr)) as ProductNftStore;
}

export async function deployZeppelinOracle(
    securityMgrAddr: string | Addressable
) {
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "ZeppelinOracle",
        accounts[0]
    ));

    return (await factory.deploy(securityMgrAddr)) as ZeppelinOracle;
}

export async function deployAffiliatePayout(
    securityMgrAddr: string | Addressable,
    zeppelinAddr: string | Addressable | null = null
) {
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "AffiliatePayout",
        accounts[0]
    ));

    if (!zeppelinAddr) {
        const zeppelin = await deployZeppelinOracle(securityMgrAddr);
        zeppelinAddr = zeppelin.target.toString();
    }

    return (await factory.deploy(securityMgrAddr, zeppelinAddr)) as AffiliatePayout;
}

export async function deployFinancingRewardPolicy(
    percentageBps: number,
    inventoryLimit: number = 0,
    shared: boolean = false,
    fillOrKill: boolean = false
) {
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "FinancingRewardPolicy",
        accounts[0]
    ));

    return await factory.deploy(percentageBps, inventoryLimit, shared, fillOrKill) as FinancingRewardPolicy;
}

export async function deployAffiliateRewardPolicy(
    percentageBps: number
) {
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "AffiliateRewardPolicy",
        accounts[0]
    ));

    return await factory.deploy(percentageBps) as AffiliateRewardPolicy;
}

export async function deployNftRefundPolicy(
    securityMgrAddr: string | Addressable
) {
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "NftRefundPolicy",
        accounts[0]
    ));

    return await factory.deploy(securityMgrAddr) as NftRefundPolicy;
}

export async function deployNftPolicyFactory(
    securityMgrAddr: string | Addressable,
    supportsTableland: boolean = false,
    tablePrefix: string = "",
    tableId: number = 0
) {
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "NftPolicyFactory",
        accounts[0]
    ));

    return await factory.deploy(securityMgrAddr, supportsTableland, tablePrefix, tableId) as NftPolicyFactory;
}

export async function deployLoadpipeToken(
    securityMgrAddr: string | Addressable,
    initialSupply: any = 0
) {
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "LoadpipeToken",
        accounts[0]
    ));
    
    return await upgrades.deployProxy(factory, [securityMgrAddr, initialSupply], { initializer: 'initialize' });
}


export async function deployLoadpipeTokenV2(
    securityMgrAddr: string | Addressable,
    initialSupply: any = 0
) {
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "LoadpipeTokenV2",
        accounts[0]
    ));

    return await upgrades.deployProxy(factory, [securityMgrAddr, 0], { initializer: 'initialize' });
}

export async function upgradeProxy(
    address: string | Addressable, 
    newContractName: string) 
{
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        newContractName,
        accounts[0]
    ));
    return await upgrades.upgradeProxy(address, factory);
}
