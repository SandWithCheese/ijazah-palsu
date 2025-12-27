require('dotenv').config({ path: '../.env' })
require('@nomicfoundation/hardhat-toolbox')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: 'paris',
    },
  },

  networks: {
    // Local Hardhat network (default when running `npx hardhat node`)
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },

    // Docker network (for deployment from within containers)
    docker: {
      url: 'http://ganache:8545',
      chainId: 1337,
    },

    // Sepolia Testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: 11155111,
      gasPrice: 10000000000, // 10 gwei
    },
  },

  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: '../public/contracts',
  },
}
