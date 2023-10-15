// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "./interfaces/INftPolicy.sol";
import "./policies/AffiliateRewardPolicy.sol";
import "./policies/FinancingRewardPolicy.sol";
import "./ManagedSecurity.sol";

/**
 * @title NftPolicyFactory 
 * 
 * Creates new INftPolicy policy instances on the chain.
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 * All rights reserved. Unauthorized use prohibited.
 */
//TODO: (DESIGN) make upgradeable 
contract NftPolicyFactory is ManagedSecurity {
    
    //events 
    event PolicyCreated(
        address indexed creator,
        address indexed policy
    ); 
    
    //errors 
    error SellerNotAuthorized(address);
    
    //modifiers 
    modifier onlyAuthorizedSellers() {
        if (!securityManager.isAuthorizedSeller(_msgSender()))
            revert SellerNotAuthorized(_msgSender());
        _;
    }
    
    /**
     * Constructs an instance of the NftPolicyFactory contract. 
     * 
     * Reverts: 
     * - {ZeroAddressArgument} if `securityManager` address is 0x0
     * - 'Address: low-level delegate call failed' (if `securityManager` is not legit)
     * 
     * @param securityManager Contract which will manage secure access for this contract. 
     */
    constructor(
        ISecurityManager securityManager
    ) {
        _setSecurityManager(securityManager);
    }
    
    /**
     * Creates and deploys a new AffiliateRewardPolicy instance on the chain. 
     * 
     * Reverts: 
     * - {SellerNotAuthorized} if the caller is not an authorized seller.
     * 
     * Emits: 
     * - {PolicyCreated} upon successful creation of the policy.
     * 
     * @param percentageBps Percentage of driven affiliate sales rewarded to holder (in bps)
     * @return INftPolicy; the address of the newly created contract. 
     */
    function createAffiliateRewardPolicy(
        uint16 percentageBps
    ) external onlyAuthorizedSellers returns (INftPolicy) {
        //create new policy 
        INftPolicy policy =  new AffiliateRewardPolicy(percentageBps);
        
        //emit event & return
        emit PolicyCreated(_msgSender(), address(policy));
        return policy;
    }
    
    /**
     * Creates and deploys a new FinancingRewardPolicy instance on the chain. 
     * 
     * Reverts: 
     * - {SellerNotAuthorized} if the caller is not an authorized seller.
     * 
     * Emits: 
     * - {PolicyCreated} upon successful creation of the policy.
     * 
     * @param percentageBps Percentage of sales rewarded to holder (in bps)
     * @param inventoryLimit 0 if unlimited 
     * @param shared True if rewards are shared among all holders
     * @param fillOrKill If true, then no rewards are owed unless all instances are sold
     * @return INftPolicy; the address of the newly created contract. 
     */
    function createFinancingRewardPolicy(
        uint16 percentageBps,
        uint256 inventoryLimit, 
        bool shared, 
        bool fillOrKill
    ) external onlyAuthorizedSellers returns (INftPolicy) {
        //create new policy 
        INftPolicy policy = new FinancingRewardPolicy(
            percentageBps, inventoryLimit, shared, fillOrKill
        );
        
        //emit event & return
        emit PolicyCreated(_msgSender(), address(policy));
        return policy;
    }
}