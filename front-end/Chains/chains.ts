import Chain from '@/Models/chain'

export const gnosisChain: Chain = {
  id: '0x64',
  token: 'xDai',
  shortName: 'gno',
  label: 'Gnosis Chain',
  key: 'gnosis',
  rpcUrl: 'https://rpc.gnosischain.com',
  blockExplorerUrl: 'https://gnosisscan.io',
  color: '#3e6957',
  transactionServiceUrl: 'https://safe-transaction-gnosis-chain.safe.global',
}

export const goerliChain: Chain = {
  id: '0x5',
  token: 'gETH',
  label: 'Görli',
  shortName: 'gor',
  key: 'goerli',
  rpcUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  blockExplorerUrl: 'https://goerli.etherscan.io',
  color: '#fbc02d',
  transactionServiceUrl: 'https://safe-transaction-goerli.safe.global',
}

export const mainnetChain: Chain = {
  id: '0x1',
  token: 'ETH',
  label: 'Ethereum',
  shortName: 'eth',
  key: 'mainnet',
  rpcUrl: 'https://cloudflare-eth.com',
  blockExplorerUrl: 'https://etherscan.io',
  color: '#DDDDDD',
  transactionServiceUrl: 'https://safe-transaction-mainnet.safe.global',
}

export const polygonChain: Chain = {
  id: '0x89',
  token: 'matic',
  shortName: 'matic',
  label: 'Polygon',
  key: 'polygon',
  rpcUrl: 'https://polygon-rpc.com',
  blockExplorerUrl: 'https://polygonscan.com',
  color: '#8248E5',
  transactionServiceUrl: 'https://safe-transaction-polygon.safe.global',
}

export const mumbaiChain: Chain = {
  id: '0x13881',
  token: 'matic',
  shortName: 'matic',
  label: 'Mumbai',
  key: 'matic_mumbai',
  rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
  blockExplorerUrl: 'https://mumbai.polygonscan.com',
  color: '#8248E5',
  faucetUrl: 'https://mumbaifaucet.com/'
}

export const sepoliaChain: Chain = {
  id: '0xaa36a7',
  token: 'ETH',
  shortName: 'ETH',
  label: 'Sepolia',
  key: 'sepolia',
  rpcUrl: 'https://rpc.sepolia.org',
  blockExplorerUrl: 'https://sepolia.etherscan.io/',
  color: '#8248E5',
  faucetUrl: 'https://sepoliafaucet.com/'
}

export const maticZkevmGoerli: Chain = {
  id: '0x5a2',
  token: 'matic',
  shortName: 'matic',
  key: 'zkevm_testnet',
  label: 'Matic ZKEVM',
  rpcUrl: 'https://rpc.public.zkevm-test.net',
  blockExplorerUrl: 'https://zkevm.polygonscan.com/',
  color: '#8248E5',
  faucetUrl: 'https://faucet.quicknode.com/polygon/zkevm-goerli'
}

export const scrollSepolia: Chain = {
  id: '0x8274f',
  token: 'ETH',
  shortName: 'ETH',
  label: 'Scroll Sepolia',
  key: 'scroll_sepolia',
  rpcUrl: 'https://scroll-sepolia.blockpi.network/v1/rpc/public',
  blockExplorerUrl: 'https://sepolia-blockscout.scroll.io/',
  color: '#8248E5',
  faucetUrl: 'https://faucet.quicknode.com/scroll/sepolia'
}

const chains: Chain[] = [sepoliaChain, maticZkevmGoerli, scrollSepolia, mumbaiChain, gnosisChain, goerliChain, mainnetChain, polygonChain]

export const initialChain = mumbaiChain

export default chains