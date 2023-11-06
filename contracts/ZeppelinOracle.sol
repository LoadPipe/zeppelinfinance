// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

//import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol"; 
//import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
//import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/security/Pausable.sol"; 
import "./ManagedSecurity.sol"; 
import "./interfaces/IZeppelinOracle.sol"; 

/**
 * @title ZeppelinOracle 
 * 
 * Holds data on sales of a product, pushed from off-chain by an authorized account.
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 * All rights reserved. Unauthorized use prohibited.
 */
//TODO: (DESIGN) make upgradeable 
contract ZeppelinOracle is
    IZeppelinOracle, 
    ManagedSecurity, 
    Pausable
{ 
    // product id => (inventory count => sales total)
    mapping(bytes32 => mapping(uint256 => uint256)) public salesRevenue;
    mapping(bytes32 => uint256) public inventorySales;
    mapping(bytes32 => uint256) public affiliateSales; 
    
    //events
    event SalesDataSet(
        bytes32 indexed productId, 
        uint256 count, 
        uint256 amount
    ); 
    
    //errors 
    error ZeroValueArgument();
    
    /**
     * Creates an instance of the ZeppelinOracle contract
     * 
     * Reverts: 
     * - {ZeroAddressArgument} if `securityManager` address is 0x0
     * - 'Address: low-level delegate call failed' (if `securityManager` is not legit). 
     * 
     * @param securityManager Contract which will manage secure access for this contract. 
     */
    constructor(ISecurityManager securityManager) {
        _setSecurityManager(securityManager);
    }
    
    /**
     * Sets sales data for a given product Id. 
     * 
     * @param productId Unique id of the product. 
     * @param amount The sales total for the product.
     * 
     * Reverts: 
     * - {UnauthorizedAccess} if caller does not have the appropriate security role
     * - {ZeroValueArgument} if `productId`, `inventoryCount` or `amount` are zero.
     * 
     * Emits: 
     * - {SalesDataSet} event.
     */
    function setSalesData(bytes32 productId, uint256 inventoryCount, uint256 amount) external 
        whenNotPaused 
        onlyRole(SYSTEM_ROLE)
    {
        //TODO: (TEST) test these cases 
        //check for zero-value arguments 
        if (productId == 0) {
            revert ZeroValueArgument();
        }
        if (inventoryCount == 0) {
            revert ZeroValueArgument();
        }
        if (amount == 0) {
            revert ZeroValueArgument();
        }
        salesRevenue[productId][inventoryCount] = amount; 
        inventorySales[productId] = inventoryCount;
        emit SalesDataSet(productId, inventoryCount, amount); 
    }
    
    //TODO: comment 
    function setAffiliateSales(bytes32 affiliateId, uint256 amount) external 
        whenNotPaused
        onlyRole(SYSTEM_ROLE) 
    {
        affiliateSales[affiliateId] = amount;
    }
    
    /**
     * Gets sales data for a given product id. 
     * 
     * @param productId Unique id of the product. 
     * @return Amount of sales in wei. 
     */
    function getRawSales(bytes32 productId) external view returns (uint256) {
        return salesRevenue[productId][inventorySales[productId]]; 
    }
    
    /**
     * Gets sales data for a given product id at a specified inventory level.
     * 
     * @param productId Unique id of the product. 
     * @param inventory The specified inventory level. 
     * @return Amount of sales in wei. 
     */
    function getRawSalesForInventory(bytes32 productId, uint256 inventory) external view returns (uint256) {
        return salesRevenue[productId][inventory]; 
    }
    
    /**
     * Gets the amount of sales brought in by the specified affiliate. 
     * 
     * @param affiliateId Hash of a unique affiliate id. 
     * @return Amount of sales in wei. 
     */
    function getAffiliateSales(bytes32 affiliateId) external view returns (uint256) {
        return affiliateSales[affiliateId]; 
    }
    
    /**
     * Triggers stopped state, rendering many functions uncallable. 
     * 
     * Emits:
     * - {Paused} event.
     * 
     * Reverts: 
     * - {UnauthorizedAccess} if caller does not have the appropriate security role
     * - 'Pausable: paused' - if contract is paused 
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * Returns to the normal state after having been paused.
     * 
     * Emits:
     * - {Unpaused} event.
     *
     * Reverts: 
     * - {UnauthorizedAccess} if caller does not have the appropriate security role
     * - 'Pausable: paused' - if contract is paused 
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}