// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
/**
 * Interface for the FakeNFTMarketplace
 */
interface IFakeNFTMarketplace {
    /// @dev getPrice() returns the price of an NFT from the FakeNFTMarketplace
    /// @return Returns the price in Wei for an NFT
    function getPrice() external view returns (uint256);

    /// @dev available() returns whether or not the given _tokenId has already been purchased
    /// @return Returns a boolean value - true if available, false if not
    function available(uint256 _tokenId) external view returns (bool);

    /// @dev purchase() purchases an NFT from the FakeNFTMarketplace
    /// @param _tokenId - the fake NFT tokenID to purchase
    function purchase(uint256 _tokenId) external payable;
}

/**
 * Minimal interface for CryptoDevsNFT containing only two functions
 * that we are interested in
 */
interface ICryptoDevsNFT {
    /// @dev balanceOf returns the number of NFTs owned by the given address
    /// @param owner - address to fetch number of NFTs for
    /// @return Returns the number of NFTs owned
    function balanceOf(address owner) external view returns (uint256);

    /// @dev tokenOfOwnerByIndex returns a tokenID at given index for owner
    /// @param owner - address to fetch the NFT TokenID for
    /// @param index - index of NFT in owned tokens array to fetch
    /// @return Returns the TokenID of the NFT
    function tokenOfOwnerByIndex(address owner, uint256 index)
        external
        view
        returns (uint256);
}

contract CryptoDevsDAO is Ownable {
    
    struct Proposal {
        uint256 id;
        uint256 nftTokenId;
        uint256 deadline;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
        mapping(address => bool) voters;
    }

    mapping(uint256 => Proposal) public proposals;
    ICryptoDevsNFT public nftContract;
    IFakeNFTMarketplace public marketplace;
    uint256 private _proposalIdCounter;

    constructor(address _nftContract, address _marketplace) Ownable(msg.sender) payable {
        nftContract = ICryptoDevsNFT(_nftContract);
        marketplace = IFakeNFTMarketplace(_marketplace);
    }

    function createProposal(uint256 _nftTokenId) external returns (uint256) {
        require(marketplace.available(_nftTokenId), "NFT not for sale");
        _proposalIdCounter += 1;
  

        Proposal storage proposal = proposals[_proposalIdCounter];
        proposal.id = _proposalIdCounter;
        proposal.nftTokenId = _nftTokenId;
        proposal.deadline = block.timestamp + 1 weeks;

        return _proposalIdCounter;
    }

    function vote(uint256 proposalId, bool voteFor) external {
        Proposal storage proposal = proposals[proposalId];
        //require(block.timestamp <= proposal.deadline, "Voting period has ended");
        require(nftContract.balanceOf(msg.sender) > 0, "Must own at least one NFT to vote");
        require(!proposal.voters[msg.sender], "Already voted");

        proposal.voters[msg.sender] = true;
        if (voteFor) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.deadline, "Voting period not over");
        require(!proposal.executed, "Proposal already executed");

        proposal.executed = true;
        if (proposal.votesFor > proposal.votesAgainst) {
            require(address(this).balance >= marketplace.getPrice(), "Not enough funds");
            marketplace.purchase{value: marketplace.getPrice()}(proposal.nftTokenId);
        }
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed.");
    }

    function proposalCount() external view returns (uint256) {
        return _proposalIdCounter;
    }
    
    function getProposal(uint256 _proposalId) external view returns (
        uint256 id,
        uint256 nftTokenId,
        uint256 votesFor,
        uint256 votesAgainst,
        bool executed
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.nftTokenId,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.executed
        );
    }

receive() external payable {}

fallback() external payable {}
}
