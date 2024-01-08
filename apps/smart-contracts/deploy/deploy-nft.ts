import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import LZ_ENDPOINTS from '../constants/layerzeroEndpoints.json';
import startIndex from '../constants/start.json';

const name = 'LFGCrossChainNFT';

const one = {
  name: 'Fancy NFT',
  symbol: 'FANCY',
  uri: 'https://gateway.pinata.cloud/ipfs/QmP8mACtdP7KyGEQT8NZqxHeDceDWg6yNyHTeVzAj2i1qG/',
};

const two = {
  name: 'Austro',
  symbol: 'Austro',
  uri: 'https://gateway.pinata.cloud/ipfs/QmZSc97chhSAc2cgUcYZ1Vuj4V8pztdDnSFkJJqH1rNPMv/',
};

const three = {
  name: 'DegenTime',
  symbol: 'DGN',
  uri: 'https://gateway.pinata.cloud/ipfs/QmQtxJvWjXhEwL7RTKnntPRASsKH4FTVydmaVYnRteGzUp/',
};

const current = three;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;

  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  const endpointAddr = (LZ_ENDPOINTS as any)[hre.network.name];
  const start = (startIndex as any)[hre.network.name];
  console.log(
    `[${hre.network.name}] LayerZero Endpoint address: ${endpointAddr}`,
    'startindex:',
    start
  );

  const contract = await deploy('LFGCrossChainNFT', {
    from: deployer,
    args: [endpointAddr, start, current.uri],
    log: true,
    estimateGasExtra: 500_000,
  });

  console.log(
    `npx hardhat verify ${contract.address}  "${endpointAddr}" "${start}" "${current.uri}" --network ${hre.network.name}`
  );
};

func.tags = [name];
export default func;
