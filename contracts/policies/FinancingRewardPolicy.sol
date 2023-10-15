// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "../interfaces/INftPolicy.sol";
import "../interfaces/IZeppelinOracle.sol"; 
import "../interfaces/IProductNft.sol"; 
import "../utils/CarefulMath.sol";

/**
 * @title FinancingRewardPolicy 
 * 
 * Defines a policy of rewarding NFT holders a correct amount based on a percentage of 
 * sales of the product associated with the NFT. There are several options that can be 
 * applied to this policy: 
 * - percentageBps: the % of sales to use as a base for calculation. 
 * - inventoryLimit: (0 for unlimited) - the reward is calculated only up to a certain number
 *      of items sold. 
 * - shared: if true, (total sales)/percentageBps are shared among all holders of the NFT; 
 *      otherwise, each holder is simply rewarded (total sales)/percentageBps. 
 * - fillOrKill: if true, then no rewards are owed unless ALL instances of the NFT have 
 *      been sold. 
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 * All rights reserved. Unauthorized use prohibited.
 */
contract FinancingRewardPolicy is INftPolicy { 
    uint256 public inventoryLimit;
    uint16 public percentageBps;
    bool public shared; 
    bool public fillOrKill;
    
    //errors 
    error InvalidParams();
    
    /**
     * Constructs an instance of FinancingRewardPolicy.
     * 
     * @param _percentageBps Percentage rewarded to holder (in bps)
     * @param _inventoryLimit 0 if unlimited 
     * @param _shared True if rewards are shared among all holders
     * @param _fillOrKill If true, then no rewards are owed unless all instances are sold
     */
    constructor( 
        uint16 _percentageBps,
        uint256 _inventoryLimit, 
        bool _shared, 
        bool _fillOrKill
    ) {
        shared = _shared;
        inventoryLimit = _inventoryLimit;
        percentageBps = _percentageBps;
        fillOrKill = _fillOrKill;
        
        //a percentage BPS value must be between 1 and 1000 inclusive
        if (percentageBps == 0 || percentageBps > 1000) {
            revert InvalidParams();
        }
    }
    
    /**
     * Returns true if this policy represents a fill-or-kill NFT reward policy.
     */
    function isFillOrKill() external view returns (bool) {
        return fillOrKill;
    }
    
    /**
     * Gets the amount owed to the specified token as a result of this policy. 
     * 
     * @param nft Address of the relevant NFT.
     * @param zeppelin An instance of IZeppelinOracle that contains data relevant for 
     * tdetermining or calculating he amount owed.
     * 
     * @return An amount in wei. 
     */
    function getAmountOwed(
        IProductNft nft, 
        uint256 /*tokenId*/,
        IZeppelinOracle zeppelin
    ) external view returns (uint256) {
        uint256 owed = 0; 
        
        //figure out how much is owed to buyer 
        uint256 rawSales = 0; 
        
        //if unlimited, get complete sales
        if (inventoryLimit > 0)  {
            
            //limited
            rawSales = zeppelin.getRawSalesForInventory(nft.productId(), inventoryLimit);
        }
        else  {
            //unlimited
            rawSales = zeppelin.getRawSales(nft.productId());
        }
        
        if (rawSales > 0) {
            
            //if fillOrKill, all instances must be sold, otherwise it's 0 owed
            if (fillOrKill && nft.balanceOf(nft.owner()) > 0) {
                owed = 0;
            }
            else {
                //for fixed, just divide by percentage bps 
                owed = CarefulMath.div(rawSales, percentageBps);
                    
                //for shared, divide by the number of non-owner holders 
                if (shared) {
                    //get number of non-owner holders 
                    uint256 ownerCount = nft.totalMinted() - nft.balanceOf(nft.owner());
                    
                    //divide amongst owners 
                    owed = CarefulMath.div(owed, ownerCount);
                }
            }
        }
        
        return owed;
    }
}

