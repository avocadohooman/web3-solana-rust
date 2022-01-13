use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solanaproject {
	use super::*;
	pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> ProgramResult {
		/* 
			get a reference to the account
			&mut = mutable reference gives us the power to make changes to 
			base_account. Otherwise, we'd simply be working w/ a "local copy" of base_account.
		*/
		let base_account = &mut ctx.accounts.base_account;
		// Initialiaze total gifs
		base_account.total_gifs = 0;
		Ok(())
	}

	pub fn add_gif(ctx: Context<AddGif>) -> ProgramResult {
		let base_account = &mut ctx.accounts.base_account;
		base_account.total_gifs += 1;
		Ok(())
	}
}

#[derive(Accounts)]
pub struct StartStuffOff<'info> {
	/*
		init will tell Solana to create a new account owned by our current program.
		payer = user tells our program who's paying for the account to be created. 
				In this case, it's the user calling the function.
		We then say space = 10000 which will allocate 10000 bytes of space for our account. 
		You can change this # if you wanted, but, 10000 bytes is enough for the program 
		we'll be building here!
	*/
	#[account(init, payer = user, space = 10000)]
    pub base_account: Account<'info, BaseAccount>,
	#[account(mut)]
	pub user: Signer<'info>,
	/*
		reference to the SystemProgram. 
		The SystemProgram is the program that basically runs Solana. 
	*/
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddGif<'info> {
	/*
		I create a Context named AddGif that has access to a mutable reference to base_account. 
		That's why I do #[account(mut)]. Basically it means I can actually change the total_gifs 
		value stored on BaseAccount.
	*/
	#[account(mut)]
	pub base_account: Account<'info, BaseAccount>
}

// Tell Solana what we want to store on this account.
#[account]
pub struct BaseAccount {
	pub total_gifs: u64,
}