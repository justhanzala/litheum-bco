import './style.css'

import { ethers } from 'ethers';

import CONTRACT_ADDRESS from './constants';
import LitheumPresaleBCOERC20 from  './contracts/LitheumPresaleBCOERC20.sol/LitheumPresaleBCOERC20.json';
import MockUSDTToken from './contracts/MockUSDTToken.sol/MockUSDTToken.json';
import { Contract } from 'ethers';

const numberWithCommas = (x: String) => {
    return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const getCurrentPrice = async () => {
    if (blthContract) {
        const price = await blthContract.getCurrentPrice();
        document.getElementById('current-price').innerText = ethers.formatUnits(price, 'ether');
        const blthLeft = await blthContract.getBLTHBalance();
        document.getElementById('left-amount').innerText = Math.floor(Number(ethers.formatUnits(blthLeft, 'ether'))/1000000).toFixed(0)
        const leftPercent = (Number(ethers.formatUnits(blthLeft, 'ether'))/500000000) * 100;
        const soldPercent = 100 - leftPercent;

        document.getElementById('sold-progress').style.width = `${soldPercent.toFixed(0)}%`;
        document.getElementById('left-progress').style.width = `${leftPercent.toFixed(0)}%`;

    }
}

let provider: ethers.BrowserProvider;
let usdtContract: Contract;
let blthContract: Contract;
if (window.ethereum) {
    // provider = new ethers.JsonRpcProvider('https://rpc-sepolia.rockx.com');
    provider = new ethers.BrowserProvider(window.ethereum);
    usdtContract = new ethers.Contract(CONTRACT_ADDRESS.USDT, MockUSDTToken.abi, provider);
    blthContract = new ethers.Contract(CONTRACT_ADDRESS.BLTH, LitheumPresaleBCOERC20.abi, provider);
    getCurrentPrice();
}

let slipperDD = document.getElementById('slippage-dd');
let slipper = document.getElementById('show-slippage');
let overlay = document.getElementById('overlay');

const hideSlippage = () => {
    slipperDD.style.display = 'none';
    overlay?.classList.remove("popup-bg");
}
const showSlippage = () => {
    slipperDD.style.display = 'block';
    overlay?.classList.add("popup-bg");
}

if (slipperDD) {
    slipperDD.style.display = 'none';
    slipper?.addEventListener('click', () => {
        if (slipperDD && slipperDD.style.display === 'none') {
            showSlippage();
        } else if (slipperDD && slipperDD.style.display === 'block') {
            hideSlippage();
        }

    });
}

overlay?.addEventListener('click', hideSlippage)

let accounts: String[] = [];
const swapBtn = document.getElementById('swap');
swapBtn?swapBtn.style.display = 'none':'';
if (accounts.length) {
    swapBtn?swapBtn.style.display = 'none':'';
}

const openConnectModalBtn = document.getElementById('open-connect-modal')

openConnectModalBtn && openConnectModalBtn.addEventListener('click', async () => {
    accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    await updateUserBalance();
    await getCurrentPrice();

    openConnectModalBtn?openConnectModalBtn.style.display = 'none':'';
    swapBtn?swapBtn.style.display = 'block':'';
});

const updateUserBalance = async () => {
    let userBalance = await getUserBalance();

    document.getElementById('usdt-balance').innerHTML = numberWithCommas(ethers.formatUnits(userBalance.usdtBalance, 'ether'));
    document.getElementById('blth-balance').innerHTML = numberWithCommas(ethers.formatUnits(userBalance.blthBalance, 'ether'));
}

const getUserBalance = async () => {
    if (usdtContract && blthContract && accounts.length) {
        let usdtBalance = await usdtContract.balanceOf(accounts[0]);
        let blthBalance = await blthContract.balanceOf(accounts[0]);

        return { usdtBalance, blthBalance };
    }

    return { usdtBalance: 0, blthBalance: 0 };
}

const blthInput = document.getElementById('blth-input');
blthInput.disabled = true;
const usdtInput = document.getElementById('usdt-input');

let blthAmountInWei = 0;
let slippage = 2;

const updateAvailableBlth = async () => {
    if (blthContract) {
        blthAmountInWei = await blthContract.getEstimatedSwapAmount(ethers.parseEther(usdtInput.value.toString()));
        blthInput.value = ethers.formatEther(blthAmountInWei);
    }
}

usdtInput?.addEventListener('input', updateAvailableBlth);
const updateAvailableUsdt = async () => {
    if (blthContract) {
        blthAmountInWei = await blthContract.getEstimatedSwapAmount(ethers.parseEther(usdtInput.value.toString()));
        blthInput.value = ethers.formatEther(blthAmountInWei);
    }
}

blthInput?.addEventListener('input', updateAvailableUsdt);

const initiateSwap = async () => {
    if (blthContract && usdtContract && accounts.length) {
        let signer = await provider.getSigner();

        const usdtContractSigned = usdtContract.connect(signer);
        const approveTx = await usdtContractSigned.approve(CONTRACT_ADDRESS.BLTH, ethers.parseEther(usdtInput.value.toString()));
        const approveReceipt = await approveTx.wait();

        console.log('approveReceipt', approveReceipt);
        const blthContractSigned = blthContract.connect(signer);
        const swapTx = await blthContractSigned.swap(ethers.parseEther(usdtInput.value.toString()), blthAmountInWei, slippage);
        const swapReceipt = await swapTx.wait();

        console.log('swapReceipt', swapReceipt);

        usdtInput.value = 0;
        blthInput.value = 0

        await updateUserBalance();
        await getCurrentPrice();
    }
}

swapBtn?.addEventListener('click', initiateSwap);

const flipBox = document.getElementById('flip-box');

flipBox?.addEventListener('click', () => {
    const elementList = document.getElementById('swap-box');
    if (elementList) {
        let first = elementList?.firstElementChild;
        let last = elementList?.lastElementChild;


        first.children[0].children[0].innerHTML = "TOTAL AVAILABLE FOR YOU:";
        last.children[0].children[0].innerHTML = "YOU SEND*:";

        let slippageElement = first.children[0].children[2];

        slippageElement.remove();

        last.children[0].appendChild(slippageElement);

        elementList.removeChild(first);
        elementList.removeChild(last);

        elementList.insertBefore(last, elementList.firstChild);
        elementList.appendChild(first);

        blthInput.disabled = !blthInput.disabled;
        usdtInput.disabled = !usdtInput.disabled;
    }
});

const slippageOptions = document.getElementsByClassName('percentage');

const slippageShow = document.getElementById('slippage-value');

slippageOptions && Array.from(slippageOptions).forEach((element) => {
    element.addEventListener('click', () => {
        slippage = element.getAttribute('data-value');

        slippageShow.innerHTML = slippage.toString();

        hideSlippage();
    });
});

const closeSlippageBtn = document.getElementById('close-slippage-dd');

closeSlippageBtn?.addEventListener('click', hideSlippage);
