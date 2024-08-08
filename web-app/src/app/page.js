
'use client'
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CryptoDevsNFT from "./CryptoDevsNFT.json";
import FakeNFTMarketplace from "./FakeNFTMarketplace.json";
import CryptoDevsDAO from "./CryptoDevsDAO.json";

const CRYPTODEVS_NFT_ADDRESS = "0xb8c604c4d243Be325457F820dB4a35E80333C246";
const FAKE_NFT_MARKETPLACE_ADDRESS = "0x39116C9e347207AC11BEd441E50108E550bBEfC6";
const CRYPTODEVS_DAO_ADDRESS = "0xF3B45Db837F53151eEb29bbFAC6EE7B04653C04c";

export default function Home() {
    const [proposals, setProposals] = useState([]);
    const [currentAccount, setCurrentAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [daoContract, setDaoContract] = useState(null);
    const [marketplaceContract, setMarketplaceContract] = useState(null);

    useEffect(() => {
        const loadBlockchainData = async () => {
            let localProvider;
            let localSigner;  
            if (window.ethereum) {
                localProvider = new ethers.BrowserProvider(window.ethereum);
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log("MetaMask is installed. Accounts requested.");
                localSigner = await localProvider.getSigner();
                console.log("Signer obtained.");
                const _daoContract = new ethers.Contract(CRYPTODEVS_DAO_ADDRESS, CryptoDevsDAO.abi, localSigner);
                setDaoContract(_daoContract);
                const _marketplaceContract = new ethers.Contract(FAKE_NFT_MARKETPLACE_ADDRESS, FakeNFTMarketplace.abi, localSigner);
                setMarketplaceContract(_marketplaceContract);

                const count = await _daoContract.proposalCount();
                let loadedProposals = [];
                for (let i = 0; i < count; i++) {
                  const proposal = await _daoContract.getProposal(i);
                  loadedProposals.push(proposal);
                }
            setProposals(loadedProposals);

            } else {
                console.log("No Ethereum wallet found");
            }
        };
        loadBlockchainData();
    }, []);

    const createProposal = async (nftTokenId) => {
        try {
            const tx = await daoContract.createProposal(nftTokenId);
            await tx.wait();
            const proposal = await daoContract.getProposal(nftTokenId);
            loadedProposals.push(proposal);
            setProposals(loadedProposals);
            alert("Proposal created successfully");
            
        } catch (error) {
            console.error("Error creating proposal:", error);
        }
    };

    const voteOnProposal = async (proposalId, voteFor) => {
        try {
            const tx = await daoContract.vote(proposalId, voteFor);
            await tx.wait();
            alert("Voted successfully");
        } catch (error) {
            console.error("Error voting on proposal:", error);
        }
    };

    const executeProposal = async (proposalId) => {
        try {
            const tx = await daoContract.executeProposal(proposalId);
            await tx.wait();
            alert("Proposal executed successfully");
        } catch (error) {
            console.error("Error executing proposal:", error);
        }
    };

    return (
        <div>
            <h1>CryptoDevs DAO</h1>
            <div>
                <input
                    type="number"
                    placeholder="NFT Token ID"
                    id="nftTokenId"
                />
                <button onClick={() => createProposal(document.getElementById("nftTokenId").value)}>Create Proposal</button>
            </div>
            <div>
            {proposals.length > 0 ? (
            proposals.map((proposal, index) => (
        <div key={index}>
            <h2>Proposal ID: {proposal.id.toString()}</h2>
            <p>NFT Token ID: {proposal.nftTokenId.toString()}</p>
            <p>Deadline: {proposal.deadline}</p>
            <button onClick={() => voteOnProposal(proposal.id, true)}>Vote For</button>
            <button onClick={() => voteOnProposal(proposal.id, false)}>Vote Against</button>
            <button onClick={() => executeProposal(proposal.id)}>Execute</button>
        </div>
    ))
) : (
    <p>No proposals available.</p>
)}
            </div>
        </div>
    )};
