// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

//import "../../../../node_modules/@openzeppelin/contracts/AccessControl.sol";
import "./lib/contracts/access/AccessControl.sol";
import "../../interfaces/ISecurityManager.sol"; 

contract EchidnaSecurityRoles {
    bytes32 public constant ADMIN_ROLE = 0x0;
    bytes32 public constant WHITELIST_MANAGER_ROLE = keccak256("WHITELIST_MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant NFT_ISSUER_ROLE = keccak256("NFT_ISSUER_ROLE");
    bytes32 public constant NFT_SELLER_ROLE = keccak256("NFT_SELLER_ROLE");
    bytes32 public constant TOKEN_MINTER_ROLE = keccak256("TOKEN_MINTER_ROLE");
    bytes32 public constant TOKEN_BURNER_ROLE = keccak256("TOKEN_BURNER_ROLE");
    bytes32 public constant SYSTEM_ROLE = keccak256("SYSTEM_ROLE");
}

//USED IN TESTS ONLY; SHOULD NOT BE DEPLOYED TO MAINNET
contract EchidnaSecurityManager is AccessControl, EchidnaSecurityRoles, ISecurityManager  {
    bool public manageRolesEnabled; //allows authorized to grant, revoke, renounce roles 
    mapping(bytes32 => bool) grantRoleDisabled; 
    
    constructor(bool _manageRolesEnabled) {
        manageRolesEnabled = _manageRolesEnabled;
    }
    
    function hasRole(bytes32 role, address account) public view virtual override(AccessControl, ISecurityManager) returns (bool) {
        return super.hasRole(role, account);
    }
    
    function renounceRole(bytes32 role) public virtual  {
        if (manageRolesEnabled && role != ADMIN_ROLE) {
            super.renounceRole(role, msg.sender);
        }
    }
    
    function revokeRole(bytes32 role, address account) public virtual override onlyRole(ADMIN_ROLE) {
        if (manageRolesEnabled && (account != msg.sender || role != ADMIN_ROLE)) {
            super.revokeRole(role, account);
        }
    }
    
    function grantRole(bytes32 role, address account) public virtual override onlyRole(ADMIN_ROLE) {
        if (manageRolesEnabled) {
            _grantRole(role, account); 
        }
    }
    
    function disableGrantRole(bytes32 role) public onlyRole(ADMIN_ROLE) {
        grantRoleDisabled[role] = true;
    }
    
    function isAuthorizedBuyer(address) external pure returns (bool) {
        return true;
    }
    
    function isAuthorizedSeller(address) external pure returns (bool) {
        return false;
    }
    
    function grantRole_admin(address account) public virtual onlyRole(ADMIN_ROLE) {grantRole(ADMIN_ROLE, account); }
    function revokeRole_admin(address account) public virtual onlyRole(ADMIN_ROLE) {revokeRole(ADMIN_ROLE, account); }
    function renounceRole_admin() public virtual {renounceRole(ADMIN_ROLE); }
    
    function grantRole_burner(address account) public virtual onlyRole(ADMIN_ROLE) {grantRole(TOKEN_BURNER_ROLE, account); }
    function revokeRole_burner(address account) public virtual onlyRole(ADMIN_ROLE) {revokeRole(TOKEN_BURNER_ROLE, account); }
    function renounceRole_burner() public virtual {renounceRole(TOKEN_BURNER_ROLE); }
    
    function grantRole_minter(address account) public virtual onlyRole(ADMIN_ROLE) {grantRole(TOKEN_MINTER_ROLE, account); }
    function revokeRole_minter(address account) public virtual onlyRole(ADMIN_ROLE) {revokeRole(TOKEN_MINTER_ROLE, account); }
    function renounceRole_minter() public virtual {renounceRole(TOKEN_MINTER_ROLE); }
    
    function grantRole_whitelistManager(address account) public virtual onlyRole(ADMIN_ROLE) {grantRole(WHITELIST_MANAGER_ROLE, account); }
    function revokeRole_whitelistManager(address account) public virtual onlyRole(ADMIN_ROLE) {revokeRole(WHITELIST_MANAGER_ROLE, account); }
    function renounceRole_whitelistManager() public virtual {renounceRole(WHITELIST_MANAGER_ROLE); }
    
    function grantRole_upgrader(address account) public virtual onlyRole(ADMIN_ROLE) {grantRole(UPGRADER_ROLE, account); }
    function revokeRole_upgrader(address account) public virtual onlyRole(ADMIN_ROLE) {revokeRole(UPGRADER_ROLE, account); }
    function renounceRole_upgrader() public virtual {renounceRole(UPGRADER_ROLE); }
    
    function grantRole_pauser(address account) public virtual onlyRole(ADMIN_ROLE) {grantRole(PAUSER_ROLE, account); }
    function revokeRole_pauser(address account) public virtual onlyRole(ADMIN_ROLE) {revokeRole(PAUSER_ROLE, account); }
    function renounceRole_pauser() public virtual {renounceRole(PAUSER_ROLE); }
    
    function setManageRolesEnabled(bool value) public virtual onlyRole(ADMIN_ROLE) {
        manageRolesEnabled = value;
    }
    
    function grantMinterRoleToVault(address vaultAddress) public {
        if (!hasRole(ADMIN_ROLE, msg.sender)) 
            revert("only admin"); 
        _grantRole(TOKEN_MINTER_ROLE, vaultAddress); 
    }
    
    function grantUpgraderRole(address addr) public {
        if (!hasRole(ADMIN_ROLE, msg.sender)) 
            revert("only admin"); 
        _grantRole(UPGRADER_ROLE, addr); 
    }
}

contract EchidnaSecurityManagerWithAdmin is EchidnaSecurityManager {
    constructor(address admin, bool _manageRolesEnabled) EchidnaSecurityManager(_manageRolesEnabled) {
        _grantRole(ADMIN_ROLE, admin); 
    }
}
