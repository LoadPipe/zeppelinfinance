// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/**
 * @title IProductNftStore
 * 
 * Allows sellers to post IProductNft instances for sale, which are sold to buyers. 
 * 
 * See also { ProductNftStore }
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 */
interface IProductNftStore {
    
    /**
     * Allows instances of the specified ProductNft to be sold in the store at the given 
     * price. 
     * 
     * @param nftAddress The address of the NFT to be sold. 
     * @param price The price at which instances of the NFT are to be sold. 
     */
    function postForSale(address nftAddress, uint256 price) external; 
    
    /**
     * Purchases an instance of the given NFT at the set price, causing the transfer of 
     * that instance to the caller. 
     * 
     * @param nftAddress The address of the ProductNft. 
     * @param tokenId The id of the instance to purchase. 
     */
    function purchaseNft(address nftAddress, uint256 tokenId) external payable; 
}
