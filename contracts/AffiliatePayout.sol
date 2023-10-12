// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ManagedSecurity.sol";
import "./interfaces/IZeppelinOracle.sol";
import "./interfaces/IProductNft.sol";
import "./interfaces/INftPolicy.sol";

/**
 * @title AffiliatePayout 
 * 
 * Handles royalties payouts to NFT holders. Calculates amount owed based on a formula, 
 * and data taken from ZeppelinOracle.
 * 
 * Lateral Relationships: 
 * - ISecurityManager
 * - ZeppelinOracle 
 * 
 * @author John R. Kosinski
 * Zeppelin Finance 2023
 * All rights reserved. Unauthorized use prohibited.
 */
//TODO: (DESIGN) could be upgradeable
//TODO: (DESIGN) need min payout 
contract AffiliatePayout is ManagedSecurity, ReentrancyGuard {
    IZeppelinOracle public zeppelin; 
    
    // nft address => (token id => amount paid)
    mapping(address => mapping(uint256 => uint256)) public paymentRecord; 
    
    //errors 
    error NftNotOwned(address, uint256);
    
    /**
     * Constructs an instance of the AffiliatePayout contract. 
     * 
     * Reverts: 
     * - {ZeroAddressArgument} if `securityManager` address is 0x0
     * - {ZeroAddressArgument} if `_zeppelin` address is 0x0
     * - 'Address: low-level delegate call failed' (if `securityManager` is not legit)
     * 
     * @param securityManager Contract which will manage secure access for this contract. 
     * @param _zeppelin Reference to the Zeppelin Oracle. 
     */
    constructor(ISecurityManager securityManager, IZeppelinOracle _zeppelin) {
        if (address(_zeppelin) == address(0))
            revert ZeroAddressArgument();
            
        zeppelin = _zeppelin;
        _setSecurityManager(securityManager);
    }
    
    /**
     * Pays out all owed funds in native currency, for the given ProductNft and specific 
     * token. 
     * 
     * Reverts: 
     * - {NftNotOwned} if the caller does not own the specified token. 
     * - {PaymentFailed} if the payment transfer fails for any reason.
     */
    function buyerWithdraw(address nftAddress, uint256 tokenId) external nonReentrant {
        IProductNft nft = IProductNft(nftAddress); 
        
        //verify that caller owns the NFT in question, and is not the seller
        if (nft.ownerOf(tokenId) != _msgSender() || _msgSender() == nft.owner()) {
            revert NftNotOwned(nftAddress, tokenId);
        }
        
        //calculate amount owed 
        uint256 owed = getAmountOwed(nftAddress, tokenId);
                
        if (owed > 0) {
            
            //record the payment 
            paymentRecord[nftAddress][tokenId] += owed; 
        
            //pay out 
            (bool success, ) = _msgSender().call{value:owed}("");
            require(success, "Payment failed"); 
        }
    }
    
    /**
     * Iterates each policy attached to the given NFT to determine the amount owed in 
     * rewards to the NFT holder of the specified token, with any amounts already paid 
     * out subtracted from the final total (i.e. will return 0 if all attached rewards 
     * have already been paid out). 
     * 
     * @param nftAddress Address of the ProductNft. 
     * @param tokenId Id of the specific instance of the NFT to calculate for. 
     * @return (uint256) The amount owed in wei. 
     */
    function getAmountOwed(address nftAddress, uint256 tokenId) public view returns (uint256) {
        IProductNft nft = IProductNft(nftAddress); 
        uint256 owed = 0; 
        address[] memory policies = nft.getPolicies();
        
        for(uint256 i=0; i<policies.length; i++) {
            INftPolicy policy = INftPolicy(policies[i]);
            owed += policy.getAmountOwed(nft, tokenId, zeppelin);
        }
        
        //subtract amount that's already been paid 
        uint256 amountPaid = paymentRecord[nftAddress][tokenId]; 
        if (owed > amountPaid) {
            owed = owed - amountPaid;
        }
        else {
            owed = 0; 
        }
        
        return owed;
    }
    
    //TODO: (DESIGN) get amount owed per nft per user (owner), rather than per token ID
    
    /**
     * Empty receive function, for funding the contract. 
     */
    receive() external payable { }
}