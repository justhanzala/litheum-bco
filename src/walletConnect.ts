import './style.css'
// import { WalletConnectProvider } from '@walletconnect/web3-provider';
// import Web3Modal from 'web3modal';

let slipper = document.getElementById('slippage-dd');
if (slipper) {
    slipper.style.display = 'none';
    function showSlippage() {
      if (slipper) {
        slipper.style.display = 'block';
      }
    }
}

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers'

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = 'de09b512de24701dffa1302cc42e4448'

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
}
const sepolia = {
  chainId: 11155111,
  name: 'SepoliaEthereum',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: 'https://1rpc.io/sepolia'
}

// 3. Create your application's metadata object
const metadata = {
  name: 'My Website',
  description: 'My Website description',
  url: 'https://mywebsite.com', // url must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: 1 // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
const modal = createWeb3Modal({
  ethersConfig,
  chains: [sepolia],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})



const openConnectModalBtn = document.getElementById('open-connect-modal')
const openNetworkModalBtn = document.getElementById('open-network-modal')
const swapBtn = document.getElementById('swap')

swapBtn && swapBtn.style.display === 'none';

openConnectModalBtn && openConnectModalBtn.addEventListener('click', () => modal.open())
openNetworkModalBtn && openNetworkModalBtn.addEventListener('click', () => modal.open({ view: 'Networks' }))



import { BrowserProvider, Contract, formatUnits } from 'ethers'

// const USDTAddress = '0x617f3112bf5397D0467D315cC709EF968D9ba546'

// The ERC-20 Contract ABI, which is a common contract interface
// for tokens (this is the Human-Readable ABI format)
// const USDTAbi = [
//   'function name() view returns (string)',
//   'function symbol() view returns (string)',
//   'function balanceOf(address) view returns (uint)',
//   'function transfer(address to, uint amount)',
//   'event Transfer(address indexed from, address indexed to, uint amount)'
// ]

const isConnected = modal.getIsConnected()
const walletProvider = modal.getWalletProvider()

if (isConnected) {
  console.log('User connected')
  getBalance()
  openConnectModalBtn && (openConnectModalBtn.style.display = 'none')
  swapBtn && (swapBtn.style.display = 'block')

}

async function getBalance() {
  if (!isConnected) throw Error('User disconnected')

  if (!walletProvider) throw Error('Provider not found')
  const ethersProvider = new BrowserProvider(walletProvider)
  const signer = await ethersProvider.getSigner()
  // The Contract object
  const address = await signer.getAddress()
  const modalAddress = modal.getAddress()

  console.log('address', address)
  console.log('modalAddress', modalAddress)
  // const USDTContract = new Contract(USDTAddress, USDTAbi, signer)
  // const USDTBalance = await USDTContract.balanceOf(address)

  // console.log(formatUnits(USDTBalance, 18))
}
// slipper.style.display = 'none';

// const walletConnectProvider = new WalletConnectProvider({
//   projectId: 'de09b512de24701dffa1302cc42e4448', // Replace with your WalletConnect project ID
// });

// // // Initialize Web3Modal
// const web3Modal = new Web3Modal({
//   providerOptions: {
//     walletconnect: {
//       package: walletConnectProvider,
//     },
//   },
// });
// // Connect to the wallet
// const connectButton = document.getElementById('connectButton');
// connectButton.addEventListener('click', async () => {
//   try {
//     // Connect to the wallet
//     const provider = await web3Modal.connect();

//     // Get the user's Ethereum address
//     const accounts = await provider.request({ method: 'eth_requestAccounts' });
//     const userAddress = accounts[0];

//     // You can now use the provider to interact with the blockchain
//     console.log('Connected to wallet:', userAddress);
//   } catch (error) {
//     console.error('Error connecting to wallet:', error);
//   }
// });