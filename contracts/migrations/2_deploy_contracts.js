const IjazahNFT = artifacts.require('IjazahNFT')

module.exports = async function (deployer, network, accounts) {
  // Use the first account as the initial owner
  const initialOwner = accounts[0]

  console.log('Deploying IjazahNFT contract...')
  console.log('Initial owner:', initialOwner)
  console.log('Network:', network)

  await deployer.deploy(IjazahNFT, initialOwner)

  const instance = await IjazahNFT.deployed()
  console.log('IjazahNFT deployed at:', instance.address)

  // Save deployment info to a file for frontend use
  const fs = require('fs')
  const path = require('path')

  const deploymentInfo = {
    address: instance.address,
    network: network,
    deployedAt: new Date().toISOString(),
    owner: initialOwner,
  }

  const deploymentPath = path.join(__dirname, '../deployments.json')
  let deployments = {}

  if (fs.existsSync(deploymentPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentPath))
  }

  deployments[network] = deployments[network] || {}
  deployments[network].IjazahNFT = deploymentInfo

  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2))

  console.log('Deployment info saved to deployments.json')
}
