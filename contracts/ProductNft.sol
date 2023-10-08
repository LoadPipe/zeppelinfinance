// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./interfaces/IProductNft.sol"; 
import "./ManagedSecurity.sol"; 

/**
 * @title ProductNft 
 * 
 * Implements an NFT that points to a specific product, and encapsulates unique affiliate IDs
 * associated with that product.
 * 
 * Lateral Relationships: 
 * - ISecurityManager
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 */
contract ProductNft is
    IProductNft,
    ERC721,
    ManagedSecurity { 
    
    address _owner;
    uint256 internal lastTokenId;
    mapping(bytes32 => string) fields; 
    mapping(uint256 => mapping(bytes32 => string)) instanceFields; 
    
    //errors
    error FieldNotFound();
    error TokenIdNotFound();
    error ArgumentException(string);
    
    /**
     * Constructs a ProductNft instance.
     * 
     * Reverts: 
     * - {ZeroAddressArgument} if `securityManager` address is 0x0
     * - 'Address: low-level delegate call failed' (if `securityManager` is not legit)
     * - 'Initializable: contract is already initialized' - if already previously initialized 
     * 
     * @param securityManager Contract which will manage secure access for this contract. 
     * @param _name Product name. 
     * @param symbol Short token symbol. 
     */
    constructor(
        ISecurityManager securityManager, 
        address ownerAddress,
        string memory _name, 
        string memory symbol
    ) ERC721(_name, symbol) {
        
        //TODO: (DESIGN) ensure security role of caller? 
        
        _owner = ownerAddress;
        lastTokenId = 0;
        
        //security manager
        _setSecurityManager(securityManager); 
    }
    
    /**
     * @dev See {IERC721Metadata-name} and {IProductNft-name}.
     */
    function name() public view override(ERC721, IProductNft) returns (string memory) {
        return super.name();
    }
    
    /**
     * @dev See {IProductNft-owner}.
     */
    function owner() public view override returns (address) {
        return _owner;
    }
    
    /**
     * @dev See {IProductNft-productId}.
     */
    function productId() public view override returns (bytes32) {
        return keccak256(abi.encodePacked(this.name()));
    }
    
    /**
     * @dev See {IProductNft-totalMinted}.
     */
    function totalMinted() public view override returns (uint256) {
        return lastTokenId;
    }
    
    /**
     * See { IProductNft-mint }
     * 
     * Reverts: 
     * - { ArgumentException } if quantity != affiliateIds.length or 0
     * - {UnauthorizedAccess}: if caller is not authorized with the appropriate role
     * 
     * Emits: 
     * - {Transfer} upon successful minting 
     * 
     * @param to The recipient of the new mint; if 0x0, defaults to this contract's owner.
     * @param quantity The number of new instances to mint. 
     * @param affiliateIds List of affiliate IDs for the new instances; the length of the 
     * array must be equal to the given `quantity`. Can be zero. 
     */
    function mint(address to, uint32 quantity, string[] calldata affiliateIds) external onlyRole(NFT_ISSUER_ROLE) returns (uint256) { 
        //if no address passed, it mints to owner 
        if (to == address(0))
            to = this.owner();
        
        //check that array length == quantity
        if (affiliateIds.length != quantity && affiliateIds.length != 0)
            revert ArgumentException("quantity");
        
        //mint the given quantity
        for (uint32 i=0; i<quantity; i++) {
            lastTokenId++; 
            _mint(to, lastTokenId); 
            
            //optionally add affiliate id 
            if (affiliateIds.length > i)
                this.setInstanceField(lastTokenId, "affiliateId", affiliateIds[i]);
        }
        
        return lastTokenId;
    }
    
    /**
     * Gets the value of a specified field. 
     * 
     * Reverts: 
     * - {FieldNotFound} if `fieldName` field is unassigned.
     * 
     * @param fieldName Name of the field to get. 
     */
    function getField(string calldata fieldName) external view returns (string memory) {
        bytes32 fieldKey = keccak256(abi.encodePacked(fieldName)); 
        string memory value = fields[fieldKey]; 
        
        //revert on field not found 
        if (_stringIsEmpty(value))
            revert FieldNotFound(); 
        return value;
    }
    
    /**
     * See { IProductNft-setField }
     * 
     * @param fieldName Name of the field to set. 
     * @param fieldValue Value of the field to assign. 
     */
    //TODO: (DESIGN) should a max length for strings be enforced ? 
    function setField(string calldata fieldName, string calldata fieldValue) onlyRole(NFT_ISSUER_ROLE) external {
        //TODO: (DESIGN) should have event?
        bytes32 fieldKey = keccak256(abi.encodePacked(fieldName)); 
        fields[fieldKey] = fieldValue;
    }
    
    /**
     * Gets the value of a specified instance-specific field (a field that is tied to a specific 
     * token id). 
     * 
     * Reverts: 
     * - {FieldNotFound} if `fieldName` field is unassigned.
     * - {TokenIdNotFound} if `tokenId` doesn't refer to an existing token.
     * 
     * @param tokenId Id of the token to which the desired field is assigned. 
     * @param fieldName Name of the field value to get. 
     */
    function getInstanceField(uint256 tokenId, string calldata fieldName) external view returns (string memory) {
        //revert on invalid token id 
        if (tokenId > lastTokenId) {
            revert TokenIdNotFound();
        }
        
        bytes32 fieldKey = keccak256(abi.encodePacked(fieldName)); 
        string memory value = instanceFields[tokenId][fieldKey];
        
        //revert on field not found 
        if (_stringIsEmpty(value))
            revert FieldNotFound(); 
            
        return value; 
    }
    
    /**
     * See { IProductNft-setInstanceField }
     * 
     * Reverts: 
     * - {TokenIdNotFound} if `tokenId` doesn't refer to an existing token.
     * - {UnauthorizedAccess}: if caller is not authorized with the appropriate role
     * 
     * @param tokenId Id of the token to which the field is to be assigned. 
     * @param fieldName Name of the field to set. 
     * @param fieldValue Value of the field to assign. 
     */
    function setInstanceField(uint256 tokenId, string calldata fieldName, string calldata fieldValue) onlyRole(NFT_ISSUER_ROLE) external {
        //revert on invalid token id 
        if (tokenId > lastTokenId) {
            revert TokenIdNotFound();
        }
        //TODO: (DESIGN) should have event?
        
        bytes32 fieldKey = keccak256(abi.encodePacked(fieldName)); 
        instanceFields[tokenId][fieldKey] = fieldValue;
    } 
    
    function _stringIsEmpty(string memory s) internal pure returns (bool) {
        bytes memory bytesVal = bytes(s); 
        return (bytesVal.length == 0);
    }
} 