const hre = require("hardhat");
const fs = require('fs');

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    const CryptoDevsNFT = await hre.ethers.getContractFactory("CryptoDevsNFT");
    const cryptodevsnft = await CryptoDevsNFT.deploy();
    console.log(cryptodevsnft.target);

    const FakeNFTMarketplace = await hre.ethers.getContractFactory("FakeNFTMarketplace");
    const fakenftmarketplace = await FakeNFTMarketplace.deploy();
    console.log(fakenftmarketplace.target);

    const CryptoDevsDAO = await hre.ethers.getContractFactory("CryptoDevsDAO");
    const cryptodevsdao = await CryptoDevsDAO.deploy(cryptodevsnft.target, fakenftmarketplace.target);
    console.log(cryptodevsdao.target);

}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });