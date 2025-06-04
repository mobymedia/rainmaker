"use client";

import { useState } from "react";
import { ethers } from "ethers";

const RAINMAKER_CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const ABI = [
  "function disperseEther(address[] recipients, uint256[] values) external payable",
  "function disperseToken(address token, address[] recipients, uint256[] values) external"
];

export default function Rainmaker() {
  const [recipients, setRecipients] = useState("");
  const [amounts, setAmounts] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [status, setStatus] = useState("");

  async function sendDisperse() {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(RAINMAKER_CONTRACT_ADDRESS, ABI, signer);

      const recipientList = recipients.split("\n").map((addr) => addr.trim());
      const amountList = amounts.split("\n").map((amt) => ethers.parseEther(amt.trim()));

      if (tokenAddress) {
        const tx = await contract.disperseToken(tokenAddress, recipientList, amountList);
        await tx.wait();
        setStatus("Token dispersed successfully.");
      } else {
        const totalValue = amountList.reduce((acc, val) => acc + val, 0n);
        const tx = await contract.disperseEther(recipientList, amountList, { value: totalValue });
        await tx.wait();
        setStatus("ETH dispersed successfully.");
      }
    } catch (err: any) {
      setStatus("Error: " + err.message);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rainmaker</h1>
      <textarea placeholder="One address per line" value={recipients} onChange={(e) => setRecipients(e.target.value)} className="mb-2 w-full h-32" />
      <textarea placeholder="One amount per line (ETH or token units)" value={amounts} onChange={(e) => setAmounts(e.target.value)} className="mb-2 w-full h-32" />
      <input placeholder="Token address (leave blank for ETH)" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} className="mb-2 w-full" />
      <button onClick={sendDisperse} className="w-full bg-blue-500 text-white py-2 rounded">Send</button>
      {status && <p className="mt-4 text-sm text-center">{status}</p>}
    </div>
  );
}
