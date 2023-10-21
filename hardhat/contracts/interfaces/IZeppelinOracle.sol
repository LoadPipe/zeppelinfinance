// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

/**
 * @title IZeppelinOracle 
 * 
 * Holds data on sales of a product, pushed from off-chain by an authorized account.
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 * All rights reserved. Unauthorized use prohibited.
 */
interface IZeppelinOracle 
{ 
    /**
     * Gets sales total for a given product id. 
     * 
     * @param productId Unique id of the product.
     */
    function getRawSales(bytes32 productId) external view returns (uint256); 
    
    /**
     * Gets sales total for a given product id at a specified inventory level.
     * 
     * @param productId Unique id of the product. 
     * @param inventory The specified inventory level. 
     */
    function getRawSalesForInventory(bytes32 productId, uint256 inventory) external view returns (uint256);
    
    /**
     * Gets sales total for sales driven by a particular affiliate.
     * 
     * @param affiliateId Unique id of the affiliate that drove the sales. 
     */
    function getAffiliateSales(bytes32 affiliateId) external view returns (uint256); 
}