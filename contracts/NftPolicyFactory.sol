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
    uint256 public policiesTableId = 0;
    string public policiesTablePrefix = ""; 
    
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
     * @param _policiesTableId Numeric unique ID of the tableland table.
     * @param _policiesTablePrefix String prefix of the tableland table.
     */
    constructor(
        ISecurityManager securityManager, 
        bool _supportsTableland, 
        string memory _policiesTablePrefix, 
        uint256 _policiesTableId
    ) {
        _setSecurityManager(securityManager);
        supportsTableland = _supportsTableland;
        policiesTableId = _policiesTableId; 
        policiesTablePrefix = _policiesTablePrefix; 
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
            2,
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
            1,
            percentageBps, 
            inventoryLimit, 
            shared, 
            fillOrKill
        );
        
        return policy;
    }
    
    /**
     * Sets the table info for use of tableland tables, which are used for policy creation 
     * records. Example use case: a new table has been deployed and transferred. 
     * 
     * @param _supportsTableland True if tableland is supported on the chain.
     * @param _policiesTablePrefix String prefix of the tableland table.
     * @param _policiesTableId Numeric unique ID of the tableland table.
     */
    function setTablelandInfo(
        bool _supportsTableland, 
        string calldata _policiesTablePrefix, 
        uint256 _policiesTableId
    ) public onlyRole(ADMIN_ROLE) {
        supportsTableland = _supportsTableland;
        policiesTablePrefix = _policiesTablePrefix;
        policiesTableId = _policiesTableId;
    }
    
    function _writeToTable(
        uint8 policyType,
        uint16 percentageBps, 
        uint256 inventoryLimit, 
        bool shared, 
        bool fillOrKill
    ) public {
        if (supportsTableland) {
            string memory sShared = "0";
            string memory sFillOrKill = "0"; 
            
            if (shared) sShared = "1";
            if (fillOrKill) sFillOrKill = "1";
        
            
            uint256 primaryKeyId = uint256(keccak256(abi.encodePacked(policyType, percentageBps, inventoryLimit, shared, fillOrKill))); 
            
            TablelandDeployments.get().mutate(
                address(this),
                policiesTableId,
                SQLHelpers.toInsert(
                    policiesTablePrefix,
                    policiesTableId,
                    "id,policyType,percentageBps,inventoryLimit,shared,fillOrKill",
                    string.concat(
                        SQLHelpers.quote(Strings.toString(primaryKeyId)),
                        ",",
                        Strings.toString(policyType), 
                        ",",
                        Strings.toString(percentageBps),
                        ",",
                        Strings.toString(inventoryLimit),
                        ",",
                        sShared,
                        ",",
                        sFillOrKill
                    )
                )
            ); 
        }
    }
}