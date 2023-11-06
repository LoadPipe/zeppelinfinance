// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC165Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./interfaces/ISecurityManager.sol";
import "./ManagedSecurity.sol";

/**
 * @title LoadpipeToken
 * 
 * The Loadpipe Governance ERC20 token.
 * 
 * @author John R. Kosinski
 * Anduril Analytics 
 * Licensed to Loadpipe.io 2023
 */
contract LoadpipeToken is 
        Initializable,
        IERC165Upgradeable, 
        ERC20PausableUpgradeable, 
        ManagedSecurity, 
        UUPSUpgradeable
{            
    address public vaultAddress; 
    bool public frozen;
            
    //ERC20
    uint8 internal _decimals;
    
    //errors
    error TokenTransferFailed();
    error UpgradeFrozen();
    
    /**
     * Returns a hard-coded version number pair (major + minor). 
     * 
     * @return (major, minor)
     */
    function version() external virtual pure returns (uint8, uint8) {
        return (1, 0);
    }
    
    /**
     * Constructs an instance of the token.
     * 
     * Reverts: 
     * - {ZeroAddressArgument} if `_securityManager` address is 0x0
     * - 'Address: low-level delegate call failed' (if `_securityManager` is not legit)
     * 
     * @param _securityManager Contract which will manage secure access for this contract. 
     * @param initialSupply If 0, this will be ignored; otherwise this quantity will be minted to the 
     * caller of the constructor.
     */
    function initialize(ISecurityManager _securityManager, uint256 initialSupply) external initializer {
        
        __ERC20_init("Loadpipe", "LOAD"); 
        _decimals = 18;
        
        //security manager
        _setSecurityManager(_securityManager); 
        
        //mint initial supply if specified 
        if (initialSupply > 0) {
            _mint(_msgSender(), initialSupply); 
        }
        
        frozen = false;
    }
    
    /**
     * Gets the number of decimals of precision after the point. 
     * Example: If the decimals for the token are == 3, then 1 sub-unit of that token is worth 
     * 0.001 of 1 token. 
     * If the decimals for the token are == 6, then 1 sub-unit of that token is worth 
     * 0.000001 of 1 token. 
     * 
     * Typically, tokens have 18 decimals, following ETH's example. 
     * 
     * @return uint8 The number of decimals of precision for 1 subunit of this token.
     */
    function decimals() public override view returns (uint8) {
        return _decimals;
    }
    
    /**
     * Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     * 
     * Emits: 
     * - {Transfer} event with `from` set to the zero address.
     * 
     * Reverts: 
     * - {UnauthorizedAccess}: if caller is not authorized with the appropriate role
     * - 'Pausable: paused' - if contract is paused 
     * - 'ERC20: mint to zero address' - if `to` is zero
     *
     * Creates tokens out of thin air. Authorized address may mint to any user. 
     * 
     * @param to Address to which to give the newly minted value.
     * @param amount The number of units of the token to mint. 
     */
    function mint(address to, uint256 amount) external onlyRole(TOKEN_MINTER_ROLE) whenNotPaused {
        _mint(to, amount);
    }
    
    /**
     * Destroys `amount` tokens from the sender's account, reducing the total supply.
     *
     * Emits:
     * - {Transfer} event with `to` set to the zero address.
     * 
     * Reverts: 
     * - {UnauthorizedAccess}: if caller is not authorized with the appropriate role
     * - 'Pausable: paused' - if contract is paused 
     * - 'ERC20: burn amount exceeds balance' - if balance is less than `amount`
     * 
     * @param amount The amount to burn. 
     */
    function burn(uint256 amount) external onlyRole(TOKEN_BURNER_ROLE) whenNotPaused {
        _burn(_msgSender(), amount); 
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
    
    /**
     * Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * Emits: 
     * - {Approval} event.
     *
     * Reverts: 
     * - 'Pausable: paused' - if contract is paused 
     * 'ERC20: approve to the zero address' - if `spender` is 0x0
     * 
     * @param spender The address to be authorized to spend the caller's tokens.
     * @param amount The max number that the authorized spender is allowed to spend.
     * @return bool True if successful. 
     */
    function approve(address spender, uint256 amount) public virtual override
        whenNotPaused 
        returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }
    
    /**
     * Implementation of IERC165; allows to query whether or not given interfaces are 
     * supported by this contract.
     * 
     * See ERC-165 for details. 
     * 
     * @param interfaceId The first four bytes of the keccak256 hash of the interface to query. 
     * @return bool True if the interface is supported by this contract. 
     */
    function supportsInterface(bytes4 interfaceId)
        public
        pure
        override (IERC165Upgradeable)
        returns (bool)
    {
        return 
            interfaceId == type(IERC165Upgradeable).interfaceId || 
            interfaceId == type(IERC20Upgradeable).interfaceId; 
    }
    
    /**
     * Authorizes users wtih the UPGRADER role to upgrade the implementation. 
     * 
     * Reverts: 
     * - {UpgradeFrozen} if {frozen} is true.
     */
    function _authorizeUpgrade(address) internal virtual override onlyRole(UPGRADER_ROLE) { 
        if (frozen) {
            revert UpgradeFrozen(); 
        }
    }
    
    /**
     * From the time that this is called by the authorized caller, no more upgrades can ever be 
     * made again; upgradeability is frozen forever. 
     */
    function freeze() external onlyRole(UPGRADER_ROLE) {
        frozen = true;
    }
    
    /**
     * See { ContextUpgradeable._msgSender }. 
     * This needs to be overridden for multiple-inheritance reasons. 
     * 
     * @return address 
     */
    function _msgSender() internal override(Context, ContextUpgradeable) view returns(address) {
        return super._msgSender(); 
    }
    
    /**
     * See { ContextUpgradeable._msgData }. 
     * This needs to be overridden for multiple-inheritance reasons. 
     * 
     * @return bytes calldata 
     */
    function _msgData() internal override(Context, ContextUpgradeable) view returns(bytes calldata) {
        return super._msgData(); 
    }
}