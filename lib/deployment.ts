import { ethers } from "hardhat";
import {SecurityManager} from "typechain";
import { Addressable } from "ethers";

export async function deploySecurityManager(adminAddress: string): Promise<SecurityManager> {
    const accounts = await ethers.getSigners();
    const factory: any = (await ethers.getContractFactory(
        "SecurityManager",
        accounts[0]
    ));

    return (await factory.deploy(adminAddress)) as SecurityManager;
}