import '@nomiclabs/hardhat-ethers';
import 'hardhat-deploy-ethers';

import 'hardhat-deploy';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-abi-exporter';
import { setTrustedRemote } from './tasks';
import {
  accounts,
  ChainId,
  setupNetwork,
  setupNetworks,
} from '@layerzerolabs/lz-sdk';

import * as dotenv from 'dotenv';
import { HardhatUserConfig, task } from 'hardhat/config';

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('setTrustedRemote', 'asdasd', setTrustedRemote).addParam(
  'networks',
  'networks-.---'
);

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ALCHEMY_KEY = process.env.ALCHEMY_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  defaultNetwork: 'hardhat',

  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: true,
        interval: 5000,
      },
    },

    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.GOERLI_ALCHEMY_KEY}`,
      accounts: [`${PRIVATE_KEY}`],
    },
    baseGoerli: {
      chainId: 84531,
      url: 'https://goerli.base.org',
      accounts: [`${PRIVATE_KEY}`],
    },

    ...setupNetworks([
      // mainnets
      [ChainId.ETHEREUM, { rpcIndex: 0 }],
      [ChainId.BSC, { rpcIndex: 0 }],
      [ChainId.AVALANCHE, { rpcIndex: 0 }],
      [ChainId.POLYGON, { rpcIndex: 0 }],
      [ChainId.ARBITRUM, { rpcIndex: 0 }],
      [ChainId.OPTIMISM, { rpcIndex: 0 }],
      [ChainId.FANTOM, { rpcIndex: 0 }],
      [ChainId.SWIMMER, { rpcIndex: 0 }],
      [ChainId.DFK, { rpcIndex: 0 }],
      [ChainId.HARMONY, { rpcIndex: 0 }],

      // testnets
      [ChainId.RINKEBY, { rpcIndex: 0 }],
      [ChainId.BSC_TESTNET, { rpcIndex: 1 }],
      [ChainId.FUJI, { rpcIndex: 0 }],
      [ChainId.MUMBAI, { rpcIndex: 0 }],
      [ChainId.ARBITRUM_RINKEBY, { rpcIndex: 0 }],
      [ChainId.OPTIMISM_KOVAN, { rpcIndex: 0 }],
      [ChainId.FANTOM_TESTNET, { rpcIndex: 0 }],
    ]),
    // scrollTestnet: {
    //   chainId: 534353,
    //   url: `https://alpha-rpc.scroll.io/l2`,
    //   accounts: [`${PRIVATE_KEY}`],
    // },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  paths: {
    deployments: '../../packages/web3-config/deployments',
  },

  etherscan: {
    apiKey: {
      scrollTestnet: `${process.env.ETHERSCAN_API_KEY}`,
      baseGoerli: `${process.env.BASE_ETHERSCAN}`,
      goerli: process.env.ETHERSCAN_API_KEY as string,
      // scrollTestnet: `${process.env.ETHERSCAN_API_KEY}`,
    },
    customChains: [
      {
        network: 'baseGoerli',
        chainId: 84531,
        urls: {
          apiURL: 'https://api-goerli.basescan.org/api',
          browserURL: 'https://goerli.basescan.org/',
        },
      },
      {
        network: 'scrollTestnet',
        chainId: 534353,
        urls: {
          apiURL: 'https://blockscout.scroll.io/api',
          browserURL: 'https://blockscout.scroll.io/',
        },
      },
      // {
      //   network: 'arbitrumGoerli',
      //   chainId: 421613,
      //   urls: {
      //     apiURL: 'https://api-goerli.arbiscan.io/api',
      //     browserURL: 'https://goerli.arbiscan.io/',
      //   },
      // },
    ],
  },
  typechain: {
    outDir: '../../packages/web3-config/typechain',
    target: 'ethers-v5',
    alwaysGenerateOverloads: true,
  },

  abiExporter: {
    path: './abi',
    clear: true,
    flat: true,
    spacing: 2,
    runOnCompile: true,
  },
};

export default config;
