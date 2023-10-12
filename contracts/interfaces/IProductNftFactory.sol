// SPDX-License-Identifier: UNLICENSED

import "./IProductNft.sol";

pragma solidity ^0.8.7;

/**
 * @title IProductNftFactory
 * 
 * Defines a factory that creates ProductNft contracts on the chain.
 * 
 * See also { ProductNftFactory }
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 * All rights reserved. Unauthorized use prohibited.
 */
interface IProductNftFactory {
    
    /**
     * Creates a new instance of ProductNft on the chain. Calls the constructor for 
     * ProductNft directly.
     * 
     * @param ownerAddress Address of account that is the product owner.
     * @param name Product name. 
     * @param symbol Short token symbol. 
     */
    function createProductNft(
        address ownerAddress,
        string memory name, 
        string memory symbol
    ) external returns (IProductNft); 
}
