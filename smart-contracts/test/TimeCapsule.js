const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TimeCapsule", function () {
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

  // Helper: valid bytes for encryptedKey
  function validKey() {
    return ethers.toUtf8Bytes("test-encrypted-key-data");
  }

  // Helper: expect a transaction to revert
  async function expectRevert(txPromise) {
    try {
      await txPromise;
      expect.fail("Expected transaction to revert, but it succeeded");
    } catch (error) {
      // Transaction reverted as expected
      expect(error.message).to.include("revert");
    }
  }

  describe("Deployment", function () {
    it("Should set the right treasury", async function () {
      const { timeCapsule, treasury } = await loadFixture(deployTimeCapsuleFixture);
      expect(await timeCapsule.daoTreasury()).to.equal(treasury.address);
    });
  });

  describe("Capsule Creation", function () {
    it("Should create a capsule with valid parameters and stake", async function () {
      const { timeCapsule, unlockTime, lockedAmount, owner } =
        await loadFixture(deployTimeCapsuleFixture);

      const tx = await timeCapsule.createCapsule(
        owner.address, unlockTime, "QmTest123", validKey(), "A hint", 8, false,
        { value: lockedAmount }
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => timeCapsule.interface.parseLog(log)?.name === "CapsuleCreated"
      );
      expect(event).to.not.be.undefined;

      const capsule = await timeCapsule.getCapsule(0);
      expect(capsule.stakeAmount).to.equal(BigInt(lockedAmount));
      expect(capsule.isUnlocked).to.equal(false);
      expect(capsule.hint).to.equal("A hint");
      expect(capsule.isPublic).to.equal(false);
    });

    it("Should fail if unlock time is in the past", async function () {
      const { timeCapsule, owner } = await loadFixture(deployTimeCapsuleFixture);
      const pastTime = (await time.latest()) - 100;

      await expectRevert(
        timeCapsule.createCapsule(owner.address, pastTime, "cid", validKey(), "", 8, false)
      );
    });

    it("Should create a public capsule", async function () {
      const { timeCapsule, unlockTime, owner } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.createCapsule(
        owner.address, unlockTime, "QmPublic", validKey(), "Guess what?", 0, true,
        { value: ethers.parseEther("0.01") }
      );

      const capsule = await timeCapsule.getCapsule(0);
      expect(capsule.isPublic).to.equal(true);
      expect(capsule.hint).to.equal("Guess what?");
    });

    it("Should default recipient to sender if address(0)", async function () {
      const { timeCapsule, unlockTime, owner } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.createCapsule(
        ethers.ZeroAddress, unlockTime, "QmSelf", validKey(), "", 8, false,
        { value: ethers.parseEther("0.01") }
      );

      const capsule = await timeCapsule.getCapsule(0);
      expect(capsule.recipient).to.equal(owner.address);
    });
  });

  describe("Unlocking & Staking", function () {
    it("Should fail to unlock before time", async function () {
      const { timeCapsule, unlockTime, lockedAmount, owner } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.createCapsule(
        owner.address, unlockTime, "cid", validKey(), "", 8, false,
        { value: lockedAmount }
      );

      await expectRevert(timeCapsule.unlockCapsule(0));
    });

    it("Should unlock after time and return stake", async function () {
      const { timeCapsule, unlockTime, lockedAmount, owner } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.createCapsule(
        owner.address, unlockTime, "cid", validKey(), "", 8, false,
        { value: lockedAmount }
      );

      await time.increaseTo(unlockTime);

      const tx = await timeCapsule.unlockCapsule(0);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => timeCapsule.interface.parseLog(log)?.name === "CapsuleUnlocked"
      );
      expect(event).to.not.be.undefined;

      const capsule = await timeCapsule.getCapsule(0);
      expect(capsule.isUnlocked).to.equal(true);
      expect(capsule.stakeReleased).to.equal(true);
    });

    it("Should not allow double unlock", async function () {
      const { timeCapsule, unlockTime, lockedAmount, owner } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.createCapsule(
        owner.address, unlockTime, "cid", validKey(), "", 8, false,
        { value: lockedAmount }
      );

      await time.increaseTo(unlockTime);
      await timeCapsule.unlockCapsule(0);

      await expectRevert(timeCapsule.unlockCapsule(0));
    });

    it("Should only allow creator or recipient to unlock", async function () {
      const { timeCapsule, unlockTime, lockedAmount, owner, otherAccount } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.createCapsule(
        owner.address, unlockTime, "cid", validKey(), "", 8, false,
        { value: lockedAmount }
      );
      await time.increaseTo(unlockTime);

      await expectRevert(
        timeCapsule.connect(otherAccount).unlockCapsule(0)
      );
    });
  });

  describe("Predictions", function () {
    it("Should allow predictions on public capsules", async function () {
      const { timeCapsule, unlockTime, owner, otherAccount } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.createCapsule(
        owner.address, unlockTime, "cid", validKey(), "Guess!", 3, true,
        { value: ethers.parseEther("0.01") }
      );

      const predStake = ethers.parseEther("0.005");
      const tx = await timeCapsule.connect(otherAccount).makePrediction(0, 3, { value: predStake });
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => timeCapsule.interface.parseLog(log)?.name === "PredictionMade"
      );
      expect(event).to.not.be.undefined;

      expect(await timeCapsule.getPredictionCount(0)).to.equal(1n);
    });

    it("Should reject predictions on private capsules", async function () {
      const { timeCapsule, unlockTime, owner, otherAccount } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.createCapsule(
        owner.address, unlockTime, "cid", validKey(), "", 3, false,
        { value: ethers.parseEther("0.01") }
      );

      await expectRevert(
        timeCapsule.connect(otherAccount).makePrediction(0, 3, { value: ethers.parseEther("0.005") })
      );
    });

    it("Should reject duplicate predictions", async function () {
      const { timeCapsule, unlockTime, owner, otherAccount } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.createCapsule(
        owner.address, unlockTime, "cid", validKey(), "", 3, true,
        { value: ethers.parseEther("0.01") }
      );

      const predStake = ethers.parseEther("0.005");
      await timeCapsule.connect(otherAccount).makePrediction(0, 3, { value: predStake });

      await expectRevert(
        timeCapsule.connect(otherAccount).makePrediction(0, 3, { value: predStake })
      );
    });

    it("Should reject predictions below minimum stake", async function () {
      const { timeCapsule, unlockTime, owner, otherAccount } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.createCapsule(
        owner.address, unlockTime, "cid", validKey(), "", 3, true,
        { value: ethers.parseEther("0.01") }
      );

      await expectRevert(
        timeCapsule.connect(otherAccount).makePrediction(0, 3, { value: 100 })
      );
    });
  });

  describe("Social Features", function () {
    it("Should allow liking a capsule", async function () {
      const { timeCapsule, unlockTime, owner, otherAccount } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.createCapsule(
        owner.address, unlockTime, "cid", validKey(), "", 8, false,
        { value: ethers.parseEther("0.01") }
      );

      await timeCapsule.connect(otherAccount).likeCapsule(0);
      expect(await timeCapsule.getCapsuleLikes(0)).to.equal(1n);
    });

    it("Should reject double-liking", async function () {
      const { timeCapsule, unlockTime, owner, otherAccount } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.createCapsule(
        owner.address, unlockTime, "cid", validKey(), "", 8, false,
        { value: ethers.parseEther("0.01") }
      );

      await timeCapsule.connect(otherAccount).likeCapsule(0);
      await expectRevert(
        timeCapsule.connect(otherAccount).likeCapsule(0)
      );
    });

    it("Should allow starring a user", async function () {
      const { timeCapsule, owner, otherAccount } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.connect(otherAccount).starUser(owner.address);
      expect(await timeCapsule.getUserStars(owner.address)).to.equal(1n);
    });

    it("Should reject self-starring", async function () {
      const { timeCapsule, owner } = await loadFixture(deployTimeCapsuleFixture);

      await expectRevert(
        timeCapsule.starUser(owner.address)
      );
    });
  });

  describe("Delete Capsule", function () {
    it("Should allow creator to delete before unlock", async function () {
      const { timeCapsule, unlockTime, owner } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.createCapsule(
        owner.address, unlockTime, "cid", validKey(), "", 8, false,
        { value: ethers.parseEther("0.01") }
      );

      const tx = await timeCapsule.deleteCapsule(0);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => timeCapsule.interface.parseLog(log)?.name === "CapsuleDeleted"
      );
      expect(event).to.not.be.undefined;
    });

    it("Should reject non-creator delete", async function () {
      const { timeCapsule, unlockTime, owner, otherAccount } =
        await loadFixture(deployTimeCapsuleFixture);

      await timeCapsule.createCapsule(
        owner.address, unlockTime, "cid", validKey(), "", 8, false,
        { value: ethers.parseEther("0.01") }
      );

      await expectRevert(
        timeCapsule.connect(otherAccount).deleteCapsule(0)
      );
    });
  });
});
