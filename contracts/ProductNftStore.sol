// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IProductNftStore.sol";
import "./interfaces/IProductNft.sol";
import "./ManagedSecurity.sol";

/**
 * @title ProductNftStore 
 * 
 * Sells Product NFTs; allows sellers to post NFTs for sale, which are then sold to buyers.
 * 
 * Lateral Relationships: 
 * - ISecurityManager
 * - IWhitelist 
 * - IProductNft
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 * All rights reserved. Unauthorized use prohibited.
 */
//TODO: (DESIGN) make upgradeable 
contract ProductNftStore is ManagedSecurity, IProductNftStore, ReentrancyGuard {
    
    //(nft address => price in wei)
    mapping(address => uint256) public nftsToPrices; 
    
    //(nft address => revenue in wei)
    mapping(address => uint256) public nftRevenue; 
    
    // nft address => (token id => amount paid in wei)
    mapping(address => mapping(uint256 => uint256)) public paymentRecord; 
    
    address[] public nfts;
    //TODO: (DESIGN) should there be a minimum price?
    
    //events
    event NftPurchased(
        address indexed nftAddress, 
        address indexed buyer,
        uint256 price
    );
    event NftPayout(
        address indexed nftAddress, 
        address indexed recipient,
        uint256 amount
    );
    
    //errors 
    error NftNotOwned(address, uint256);
    error CallerNotNftOwner(address caller, address nft); 
    error ZeroValueArgument();
    error NftInstanceUnavailable(address, uint256);
    error InsufficientPayment(uint256, uint256); 
    error SellerNotAuthorized(address); 
    
    /**
     * Constructs an instance of the ProductNftStore contract. 
     * 
     * Reverts: 
     * - {ZeroAddressArgument} if `securityManager` address is 0x0
     * - 'Address: low-level delegate call failed' (if `securityManager` is not legit)
     * 
     * @param securityManager Contract which will manage secure access for this contract. 
     */
    constructor(ISecurityManager securityManager) {
        _setSecurityManager(securityManager);
    }
    
    /**
     * See { IProductNftStore-postForSale }
     * 
     * Reverts: 
     * - {ZeroValueArgument} - if `price` is zero 
     * - {UnauthorizedAccess}: if caller is not authorized with the appropriate role
     */
    //TODO: (TEST) integration tests for changing price, + changing price and refunding 
    function postForSale(address nftAddress, uint256 price) onlyRole(NFT_ISSUER_ROLE) external override {
        if (price == 0) {
            revert ZeroValueArgument();
        }
        nftsToPrices[nftAddress] = price;
        nfts.push(nftAddress);
    }
    
    /**
     * Gets the addresses of all ProductNfts currently posted for sale in the store, even 
     * if no actual instances of those NFTs are still available for purchase. 
     */
    function getNftsForSale() external view returns (address[] memory) {
        return nfts;
    }
    
    /**
     * Gets the price for an instance of the specified ProductNft. 
     * 
     * @param nftAddress The address of the ProductNft in question.
     * @return (uint256) The price in wei. 
     */
    function getPrice(address nftAddress) external view returns (uint256) {
        return nftsToPrices[nftAddress]; 
    }
    
    /**
     * See { IProductNftStore-purchaseNft }
     * 
     * Reverts: 
     * - {InsufficientPayment} if amount transferred is not sufficient 
     * - {ZeroValueArgument} if `price` is zero 
     * - {NftInstanceUnavailable} if specified token not for sale, or already sold
     * //TODO: comment - add reverts of IERC721-Transfer
     * 
     * Emits: 
     * - {IERC721-Transfer} on successful transfer
     */
    function purchaseNft(address nftAddress, uint256 tokenId) external override payable {
        uint256 price = nftsToPrices[nftAddress]; 
        
        //this makes sure that the NFT is for sale at all 
        if (price == 0) 
            revert NftInstanceUnavailable(nftAddress, tokenId); 
        
        //ensure that payment is sufficient
        if (msg.value < price)
            revert InsufficientPayment(price, msg.value);
        
        IProductNft nft = IProductNft(nftAddress); 
        
        //this makes sure that the NFT owner is the owner of the instance 
        if (nft.ownerOf(tokenId) != nft.owner())
            revert NftInstanceUnavailable(nftAddress, tokenId); 
            
        //add to nft revenue 
        nftRevenue[nftAddress] += msg.value;
        
        //transfer 
        nft.transferFrom(nft.owner(), _msgSender(), tokenId); 
        
        emit NftPurchased(address(nft), _msgSender(), msg.value);
    }
    
    /**
     * Allows the seller to withdraw all funds owed from proceeds of sold NFTs. 
     * 
     * Reverts: 
     * - { CallerNotNftOwner } If the caller is not the owner of the specified NFT.
     * - If payment fails for any reason (doesn't return success)
     * 
     * @param nftAddress The address of the NFT for which to withdraw sales. 
     */
    function sellerWithdraw(address nftAddress) external nonReentrant {
        //check that caller is authorized seller 
        if (!securityManager.isAuthorizedSeller(_msgSender()))
            revert SellerNotAuthorized(_msgSender());
        
        IProductNft nft = IProductNft(nftAddress); 
            
        //check that caller is owned of NFT in question 
        if (_msgSender() != nft.owner()) 
            revert CallerNotNftOwner(_msgSender(), nftAddress);
        
        //check that caller is nft owner 
        if (nft.owner() != _msgSender()) {
            revert CallerNotNftOwner(_msgSender(), nftAddress);
        }
        
        uint256 owed = getAmountOwedSeller(nftAddress); 
        
        if (owed > 0) {
            (bool success,) = payable(_msgSender()).call{value: owed}("");
            require(success, "Payment failed"); 
        }
        
        //mark the seller as paid 
        nftRevenue[nftAddress] -= owed;
    }
    
    /**
     * Calculates the amount owed to the seller of the specified NFT. 
     * 
     * @param nftAddress The address of the NFT for which to calculate amount owed. 
     */
    function getAmountOwedSeller(address nftAddress) public view returns (uint256) {
        return nftRevenue[nftAddress]; 
    }
    
    //TODO: (DESIGN) get amount owed per nft per user (owner), rather than per token ID
}