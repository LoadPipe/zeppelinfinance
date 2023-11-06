// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

/**
 * @title ISecurityManager 
 * 
 * Interface for a contract's associated { SecurityManager } contract, from the point of view of the security-managed 
 * contract (only a small subset of the SecurityManager's methods are needed). 
 * 
 * See also { SecurityManager }
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 * All rights reserved. Unauthorized use prohibited.
 */
interface ISecurityManager  {
    
    /**
     * Returns `true` if `account` has been granted `role`.
     * 
     * @param role The role to query. 
     * @param account Does this account have the specified role?
     */
    function hasRole(bytes32 role, address account) external returns (bool); 
    
    /**
     * Determines whether or not the given account is provisioned, whitelisted, and in 
     * every other way authorized to be a buyer.
     * 
     * @param account The account in question. 
     */
    function isAuthorizedBuyer(address account) external returns (bool); 
    
    /**
     * Determines whether or not the given account is provisioned, whitelisted, and in 
     * every other way authorized to be a seller.
     * 
     * @param account The account in question. 
     */
    function isAuthorizedSeller(address account) external returns (bool); 
}