const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Address for DAO Treasury (using deployer for test/demo purposes, or a specific address)
  const daoTreasury = deployer.address;

  const TimeCapsule = await hre.ethers.getContractFactory("TimeCapsule");
  const timeCapsule = await TimeCapsule.deploy(daoTreasury);

  await timeCapsule.waitForDeployment();

  console.log(`TimeCapsule deployed to: ${await timeCapsule.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
