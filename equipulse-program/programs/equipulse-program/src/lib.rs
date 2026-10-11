use anchor_lang::prelude::*;

declare_id!("Fn9bqN4XoiHAwaAnaVTi4S6Y3rF4ekpYcPpSkUyZbthe");

#[program]
pub mod equipulse_program {
    use super::*;

    pub fn initialize_campaign(
        ctx: Context<InitializeCampaign>,
        company_name: String,
        target_capital_lamports: u64,
        baseline_fee_bps: u16,
    ) -> Result<()> {
        require!(company_name.len() <= 48, ErrorCode::CompanyNameTooLong);
        require!(target_capital_lamports > 0, ErrorCode::InvalidTargetCapital);

        let campaign = &mut ctx.accounts.campaign;
        campaign.founder = ctx.accounts.founder.key();
        campaign.company_name = company_name;
        campaign.target_capital = target_capital_lamports;
        campaign.collected_capital = 0;
        campaign.is_graduated = false;
        campaign.baseline_fee_bps = baseline_fee_bps;
        campaign.current_fee_bps = baseline_fee_bps;
        campaign.bump = ctx.bumps.campaign;

        emit!(CampaignInitialized {
            campaign: campaign.key(),
            founder: campaign.founder,
            target_capital: target_capital_lamports,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn record_investment(
        ctx: Context<RecordInvestment>,
        amount_lamports: u64,
        bot_velocity_bps: u16,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        require!(!campaign.is_graduated, ErrorCode::CampaignGraduated);
        require!(amount_lamports > 0, ErrorCode::InvalidAmount);

        // Dynamic fee scheduler logic: scales fee penalty during high transaction bursts
        let dynamic_fee = campaign.baseline_fee_bps.saturating_add(bot_velocity_bps / 4);
        campaign.current_fee_bps = dynamic_fee.min(2500); // Max 25% fee ceiling

        campaign.collected_capital = campaign
            .collected_capital
            .checked_add(amount_lamports)
            .ok_or(ErrorCode::MathOverflow)?;

        emit!(InvestmentRecorded {
            campaign: campaign.key(),
            backer: ctx.accounts.backer.key(),
            amount: amount_lamports,
            fee_bps: campaign.current_fee_bps,
            total_raised: campaign.collected_capital,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn graduate_to_damm(ctx: Context<GraduateToDamm>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        require!(!campaign.is_graduated, ErrorCode::CampaignGraduated);
        require!(
            campaign.collected_capital >= campaign.target_capital,
            ErrorCode::ThresholdNotMet
        );

        campaign.is_graduated = true;
        campaign.current_fee_bps = campaign.baseline_fee_bps;

        emit!(CampaignGraduated {
            campaign: campaign.key(),
            final_capital: campaign.collected_capital,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(company_name: String)]
pub struct InitializeCampaign<'info> {
    #[account(
        init,
        payer = founder,
        space = 8 + 32 + (4 + 48) + 8 + 8 + 1 + 2 + 2 + 1,
        seeds = [b"equity_campaign", founder.key().as_ref(), company_name.as_bytes()],
        bump
    )]
    pub campaign: Account<'info, EquityCampaignState>,
    #[account(mut)]
    pub founder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordInvestment<'info> {
    #[account(mut)]
    pub campaign: Account<'info, EquityCampaignState>,
    pub backer: Signer<'info>,
}

#[derive(Accounts)]
pub struct GraduateToDamm<'info> {
    #[account(mut, has_one = founder)]
    pub campaign: Account<'info, EquityCampaignState>,
    pub founder: Signer<'info>,
}

#[account]
pub struct EquityCampaignState {
    pub founder: Pubkey,
    pub company_name: String,
    pub target_capital: u64,
    pub collected_capital: u64,
    pub is_graduated: bool,
    pub baseline_fee_bps: u16,
    pub current_fee_bps: u16,
    pub bump: u8,
}

#[event]
pub struct CampaignInitialized {
    pub campaign: Pubkey,
    pub founder: Pubkey,
    pub target_capital: u64,
    pub timestamp: i64,
}

#[event]
pub struct InvestmentRecorded {
    pub campaign: Pubkey,
    pub backer: Pubkey,
    pub amount: u64,
    pub fee_bps: u16,
    pub total_raised: u64,
    pub timestamp: i64,
}

#[event]
pub struct CampaignGraduated {
    pub campaign: Pubkey,
    pub final_capital: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Company name cannot exceed 48 characters.")]
    CompanyNameTooLong,
    #[msg("Target capital must be greater than zero.")]
    InvalidTargetCapital,
    #[msg("Investment amount must be greater than zero.")]
    InvalidAmount,
    #[msg("Campaign has already graduated to Meteora DAMM v2.")]
    CampaignGraduated,
    #[msg("Funding target threshold has not been reached yet.")]
    ThresholdNotMet,
    #[msg("Arithmetic overflow occurred.")]
    MathOverflow,
}