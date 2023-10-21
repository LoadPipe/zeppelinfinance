// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title IProductNft 
 * 
 * Defines an NFT that points to a specific product, and encapsulates unique affiliate IDs
 * associated with that product.
 * 
 * See also { ProductNft }
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 * All rights reserved. Unauthorized use prohibited.
 */
interface IProductNft is IERC721 {
    
    /**
     * Returns the address of the owner of the product owner (owner of contract).
     */
    function owner() external view returns (address);
    
    /**
     * Returns the product name.
     */
    function name() external view returns (string memory);
    
    /**
     * Returns the unique product ID.
     */
    function productId() external view returns (bytes32);
    
    /**
     * Returns the number of individual token instances that have been minted.
     */
    function totalMinted() external view returns (uint256); 
    
    /**
     * Mints new instances of the NFT, with the specified affiliate IDs. The contract 
     * owner becomes the owner of the newly minted NFTs.
     * 
     * @param to The recipient of the new mint; if 0x0, defaults to this contract's owner.
     * @param quantity The number of new instances to mint. 
     * @param affiliateIds List of affiliate IDs for the new instances; the length of the 
     * array must be equal to the given `quantity`. 
     */
    function mint(address to, uint32 quantity, string[] calldata affiliateIds) external returns (uint256);
    
    /**
     * Gets the value of a specified field. 
     * 
     * @param fieldName Name of the field to get. 
     */
    function getField(string calldata fieldName) external view returns (string memory); 
    
    /**
     * Sets the value of a specified field. 
     * 
     * @param fieldName Name of the field to set. 
     * @param fieldValue Value of the field to assign. 
     */
    function setField(string calldata fieldName, string calldata fieldValue) external;
    
    /**
     * Gets the value of a specified instance-specific field (a field that is tied to a specific 
     * token id). 
     * 
     * @param tokenId Id of the token to which the desired field is assigned. 
     * @param fieldName Name of the field value to get. 
     */
    function getInstanceField(uint256 tokenId, string calldata fieldName) external view returns (string memory); 
    
    /**
     * Sets the value of a specified instance-specific field (a field that is tied to a specific 
     * token id). 
     * 
     * @param tokenId Id of the token to which the field is to be assigned. 
     * @param fieldName Name of the field to set. 
     * @param fieldValue Value of the field to assign. 
     */
    function setInstanceField(uint256 tokenId, string calldata fieldName, string calldata fieldValue) external;
    
    /**
     * Gets a list of addresses of contracts which define the policies that are attached 
     * to this particular NFT. 
     */
    function getPolicies() external view returns (address[] memory);
    
    /**
     * Associates the address of an { INftPolicy } conforming contract with this NFT. The
     * specified contract defines a policy to be associated with this contract. See also 
     * { getPolicies }. 
     * 
     * @param policy The address of a contract which defines the policy to attach.
     */
    function attachPolicy(
        address policy
    ) external; 
}
