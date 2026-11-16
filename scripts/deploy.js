import { network } from "hardhat";

const { ethers } = await network.connect();

const [vlasnik] = await ethers.getSigners();
const token = await ethers.deployContract("LabCoin");
await token.waitForDeployment();
await (await token.dodajAdministratora(vlasnik.address)).wait();

console.log("Token objavljen na adresi:", await token.getAddress());
console.log("Administrator:", vlasnik.address);
