// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Web3 Time Capsule with Social Prediction Staking
 */
contract TimeCapsule is ReentrancyGuard {
    
    enum Category { StartupLaunch, Marriage, Breakup, CryptoProfit, JobAnnouncement, Travel, Graduation, Secret, Other }

    struct Capsule {
        uint256 id;
        address creator;
        address recipient;
        string ipfsCID;
        bytes encryptedKey;
        uint256 unlockTime;
        uint256 stakeAmount;
        bool isUnlocked;
        bool stakeReleased;
        string hint;
        Category actualCategory;
        bool isPublic;
        uint256 predictionPool;
    }

    struct Prediction {
        address predictor;
        Category guess;
        uint256 stakeAmount;
        bool claimed;
    }

    mapping(uint256 => Capsule) public capsules;
    mapping(uint256 => Prediction[]) internal _predictions;
    mapping(uint256 => mapping(address => bool)) public hasPredicted;
    uint256 public nextCapsuleId;
    
    address public immutable daoTreasury;
    uint256 public constant GRACE_PERIOD = 365 days;
    uint256 public constant MIN_PREDICTION_STAKE = 0.001 ether;

    event CapsuleCreated(uint256 indexed id, address indexed creator, uint256 unlockTime, bool isPublic);
    event CapsuleUnlocked(uint256 indexed id, address indexed unlocker, Category actualCategory);
    event PredictionMade(uint256 indexed capsuleId, address indexed predictor, Category guess, uint256 stakeAmount);
    event RewardClaimed(uint256 indexed capsuleId, address indexed predictor, uint256 reward);

    constructor(address _daoTreasury) {
        require(_daoTreasury != address(0), "Invalid Treasury");
        daoTreasury = _daoTreasury;
    }

    function createCapsule(
        address _recipient,
        uint256 _unlockTime,
        string calldata _ipfsCid,
        bytes calldata _encryptedKey,
        string calldata _hint,
        Category _category,
        bool _isPublic
    ) external payable nonReentrant {
        require(_unlockTime > block.timestamp, "Time must be in future");
        require(bytes(_ipfsCid).length > 0, "CID required");

        uint256 id = nextCapsuleId++;
        address recipient = _recipient == address(0) ? msg.sender : _recipient;

        capsules[id] = Capsule({
            id: id,
            creator: msg.sender,
            recipient: recipient,
            ipfsCID: _ipfsCid,
            encryptedKey: _encryptedKey,
            unlockTime: _unlockTime,
            stakeAmount: msg.value,
            isUnlocked: false,
            stakeReleased: false,
            hint: _hint,
            actualCategory: _category,
            isPublic: _isPublic,
            predictionPool: 0
        });

        emit CapsuleCreated(id, msg.sender, _unlockTime, _isPublic);
    }

    function makePrediction(uint256 _id, Category _guess) external payable nonReentrant {
        Capsule storage c = capsules[_id];
        require(c.creator != address(0), "Not found");
        require(c.isPublic && !c.isUnlocked, "Cannot predict");
        require(block.timestamp < c.unlockTime, "Too late");
        require(!hasPredicted[_id][msg.sender], "Already predicted");
        require(msg.value >= MIN_PREDICTION_STAKE, "Stake too low");

        _predictions[_id].push(Prediction(msg.sender, _guess, msg.value, false));
        hasPredicted[_id][msg.sender] = true;
        c.predictionPool += msg.value;

        emit PredictionMade(_id, msg.sender, _guess, msg.value);
    }

    function unlockCapsule(uint256 _id) external nonReentrant {
        Capsule storage c = capsules[_id];
        require(c.creator != address(0), "Not found");
        require(block.timestamp >= c.unlockTime, "Not yet");
        require(msg.sender == c.creator || msg.sender == c.recipient, "Unauthorized");
        require(!c.isUnlocked, "Already unlocked");

        c.isUnlocked = true;
        emit CapsuleUnlocked(_id, msg.sender, c.actualCategory);

        if (c.stakeAmount > 0 && !c.stakeReleased) {
            c.stakeReleased = true;
            payable(c.recipient).transfer(c.stakeAmount);
        }
    }

    function claimReward(uint256 _id) external nonReentrant {
        Capsule storage c = capsules[_id];
        require(c.isUnlocked, "Not unlocked");
        require(hasPredicted[_id][msg.sender], "No prediction");

        // Find user's prediction
        Prediction[] storage preds = _predictions[_id];
        uint256 userIdx;
        bool found;
        for (uint256 i = 0; i < preds.length; i++) {
            if (preds[i].predictor == msg.sender) {
                userIdx = i;
                found = true;
                break;
            }
        }
        require(found, "Prediction not found");
        require(!preds[userIdx].claimed, "Already claimed");
        require(preds[userIdx].guess == c.actualCategory, "Wrong guess");

        preds[userIdx].claimed = true;

        // Calculate proportional reward
        uint256 winnerPool;
        uint256 loserPool;
        for (uint256 i = 0; i < preds.length; i++) {
            if (preds[i].guess == c.actualCategory) {
                winnerPool += preds[i].stakeAmount;
            } else {
                loserPool += preds[i].stakeAmount;
            }
        }

        uint256 reward = preds[userIdx].stakeAmount;
        if (winnerPool > 0 && loserPool > 0) {
            reward += (preds[userIdx].stakeAmount * loserPool) / winnerPool;
        }

        payable(msg.sender).transfer(reward);
        emit RewardClaimed(_id, msg.sender, reward);
    }

    // View functions
    function getCapsule(uint256 _id) external view returns (Capsule memory) {
        return capsules[_id];
    }

    function getPredictionCount(uint256 _id) external view returns (uint256) {
        return _predictions[_id].length;
    }

    function getPrediction(uint256 _id, uint256 _idx) external view returns (Prediction memory) {
        return _predictions[_id][_idx];
    }

    event CapsuleDeleted(uint256 indexed id, address indexed creator);

    function deleteCapsule(uint256 _id) external nonReentrant {
        Capsule storage c = capsules[_id];
        require(c.creator != address(0), "Not found");
        require(msg.sender == c.creator, "Only creator");
        require(!c.isUnlocked, "Already unlocked");

        uint256 refundAmount = c.stakeAmount;
        
        // Refund all predictors
        Prediction[] storage preds = _predictions[_id];
        for (uint256 i = 0; i < preds.length; i++) {
            if (preds[i].stakeAmount > 0) {
                payable(preds[i].predictor).transfer(preds[i].stakeAmount);
            }
        }

        // Clear capsule data
        delete capsules[_id];
        delete _predictions[_id];
        
        emit CapsuleDeleted(_id, msg.sender);

        // Refund creator stake
        if (refundAmount > 0) {
            payable(msg.sender).transfer(refundAmount);
        }
    }

    // ===== SOCIAL FEATURES =====
    
    // Capsule likes
    mapping(uint256 => uint256) public capsuleLikes;
    mapping(uint256 => mapping(address => bool)) public hasLikedCapsule;
    
    // User profile stars
    mapping(address => uint256) public userStars;
    mapping(address => mapping(address => bool)) public hasStarredUser;
    
    event CapsuleLiked(uint256 indexed capsuleId, address indexed liker);
    event CapsuleUnliked(uint256 indexed capsuleId, address indexed unliker);
    event UserStarred(address indexed user, address indexed starrer);
    event UserUnstarred(address indexed user, address indexed unstarrer);

    function likeCapsule(uint256 _id) external {
        require(capsules[_id].creator != address(0), "Not found");
        require(!hasLikedCapsule[_id][msg.sender], "Already liked");
        
        hasLikedCapsule[_id][msg.sender] = true;
        capsuleLikes[_id]++;
        
        emit CapsuleLiked(_id, msg.sender);
    }

    function unlikeCapsule(uint256 _id) external {
        require(hasLikedCapsule[_id][msg.sender], "Not liked");
        
        hasLikedCapsule[_id][msg.sender] = false;
        capsuleLikes[_id]--;
        
        emit CapsuleUnliked(_id, msg.sender);
    }

    function starUser(address _user) external {
        require(_user != address(0), "Invalid address");
        require(_user != msg.sender, "Cannot star yourself");
        require(!hasStarredUser[_user][msg.sender], "Already starred");
        
        hasStarredUser[_user][msg.sender] = true;
        userStars[_user]++;
        
        emit UserStarred(_user, msg.sender);
    }

    function unstarUser(address _user) external {
        require(hasStarredUser[_user][msg.sender], "Not starred");
        
        hasStarredUser[_user][msg.sender] = false;
        userStars[_user]--;
        
        emit UserUnstarred(_user, msg.sender);
    }

    function getCapsuleLikes(uint256 _id) external view returns (uint256) {
        return capsuleLikes[_id];
    }

    function getUserStars(address _user) external view returns (uint256) {
        return userStars[_user];
    }
}
