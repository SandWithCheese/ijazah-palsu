const hre = require('hardhat')
const fs = require('fs')
const path = require('path')

async function main() {
  const [deployer] = await hre.ethers.getSigners()

  console.log('Deploying IjazahNFT contract...')
  console.log('Deployer address:', deployer.address)
  console.log('Network:', hre.network.name)

  // Deploy the contract
  const IjazahNFT = await hre.ethers.getContractFactory('IjazahNFT')
  const ijazahNFT = await IjazahNFT.deploy(deployer.address)
  await ijazahNFT.waitForDeployment()

  const contractAddress = await ijazahNFT.getAddress()
  console.log('IjazahNFT deployed at:', contractAddress)

  // Log role information
  const ISSUER_ROLE = await ijazahNFT.ISSUER_ROLE()
  console.log('ISSUER_ROLE hash:', ISSUER_ROLE)
  console.log('Admin is issuer:', await ijazahNFT.isIssuer(deployer.address))

  // Save deployment info to a file for frontend use
  const deploymentInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    admin: deployer.address,
    issuerRoleHash: ISSUER_ROLE,
  }

  const deploymentPath = path.join(__dirname, '../deployments.json')
  let deployments = {}

  if (fs.existsSync(deploymentPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentPath))
  }

  deployments[hre.network.name] = deployments[hre.network.name] || {}
  deployments[hre.network.name].IjazahNFT = deploymentInfo

  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2))

  console.log('Deployment info saved to deployments.json')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
