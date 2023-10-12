// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "../interfaces/INftPolicy.sol"; 
import "../interfaces/IZeppelinOracle.sol"; 
import "../interfaces/IProductNft.sol"; 
import "../utils/CarefulMath.sol"; 

/**
 * @title AffiliateRewardPolicy 
 * 
 * Defines a policy of rewarding NFT holders for affiliate promotion by granting a %
 * of sales of conversions from the NFT holders' affiliate link clicks.
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 * All rights reserved. Unauthorized use prohibited.
 */
contract AffiliateRewardPolicy is INftPolicy { 
    uint16 public percentageBps;
    
    //errors 
    error InvalidParams();
    
    //TODO: comment 
    constructor( 
        uint16 _percentageBps
    ) {
        percentageBps = _percentageBps;
        
        //a percentage BPS value must be between 1 and 1000 inclusive
        if (percentageBps == 0 || percentageBps > 1000) {
            revert InvalidParams();
        }
    }
    
    /**
     * Gets the amount owed to the specified token as a result of this policy. 
     * 
     * @param nft Address of the relevant NFT.
     * @param tokenId ID of the relevant NFT token instance.
     * @param zeppelin An instance of IZeppelinOracle that contains data relevant for 
     * tdetermining or calculating he amount owed.
     * 
     * @return An amount in wei. 
     */
    function getAmountOwed(
        IProductNft nft, 
        uint256 tokenId,
        IZeppelinOracle zeppelin
    ) external view returns (uint256) {
        
        //get the affiliate id from the token 
        bytes32 affiliateId = keccak256(abi.encodePacked(nft.getInstanceField(tokenId, "affiliateId"))); 
        
        //figure out how much is owed to buyer 
        if (affiliateId != 0) {
            return CarefulMath.div(zeppelin.getAffiliateSales(affiliateId), percentageBps); 
        }
        
        return 0;
    }
    
    /**
     * Returns true if this policy represents a fill-or-kill NFT reward policy.
     * @return False unconditionally.
     */
    function isFillOrKill() external pure returns (bool) { return false; } 
}

