use anchor_lang::prelude::*;

declare_id!("GccELE2LzH3tot4qx6ooEjxryaAdZNJq4oP6quMhySKT");

#[program]
pub mod time_capsule_program {
    use super::*;

    /// Create a new time capsule with SOL stake
    pub fn create_capsule(
        ctx: Context<CreateCapsule>,
        ipfs_cid: String,
        encrypted_key: Vec<u8>,
        hint: String,
        category: u8,
        unlock_time: i64,
        is_public: bool,
    ) -> Result<()> {
        let capsule = &mut ctx.accounts.capsule;
        let clock = Clock::get()?;
        
        require!(unlock_time > clock.unix_timestamp, TimeCapsuleError::InvalidUnlockTime);
        require!(ipfs_cid.len() > 0, TimeCapsuleError::EmptyCid);
        require!(category <= 8, TimeCapsuleError::InvalidCategory);

        capsule.id = ctx.accounts.capsule_counter.count;
        capsule.creator = ctx.accounts.creator.key();
        capsule.recipient = ctx.accounts.recipient.key();
        capsule.ipfs_cid = ipfs_cid;
        capsule.encrypted_key = encrypted_key;
        capsule.hint = hint;
        capsule.category = category;
        capsule.unlock_time = unlock_time;
        capsule.stake_amount = ctx.accounts.creator.lamports();
        capsule.is_public = is_public;
        capsule.is_unlocked = false;
        capsule.prediction_pool = 0;
        capsule.prediction_count = 0;
        capsule.bump = ctx.bumps.capsule;

        // Increment counter
        ctx.accounts.capsule_counter.count += 1;

        emit!(CapsuleCreated {
            id: capsule.id,
            creator: capsule.creator,
            unlock_time: capsule.unlock_time,
            is_public: capsule.is_public,
        });

        Ok(())
    }

    /// Make a prediction on a public capsule
    pub fn make_prediction(
        ctx: Context<MakePrediction>,
        guess: u8,
    ) -> Result<()> {
        let capsule = &mut ctx.accounts.capsule;
        let prediction = &mut ctx.accounts.prediction;
        let clock = Clock::get()?;

        require!(capsule.is_public, TimeCapsuleError::NotPublic);
        require!(!capsule.is_unlocked, TimeCapsuleError::AlreadyUnlocked);
        require!(clock.unix_timestamp < capsule.unlock_time, TimeCapsuleError::PredictionEnded);
        require!(guess <= 8, TimeCapsuleError::InvalidCategory);

        // Transfer stake
        let stake_amount = ctx.accounts.predictor.lamports();
        require!(stake_amount >= 1_000_000, TimeCapsuleError::StakeTooLow); // 0.001 SOL min

        prediction.predictor = ctx.accounts.predictor.key();
        prediction.capsule_id = capsule.id;
        prediction.guess = guess;
        prediction.stake_amount = stake_amount;
        prediction.claimed = false;
        prediction.bump = ctx.bumps.prediction;

        capsule.prediction_pool += stake_amount;
        capsule.prediction_count += 1;

        emit!(PredictionMade {
            capsule_id: capsule.id,
            predictor: prediction.predictor,
            guess,
            stake_amount,
        });

        Ok(())
    }

    /// Unlock a capsule after unlock time
    pub fn unlock_capsule(ctx: Context<UnlockCapsule>) -> Result<()> {
        let capsule = &mut ctx.accounts.capsule;
        let clock = Clock::get()?;

        require!(!capsule.is_unlocked, TimeCapsuleError::AlreadyUnlocked);
        require!(clock.unix_timestamp >= capsule.unlock_time, TimeCapsuleError::NotYetUnlocked);
        require!(
            ctx.accounts.authority.key() == capsule.creator || 
            ctx.accounts.authority.key() == capsule.recipient,
            TimeCapsuleError::Unauthorized
        );

        capsule.is_unlocked = true;

        emit!(CapsuleUnlocked {
            id: capsule.id,
            unlocker: ctx.accounts.authority.key(),
            category: capsule.category,
        });

        Ok(())
    }

    /// Claim prediction reward if guess was correct
    pub fn claim_reward(ctx: Context<ClaimReward>) -> Result<()> {
        let capsule = &ctx.accounts.capsule;
        let prediction = &mut ctx.accounts.prediction;

        require!(capsule.is_unlocked, TimeCapsuleError::NotYetUnlocked);
        require!(!prediction.claimed, TimeCapsuleError::AlreadyClaimed);
        require!(prediction.guess == capsule.category, TimeCapsuleError::WrongPrediction);

        prediction.claimed = true;

        // Calculate reward (simplified - full implementation would track all predictions)
        let reward = prediction.stake_amount * 2; // Simplified: double stake on win

        emit!(RewardClaimed {
            capsule_id: capsule.id,
            predictor: prediction.predictor,
            reward,
        });

        Ok(())
    }

    /// Initialize the capsule counter
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.capsule_counter.count = 0;
        Ok(())
    }
}

// Account Structures

#[account]
#[derive(InitSpace)]
pub struct CapsuleCounter {
    pub count: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Capsule {
    pub id: u64,
    pub creator: Pubkey,
    pub recipient: Pubkey,
    #[max_len(100)]
    pub ipfs_cid: String,
    #[max_len(200)]
    pub encrypted_key: Vec<u8>,
    #[max_len(200)]
    pub hint: String,
    pub category: u8,
    pub unlock_time: i64,
    pub stake_amount: u64,
    pub is_public: bool,
    pub is_unlocked: bool,
    pub prediction_pool: u64,
    pub prediction_count: u32,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Prediction {
    pub predictor: Pubkey,
    pub capsule_id: u64,
    pub guess: u8,
    pub stake_amount: u64,
    pub claimed: bool,
    pub bump: u8,
}

// Context Structures

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + CapsuleCounter::INIT_SPACE,
        seeds = [b"counter"],
        bump
    )]
    pub capsule_counter: Account<'info, CapsuleCounter>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateCapsule<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + Capsule::INIT_SPACE,
        seeds = [b"capsule", capsule_counter.count.to_le_bytes().as_ref()],
        bump
    )]
    pub capsule: Account<'info, Capsule>,
    #[account(mut, seeds = [b"counter"], bump)]
    pub capsule_counter: Account<'info, CapsuleCounter>,
    /// CHECK: Recipient can be any address
    pub recipient: AccountInfo<'info>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MakePrediction<'info> {
    #[account(
        init,
        payer = predictor,
        space = 8 + Prediction::INIT_SPACE,
        seeds = [b"prediction", capsule.key().as_ref(), predictor.key().as_ref()],
        bump
    )]
    pub prediction: Account<'info, Prediction>,
    #[account(mut)]
    pub capsule: Account<'info, Capsule>,
    #[account(mut)]
    pub predictor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnlockCapsule<'info> {
    #[account(mut)]
    pub capsule: Account<'info, Capsule>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    pub capsule: Account<'info, Capsule>,
    #[account(mut)]
    pub prediction: Account<'info, Prediction>,
    pub predictor: Signer<'info>,
}

// Events

#[event]
pub struct CapsuleCreated {
    pub id: u64,
    pub creator: Pubkey,
    pub unlock_time: i64,
    pub is_public: bool,
}

#[event]
pub struct CapsuleUnlocked {
    pub id: u64,
    pub unlocker: Pubkey,
    pub category: u8,
}

#[event]
pub struct PredictionMade {
    pub capsule_id: u64,
    pub predictor: Pubkey,
    pub guess: u8,
    pub stake_amount: u64,
}

#[event]
pub struct RewardClaimed {
    pub capsule_id: u64,
    pub predictor: Pubkey,
    pub reward: u64,
}

// Errors

#[error_code]
pub enum TimeCapsuleError {
    #[msg("Unlock time must be in the future")]
    InvalidUnlockTime,
    #[msg("IPFS CID cannot be empty")]
    EmptyCid,
    #[msg("Invalid category")]
    InvalidCategory,
    #[msg("Capsule is not public")]
    NotPublic,
    #[msg("Capsule already unlocked")]
    AlreadyUnlocked,
    #[msg("Prediction period has ended")]
    PredictionEnded,
    #[msg("Stake amount too low (min 0.001 SOL)")]
    StakeTooLow,
    #[msg("Cannot unlock yet")]
    NotYetUnlocked,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Reward already claimed")]
    AlreadyClaimed,
    #[msg("Wrong prediction")]
    WrongPrediction,
}
