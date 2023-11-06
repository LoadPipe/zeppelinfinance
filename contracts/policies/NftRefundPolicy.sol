// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "../interfaces/INftPolicy.sol"; 
import "../interfaces/IZeppelinOracle.sol"; 
import "../interfaces/IProductNft.sol"; 
import "../utils/CarefulMath.sol"; 
import "../ManagedSecurity.sol"; 

/**
 * @title NftRefundPolicy 
 * 
 * Defines a policy of rewarding NFT holders for affiliate promotion by granting a %
 * of sales of conversions from the NFT holders' affiliate link clicks.
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 * All rights reserved. Unauthorized use prohibited.
 */
contract NftRefundPolicy is INftPolicy, ManagedSecurity { 
    mapping(address => mapping(uint256 => uint256)) tokenPrices;
    mapping(address => bool) refundsActivated;
    
    //errors 
    error InvalidParams();
    
    /**
     * Constructs an instance of NftRefundPolicy. 
     * 
     * Reverts: 
     * - {ZeroAddressArgument} if `securityManager` address is 0x0
     * - 'Address: low-level delegate call failed' (if `securityManager` is not legit)
     * 
     * @param securityManager Contract which will manage secure access for this contract. 
     */
    constructor(ISecurityManager securityManager) {
        _setSecurityManager(securityManager);
    }
    
    /**
     * Gets the amount owed to the specified token as a result of this policy. 
     * 
     * @param nft Address of the relevant NFT.
     * @param tokenId ID of the relevant NFT token instance.
     * 
     * @return An amount in wei. 
     */
    function getAmountOwed(
        IProductNft nft, 
        uint256 tokenId,
        IZeppelinOracle
    ) external view returns (uint256) {
        if (refundsActivated[address(nft)]) {
            return tokenPrices[address(nft)][tokenId]; 
        }
        return 0; 
    }
    
    /**
     * Returns true if this policy represents a fill-or-kill NFT reward policy.
     * @return False unconditionally.
     */
    function isFillOrKill() external pure returns (bool) { return false; } 
    
    /**
     * Returns a string (JSON) representation of the essential policy properties; this is 
     * for client-side use. 
     * See {INftPolicy-getPolicyInfoJson}
     */
    function getPolicyInfoJson() external pure returns (string memory) {
        return  "{ \"policyType\":\"NftRefundPolicy\"}";
    }
}

