
import { ethers, ExternalProvider } from 'ethers';

declare global {
  interface Window {
    ethereum: ethers.Eip1193Provider;
  }
}

// declare module '@walletconnect/web3-provider/dist/umd/index.min.js' {
//   import WalletConnectProvider from '@walletconnect/web3-provider/dist/esm/index';
//   export default WalletConnectProvider
// }