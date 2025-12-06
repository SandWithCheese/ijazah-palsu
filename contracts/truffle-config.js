require('dotenv').config({ path: '../.env' })

module.exports = {
  networks: {
    // Development network (Ganache via Docker)
    development: {
      host: '127.0.0.1', // Localhost for development
      port: 8545, // Ganache port
      network_id: '5777', // Match any network id
      gas: 6721975,
      gasPrice: 20000000000,
    },

    // Docker network (for deployment from within containers)
    docker: {
      host: 'ganache', // Service name in docker-compose
      port: 8545,
      network_id: '5777',
      gas: 6721975,
      gasPrice: 20000000000,
    },

    // Testnet configuration (uncomment when needed)
    // sepolia: {
    //   provider: () => new HDWalletProvider(
    //     process.env.MNEMONIC,
    //     `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    //   ),
    //   network_id: 11155111,
    //   gas: 5500000,
    //   confirmations: 2,
    //   timeoutBlocks: 200,
    //   skipDryRun: true
    // },
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.8.20', // Fetch exact version from solc-bin
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: 'paris',
      },
    },
  },

  // Truffle DB is currently disabled by default
  db: {
    enabled: false,
  },

  // Directory configuration
  contracts_directory: './contracts',
  contracts_build_directory: '../public/contracts',
  migrations_directory: './migrations',
  test_directory: './test',

  // Plugin configuration
  plugins: [],
}
