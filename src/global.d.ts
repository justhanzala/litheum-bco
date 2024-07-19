
import { ethers, ExternalProvider } from 'ethers';

declare global {
  interface Window {
    ethereum: ethers.Eip1193Provider;
  }
}