// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./IProductNft.sol"; 
import "./IZeppelinOracle.sol";

/**
 * @title INftPolicy 
 * 
 * Defines logic for a policy which can be assocciated with an NFT; for example, a policy for 
 * calculating reward amounts for holders of the NFT.
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 */
interface INftPolicy {
    
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
    ) external view returns (uint256);
    
    /**
     * Returns true if this policy represents a fill-or-kill NFT reward policy.
     */
    function isFillOrKill() external view returns (bool); 
}