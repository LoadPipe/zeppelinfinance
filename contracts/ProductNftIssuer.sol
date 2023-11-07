// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "./interfaces/IProductNftStore.sol";
import "./interfaces/IProductNftFactory.sol";
import "./interfaces/IProductNft.sol";
import "./interfaces/INftPolicy.sol";
import "./ManagedSecurity.sol";

/**
 * @title ProductNftIssuer 
 * 
 * Issues and mints Product NFTs, and posts them for sale in the store. 
 * 
 * 'Issuing' refers to creating a new deployment of the ProductNft contract on the 
 * blockchain, at a new address. 'Minting' refers to minting new instances (each with a 
 * unique token id) of that ProductNft contract. 
 * 
 * Lateral Relationships: 
 * - ISecurityManager
 * - IWhitelist 
 * - IProductNftFactory
 * - IProductNftStore 
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 * All rights reserved. Unauthorized use prohibited.
 */
contract ProductNftIssuer is ManagedSecurity {
    IProductNftFactory public nftFactory;
    IProductNftStore public nftStore;
    INftPolicy public refundPolicy;
    mapping(address => mapping(address => uint256)) sellersToNfts; 
    
    //errors 
    error CallerNotNftOwner(address, address); 
    error SellerNotAuthorized(address); 
    error InvalidTokenId(address, uint256); 
    error InvalidAction(); 
    error InvalidParams();
    
    //events 
    event NftCreated(
        address indexed creator,
        address nftAddress
    ); 
    
    event NftMinted(
        address indexed creator,
        address indexed nftAddress, 
        uint256 tokenId
    ); 
    
    //modifiers 
    modifier onlyNftOwner(address nftAddress) {
        IProductNft nft = IProductNft(nftAddress); 
        if (nft.owner() != _msgSender())
            revert CallerNotNftOwner(_msgSender(), nftAddress);
        if (!securityManager.isAuthorizedSeller(_msgSender()))
            revert SellerNotAuthorized(_msgSender());
        _;
    }
    
    /**
     * Constructs an instance of the ProductNftIssuer contract. 
     * 
     * Reverts: 
     * - {ZeroAddressArgument} if `securityManager` address is 0x0
     * - 'Address: low-level delegate call failed' (if `securityManager` is not legit)
     * 
     * @param securityManager Contract which will manage secure access for this contract. 
     * @param _nftFactory Does the work of instantiating the ProductNft on the blockchain.
     */
    constructor(
        ISecurityManager securityManager, 
        IProductNftFactory _nftFactory,
        IProductNftStore _nftStore, 
        INftPolicy _refundPolicy
    ) {
        _setSecurityManager(securityManager);
        
        nftFactory = _nftFactory;
        nftStore = _nftStore;
        refundPolicy = _refundPolicy;
    }
    
    //STEP 1: create NFT 
    /**
     * Creates a new instance of ProductNft on the blockchain, with the caller as 
     * the owner, and the specified parameters and field names. 
     * 
     * Events: //TODO: comment
     * 
     * Reverts: 
     * - {UnauthorizedAccess}: if caller is not authorized with the appropriate role
     * - {SellerNotAuthorized} if the caller is not an authorized seller. 
     * 
     * @param productName Name of the product that the NFT refers to.
     * @param symbol standard NFT symbol. 
     * @param fieldNames Array of custom field names for the parent NFT. 
     * @param fieldValues Array of custom field values for the parent NFT.
     */
    function createNft(
        string calldata productName, 
        string calldata symbol, 
        string[] calldata fieldNames, 
        string[] calldata fieldValues
    ) external onlyRole(NFT_SELLER_ROLE) returns (address) {  
        
        //check that seller is authorized 
        if (!securityManager.isAuthorizedSeller(_msgSender()))
            revert SellerNotAuthorized(_msgSender());
        
        IProductNft nft = nftFactory.createProductNft(
            _msgSender(),
            productName, 
            symbol
        );
        sellersToNfts[_msgSender()][address(nft)] = 0; 
        
        for (uint n = 0; n < fieldNames.length; n++) {
            nft.setField(fieldNames[n], fieldValues[n]); 
        }
        
        return address(nft);
    }
    
    //STEP 2: attach policies 
    /**
     * Attaches NFT policies to the specified NFT, if security criteria are met. This operation
     * can only be performed before any tokens have been minted for the given NFT.
     * 
     * Reverts: 
     * - { InvalidAction } if token minted quantity is > 0. 
     * - {CallerNotNftOwner} if the caller is not the owner of the given NFT. 
     * - {SellerNotAuthorized} if the caller is not an authorized seller. 
     * - {UnauthorizedAccess}: if caller is not authorized with the appropriate role
     * 
     * @param nftAddress The address of an NFT to which to attach the policies.
     * @param nftPolicies The addresses of contracts which define the policies to attach.
     */
    function attachNftPolicies(
        address nftAddress,
        INftPolicy[] calldata nftPolicies
    ) external 
        onlyRole(NFT_SELLER_ROLE) 
        onlyNftOwner(nftAddress) 
    {
        IProductNft nft = IProductNft(nftAddress); 
        if (nft.totalMinted() > 0) 
            revert InvalidAction(); 
            
        for (uint256 n=0; n<nftPolicies.length; n++) {
            //attach the policy 
            nft.attachPolicy(address(nftPolicies[n]));
            
            //if policy is fill-or-kill, attach refund policy 
            //TODO: (BUG) will cause error if a refund already attached 
            if (nftPolicies[n].isFillOrKill()) {
                nft.attachPolicy(address(refundPolicy));
            }
        }
    }
    
    //STEP 3: mint 
    /**
     * Mints a given quantity of tokens for the specified NFT. 
     * 
     * Reverts: 
     * - { InvalidParams } if the length of fieldValues != the length of fieldNames * quantity. 
     * - see reverts for { ProductNft-mint }
     * - {CallerNotNftOwner} if the caller is not the owner of the given NFT. 
     * - {SellerNotAuthorized} if the caller is not an authorized seller. 
     * - {UnauthorizedAccess}: if caller is not authorized with the appropriate role
     * 
     * Emits: 
     * - { NftMinted } after each NFT instance minted. 
     * - { IERC721-Transfer } for each NFT instance minted.
     * 
     * @param nftAddress Address of the NFT to mint. 
     * @param quantity The number of tokens to mint. 
     * @param fieldNames (optional) Names of any instance fields to set on the new tokens.
     * @param fieldValues (optional) Values of any instance fields to set on the new tokens.
     */
    function mintNfts(
        address nftAddress, 
        uint256 quantity, 
        string[] calldata fieldNames,
        string[] calldata fieldValues
    ) external 
        onlyRole(NFT_SELLER_ROLE) //TODO: unnecessary
        onlyNftOwner(nftAddress) 
        returns (uint256) 
    {
        uint256 lastTokenId = 0;
        
        //check that array lengths are good 
        if (fieldValues.length != fieldNames.length * quantity) {
            revert InvalidParams(); 
        }
        
        //get the NFT 
        IProductNft nft = IProductNft(nftAddress); 
        string[] memory affiliateIds;
        uint256 fieldValueIndex = 0;
        
        for (uint256 n=0; n<quantity; n++) {
            //mint to the NFT owner
            lastTokenId = nft.mint(nft.owner(), 1, affiliateIds);
            
            for (uint256 i=0; i<fieldNames.length; i++) {
                nft.setInstanceField(lastTokenId, fieldNames[i], fieldValues[fieldValueIndex++]); 
            }
            
            emit NftMinted(_msgSender(), address(nft), lastTokenId);
        }
        
        return lastTokenId;
    }
    
    //STEP 4: post to store 
    /**
     * Posts the specified NFT for sale in the NftStore. 
     * 
     * Reverts: 
     * - {CallerNotNftOwner} if the caller is not the owner of the given NFT. 
     * - {SellerNotAuthorized} if the caller is not an authorized seller. 
     * - {UnauthorizedAccess}: if caller is not authorized with the appropriate role
     * 
     * @param nftAddress The address of the NFT to post for sale.
     * @param price The price at which to sell the NFT. 
     */
    //TODO: (DESIGN) better to pass the store address 
    function postToStore(
        address nftAddress, 
        uint256 price
    ) external 
        onlyRole(NFT_SELLER_ROLE) 
        onlyNftOwner(nftAddress) 
    {
        nftStore.postForSale(nftAddress, price);
    }
}