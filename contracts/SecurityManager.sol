// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/ISecurityManager.sol"; 
import "./interfaces/IWhitelist.sol"; 

/**
 * @title SecurityManager 
 * 
 * A contract which provides AccessControl (role-based security) for one or more other contracts. 
 * 
 * This contract itself offers generic role-based security. When associated with another contract (the managed 
 * contract, which holds a reference to this contract's address), the managed contract manages its own security 
 * by calling this contract's hasRole function. Then security for that contract is managed by using this contract's
 * grantRole, revokeRole, and renounceRole functions. 
 * 
 * This contract can manage security for multiple contracts at once. 
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 * All rights reserved. Unauthorized use prohibited.
 */
contract SecurityManager is AccessControl, ISecurityManager {
    IWhitelist public buyerWhitelist;
    IWhitelist public sellerWhitelist;

    bytes32 public constant ADMIN_ROLE = 0x0;
    bytes32 public constant BUYER_ROLE = keccak256(abi.encodePacked("BUYER_ROLE"));
    bytes32 public constant NFT_SELLER_ROLE = keccak256(abi.encodePacked("NFT_SELLER_ROLE"));
    
    /**
     * Constructs the instance, granting the initial role(s). 
     */
    constructor(address admin) {
        _grantRole(ADMIN_ROLE, admin);
    }
    
    /**
     * Returns `true` if `account` has been granted `role`.
     * 
     * @param role The role to query. 
     * @param account Does this account have the specified role?
     */
    function hasRole(bytes32 role, address account) public view virtual override(AccessControl, ISecurityManager) returns (bool) {
        return super.hasRole(role, account);
    }
    
    /**
     * See { AccessControl-renounceRole }
     * 
     * If `account` is the same as caller, ADMIN the role being revoked is ADMIN, then the function 
     * fails quietly with no error. This is to prevent admin from revoking their own adminship, in order 
     * to avoid a case in which there is no admin.
     * 
     * Emits: 
     * - {AccessControl-RoleRevoked}
     * 
     * Reverts: 
     * - {UnauthorizedAccess} if caller does not have the appropriate security role}
     * - 'AccessControl:' if `account` is not the same as the caller. 
     */
    function renounceRole(bytes32 role, address account) public virtual override  {
        if (role != ADMIN_ROLE) {
            super.renounceRole(role, account);
        }
    }
    
    /**
     * See { AccessControl-revokeRole }
     * 
     * Prevents admin from revoking their own admin role, in order to prevent the contracts from being 
     * orphaned, cast adrift on the ocean of life with no admin. 
     * 
     * If `account` is the same as caller, ADMIN the role being revoked is ADMIN, then the function 
     * fails quietly with no error. This is to prevent admin from revoking their own adminship, in order 
     * to avoid a case in which there is no admin.
     * 
     * Emits: 
     * - {AccessControl-RoleRevoked}
     * 
     * Reverts: 
     * - {UnauthorizedAccess} if caller does not have the appropriate security role}
     */
    function revokeRole(bytes32 role, address account) public virtual override  {
        if (account != msg.sender || role != ADMIN_ROLE) {
            super.revokeRole(role, account);
        }
    }
    
    /**
     * Determines whether or not the given account is provisioned, whitelisted, and in 
     * every other way authorized to be a buyer.
     * 
     * @param account The account in question. 
     */
    //TODO: (TEST) test this 
    function isAuthorizedBuyer(address account) external view returns (bool) {
        if (address(buyerWhitelist) != address(0)) {
            return buyerWhitelist.isWhitelisted(account);
        }
        
        return true;
    }
    
    /**
     * Determines whether or not the given account is provisioned, whitelisted, and in 
     * every other way authorized to be a seller.
     * 
     * @param account The account in question. 
     */
    //TODO: (TEST) test this 
    function isAuthorizedSeller(address account) external view returns (bool) {
        if (hasRole(NFT_SELLER_ROLE, account)) {
            if (address(sellerWhitelist) != address(0)) {
                return sellerWhitelist.isWhitelisted(account);
            }
            return true;
        }
        
        return false;
    } 
    
    /**
     * Sets an IWhitelist instance to be the whitelist containing whitelisted buyers.
     * 
     * @param whitelist The IWhitelist instance to set as buyer whitelist. 
     */
    function setBuyerWhitelist(IWhitelist whitelist) external onlyRole(ADMIN_ROLE) {
        buyerWhitelist = whitelist;
    }
    
    /**
     * Sets an IWhitelist instance to be the whitelist containing whitelisted sellers.
     * 
     * @param whitelist The IWhitelist instance to set as seller whitelist. 
     */
    function setSellerWhitelist(IWhitelist whitelist) external onlyRole(ADMIN_ROLE) {
        sellerWhitelist = whitelist;
    }
}