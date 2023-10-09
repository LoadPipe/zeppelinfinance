// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./interfaces/IProductNftFactory.sol";
import "./ProductNft.sol";
import "./ManagedSecurity.sol";

/**
 * @title ProductNftFactory 
 * 
 * Implements a factory that creates ProductNft contracts on the chain.
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 */
contract ProductNftFactory is ManagedSecurity, IProductNftFactory {
    
    //events 
    event NftCreated(
        address indexed creator,
        address nftAddress
    ); 
    
    /**
     * Constructs an instance of the ProductNftFactory contract. 
     * 
     * Reverts: 
     * - {ZeroAddressArgument} if `securityManager` address is 0x0
     * - 'Address: low-level delegate call failed' (if `securityManager` is not legit)
     * 
     * @param securityManager Contract which will manage secure access for this contract. 
     */
    constructor(
        ISecurityManager securityManager
    ) {
        _setSecurityManager(securityManager);
    }
    
    /**
     * See { IProductNftFactory-createProductNft }
     * 
     * See also { ProductNft-constructor }
     * 
     * Emits: 
     * - {NftCreated} upon successful creation of the ProductNft.
     * 
     * Reverts: 
     * - See reverts for { ProductNft-constructor } 
     * - {UnauthorizedAccess}: if caller is not authorized with the appropriate role
     * 
     * @param ownerAddress Address of account that is the product owner.
     * @param name Product name. 
     * @param symbol Short token symbol. 
     */
    function createProductNft(
        address ownerAddress,
        string memory name, 
        string memory symbol
    ) external onlyRole(NFT_ISSUER_ROLE) returns (IProductNft) {
        
        ProductNft prodNft = new ProductNft(
            this.securityManager(),
            ownerAddress,
            name, 
            symbol
        ); 
        
        //emit event
        emit NftCreated(ownerAddress, address(prodNft)); 
        
        return prodNft;
    }
}