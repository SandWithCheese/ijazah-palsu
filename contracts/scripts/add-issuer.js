// * npx hardhat run scripts/add-issuer.js --network sepolia

const { ethers } = require('hardhat')

async function main() {
  const NEW_ISSUER_ADDRESS = '[ya isi ntar]'

  // Dapatkan contract address dari deployments.json
  const deployments = require('../deployments.json')
  const contractAddress = deployments.sepolia.contractAddress

  const IjazahNFT = await ethers.getContractFactory('IjazahNFT')
  const contract = await IjazahNFT.attach(contractAddress)

  console.log('Adding issuer:', NEW_ISSUER_ADDRESS)
  const tx = await contract.addIssuer(NEW_ISSUER_ADDRESS)
  await tx.wait()

  console.log('Issuer added successfully!')
  console.log('Is Issuer:', await contract.isIssuer(NEW_ISSUER_ADDRESS))
}

main().catch(console.error)
