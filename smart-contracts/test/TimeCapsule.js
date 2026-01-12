const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TimeCapsule", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTimeCapsuleFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    const [owner, otherAccount, treasury] = await ethers.getSigners();

    const TimeCapsule = await ethers.getContractFactory("TimeCapsule");
    const timeCapsule = await TimeCapsule.deploy(treasury.address);

    return {
      timeCapsule,
      unlockTime,
      lockedAmount,
      owner,
      otherAccount,
      treasury,
    };
  }

  describe("Deployment", function () {
    it("Should set the right treasury", async function () {
      const { timeCapsule, treasury } = await loadFixture(
        deployTimeCapsuleFixture
      );
      expect(await timeCapsule.daoTreasury()).to.equal(treasury.address);
    });
  });

  describe("Capsule Creation", function () {
    it("Should create a capsule with valid parameters and stake", async function () {
      const { timeCapsule, unlockTime, lockedAmount, owner } =
        await loadFixture(deployTimeCapsuleFixture);

      const cid = "QmTest123";
      const key = ethers.toUtf8Bytes("encryptedKey");

      await expect(
        timeCapsule.createCapsule(owner.address, unlockTime, cid, key, {
          value: lockedAmount,
        })
      )
        .to.emit(timeCapsule, "CapsuleCreated")
        .withArgs(0, owner.address, owner.address, unlockTime, lockedAmount);

      const capsule = await timeCapsule.capsules(0);
      expect(capsule.stakeAmount).to.equal(lockedAmount);
      expect(capsule.isUnlocked).to.equal(false);
    });

    it("Should fail if unlock time is in the past", async function () {
      const { timeCapsule, owner } = await loadFixture(
        deployTimeCapsuleFixture
      );
      const pastTime = (await time.latest()) - 100;

      await expect(
        timeCapsule.createCapsule(owner.address, pastTime, "cid", "key")
      ).to.be.revertedWith("Time must be in future");
    });
  });

  describe("Unlocking & Staking", function () {
    it("Should fail to unlock before time", async function () {
      const { timeCapsule, unlockTime, lockedAmount, owner } =
        await loadFixture(deployTimeCapsuleFixture);
      await timeCapsule.createCapsule(owner.address, unlockTime, "cid", "key", {
        value: lockedAmount,
      });

      await expect(timeCapsule.unlockCapsule(0)).to.be.revertedWith(
        "Not yet unlocked"
      );
    });

    it("Should unlock after time and return stake", async function () {
      const { timeCapsule, unlockTime, lockedAmount, owner } =
        await loadFixture(deployTimeCapsuleFixture);
      await timeCapsule.createCapsule(owner.address, unlockTime, "cid", "key", {
        value: lockedAmount,
      });

      await time.increaseTo(unlockTime);

      await expect(timeCapsule.unlockCapsule(0))
        .to.emit(timeCapsule, "CapsuleUnlocked")
        .to.emit(timeCapsule, "StakeReleased")
        .withArgs(0, owner.address, lockedAmount);

      // Verify balance change (rough check due to gas)
      // Ideally checking changeEtherBalance logic
      await expect(timeCapsule.unlockCapsule(0)).to.be.revertedWith(
        "Already unlocked"
      );
    });

    it("Should only allow creator or recipient to unlock", async function () {
      const { timeCapsule, unlockTime, lockedAmount, owner, otherAccount } =
        await loadFixture(deployTimeCapsuleFixture);
      // Created by owner, for owner
      await timeCapsule.createCapsule(owner.address, unlockTime, "cid", "key", {
        value: lockedAmount,
      });
      await time.increaseTo(unlockTime);

      // Other account tries to unlock
      await expect(
        timeCapsule.connect(otherAccount).unlockCapsule(0)
      ).to.be.revertedWith("Unauthorized");
    });
  });

  describe("Penalties / Slashing", function () {
    it("Should slash abandoned capsule after grace period", async function () {
      const { timeCapsule, unlockTime, lockedAmount, owner, treasury } =
        await loadFixture(deployTimeCapsuleFixture);
      await timeCapsule.createCapsule(owner.address, unlockTime, "cid", "key", {
        value: lockedAmount,
      });

      // Wait for Unlock Time + Grace Period + 1 sec
      const GRACE_PERIOD = 365 * 24 * 60 * 60;
      await time.increaseTo(unlockTime + GRACE_PERIOD + 10);

      await expect(timeCapsule.slashAbandonedCapsule(0))
        .to.emit(timeCapsule, "StakeSlashed")
        .withArgs(0, treasury.address, lockedAmount);

      // Treasury should have received funds
      const capsule = await timeCapsule.capsules(0);
      expect(capsule.stakeReleased).to.equal(true);
    });

    it("Should NOT slash before grace period", async function () {
      const { timeCapsule, unlockTime, lockedAmount, owner, treasury } =
        await loadFixture(deployTimeCapsuleFixture);
      await timeCapsule.createCapsule(owner.address, unlockTime, "cid", "key", {
        value: lockedAmount,
      });

      await time.increaseTo(unlockTime + 10); // Just unlocked, not abandoned

      await expect(timeCapsule.slashAbandonedCapsule(0)).to.be.revertedWith(
        "Grace period not over"
      );
    });
  });
});
