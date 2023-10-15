// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "./interfaces/INftPolicy.sol";
import "./policies/AffiliateRewardPolicy.sol";
import "./policies/FinancingRewardPolicy.sol";
import "./ManagedSecurity.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@tableland/evm/contracts/utils/TablelandDeployments.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";

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
contract NftPolicyFactory is ManagedSecurity, ERC721Holder {
    bool public supportsTableland = false; 
    uint256 private policiesTableId = 0;
    
    string private constant POLICIES_TABLE_PREFIX = "policies";
    
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
     * @param _supportsTableland True if tableland is supported on the chain.
     */
    constructor(
        ISecurityManager securityManager, 
        bool _supportsTableland
    ) {
        _setSecurityManager(securityManager);
        supportsTableland = _supportsTableland;
        
        //create the table 
        if (supportsTableland) {
            _createTable();
        }
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
        
        //write to table if supported 
        _writeToTable(
            SQLHelpers.quote(Strings.toHexString(_msgSender())), 
            SQLHelpers.quote("affiliateReward"),
            percentageBps, 
            0, 
            false, 
            false
        );
        
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
        
        //write to table if supported 
        _writeToTable(
            SQLHelpers.quote(Strings.toHexString(_msgSender())), 
            SQLHelpers.quote("financingReward"),
            percentageBps, 
            inventoryLimit, 
            shared, 
            fillOrKill
        );
        
        return policy;
    }
    
    function _writeToTable(
        string memory sender, 
        string memory policyType,
        uint16 percentageBps, 
        uint256 inventoryLimit, 
        bool shared, 
        bool fillOrKill
    ) internal {
        uint256 nShared = 0;
        uint256 nFOK = 0; 
        
        if (shared) nShared = 1;
        if (fillOrKill) nFOK = 1;
        
        if (supportsTableland) {
            
            TablelandDeployments.get().mutate(
                address(this),
                policiesTableId,
                SQLHelpers.toInsert(
                    POLICIES_TABLE_PREFIX,
                    policiesTableId,
                    "sender,policyType,percentageBps,inventoryLimit,shared,fillOrKill",
                    string.concat(
                        sender,
                        ",",
                        policyType, 
                        ",",
                        Strings.toString(percentageBps),
                        ",",
                        Strings.toString(inventoryLimit),
                        ",",
                        Strings.toString(nShared),
                        ",",
                        Strings.toString(nFOK)
                    )
                )
            ); 
        }
    }
    
    function _createTable() internal {
        policiesTableId = TablelandDeployments.get().create(
            msg.sender,
            SQLHelpers.toCreateFromSchema(
                "creator text not null," // Notice the trailing comma
                "policyType text not null,"
                "percentageBps integer,"
                "inventoryLimit integer,"
                "shared integer,"
                "fillOrKill integer",
                POLICIES_TABLE_PREFIX
            )
        );
    }
}