import { ethers } from 'ethers';
import fs from 'fs';

// Sepolia RPC endpoint
let Provider = new ethers.providers.WebSocketProvider('wss://ethereum-sepolia-rpc.publicnode.com'); //wss://sepolia.gateway.tenderly.co

// Read the keys from a file
const keysRaw = fs.readFileSync('keys.json');
const keys = JSON.parse(keysRaw);
const privateKey = keys["private-key"];
const publicKey = keys["public-key"];

// Read the heir keys from a separate file
const heirKeysRaw = fs.readFileSync('keys_heir.json');
const heirKeys = JSON.parse(heirKeysRaw);
const heirPrivateKey = heirKeys["private-key"];

// Create a wallet instance with the private key and provider
const wallet = new ethers.Wallet(privateKey, Provider);
const heirWallet = new ethers.Wallet(heirPrivateKey, Provider);

// Contract details
const contractAddress = "0xbE0b4Db841711eD4a2A4E5B7D0979954fA2B1007";
const abi = [
    "function withdraw(uint _amount) external",
    "function claimOwnership() external",
    "function setNewHeir(address _newHeir) external",
];

const contract = new ethers.Contract(contractAddress, abi, wallet);
const heirContract = new ethers.Contract(contractAddress, abi, heirWallet);

// Function to define new heir
async function setNewHeir(newHeirAddress) {
    try {
        const tx = await heirContract.setNewHeir(newHeirAddress);
        console.log("Setting new heir...");
        await tx.wait();
        console.log(`New heir set: ${newHeirAddress}. Transaction hash: ${tx.hash}`);
    } catch (error) {
        console.error("Error setting new heir:", error);
    }
}

// Function to claim ownership from the heir
async function claimOwnership() {
    try {
        const tx = await heirContract.claimOwnership();
        console.log("Claiming ownership...");
        await tx.wait();
        console.log(`Ownership claimed by heir. Transaction hash: ${tx.hash}`);
    } catch (error) {
        console.error("Error claiming ownership:", error);
    }
}

// Function to withdraw ETH in a user-friendly format (ETH instead of Wei)
async function withdraw(amountInEth) {
    try {
        // Convert ETH to Wei
        const amountInWei = ethers.utils.parseEther(amountInEth.toString());

        const tx = await contract.withdraw(amountInWei);
        console.log(`Withdrawing ${amountInEth} ETH (${amountInWei} Wei)...`);
        await tx.wait();
        console.log(`Withdrawal successful. Transaction hash: ${tx.hash}`);
    } catch (error) {
        console.error("Error withdrawing funds:", error);
    }
}

// List of all function, just uncomment the one you need.
async function main() {
    // Define the address of the new heir
    const newHeirAddress = "0xF039b5E4CC28Ac1E503b8cF69a640DC6bB9e24d7";
    
    // Define the new heir
    // await setNewHeir(newHeirAddress);

    // Claim ownership (only if you are Heir and locking time is over)
    // await claimOwnership(); 

    // Function to withdraw eth in wei (Can be done with 0 to reinitialize the timer)
    await withdraw(0.00008); // Withdraw 0.01 ETH
}

main().catch(console.error);

/*
Try to claim before the end of the ownership :
response: '{"jsonrpc":"2.0","error":{"code":3,"message":"execution reverted: Owner is still active","data":"0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000154f776e6572206973207374696c6c206163746976650000000000000000000000"},"id":5}\n'
    }


*/