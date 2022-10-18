import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-etherscan'
import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'

dotenvConfig({ path: resolve(__dirname, './.env') })

// Ensure that we have all the environment variables we need.
const pkey: string | undefined = process.env.PRIVATE_KEY
if (!pkey) {
  throw new Error('Please set your PRIVATE_KEY in a .env file')
}

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY
if (!infuraApiKey) {
  throw new Error('Please set your INFURA_API_KEY in a .env file')
}

const etherscanApiKey: string | undefined = process.env.ETHERSCAN_API_KEY
if (!etherscanApiKey) {
  throw new Error('Please set your ETHERSCAN_API_KEY in a .env file')
}

const config: HardhatUserConfig = {
  solidity: '0.8.9',
  networks: {
    hardhat: {
      chainId: 1337
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${infuraApiKey}`,
      accounts: [pkey]
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: etherscanApiKey
  },
  typechain: {
    outDir: 'src/types',
    target: 'ethers-v5'
  }
}

export default config
