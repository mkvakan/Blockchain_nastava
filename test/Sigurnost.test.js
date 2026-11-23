import { expect } from "chai";
import { network } from "hardhat";
const { ethers } = await network.connect();
describe("Sigurnost", function () {
let token, vlasnik, napadac;
beforeEach(async function () {
[vlasnik, napadac] = await ethers.getSigners();
token = await ethers.deployContract("LabCoin");
});
it("S1: napadac se ne moze sam postaviti za administratora", async function
() {
await
expect(token.connect(napadac).postaviAdministratora(napadac.address, true))
.to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
.withArgs(napadac.address);
expect(await token.jeAdministrator(napadac.address)).to.equal(false);
});
it("S2: napadac ne moze sebi dodijeliti bodove", async function () {
await expect(token.connect(napadac).dodijeliBodove(napadac.address, 50,
"x"))
.to.be.revertedWith("Nisi administrator");
});
});
