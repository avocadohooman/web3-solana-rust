use anchor_lang::prelude::*;

declare_id!("Ea1QtZbkJhs7ze4uttFZ91r227Fsq6ZFPoeZE1BhggxW");

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

	pub fn add_gif(ctx: Context<AddGif>, gif_link: String) -> ProgramResult {
		let base_account = &mut ctx.accounts.base_account;
		let user = &mut ctx.accounts.user;

		// Build a struct
		let item = ItemStruct {
			gif_link: gif_link.to_string(),
			user_address: *user.to_account_info().key,
			total_votes: 0,
		};
		// Add item to the gif_list vector
		base_account.gif_list.push(item);
		base_account.total_gifs += 1;
		Ok(())
	}

	pub fn upvote(ctx: Context<AddGif>, gif_link: String) -> ProgramResult {
		let base_account = &mut ctx.accounts.base_account;
		let gif_index = base_account.gif_list.iter().position(|r| r.gif_link == gif_link).unwrap();
		base_account.gif_list[gif_index].total_votes += 1;
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
	pub base_account: Account<'info, BaseAccount>,
	#[account(mut)]
	pub user: Signer<'info>,
}

// Create a custom struct for us to work with
/*
	It's a little complex, but, basically this tells Anchor how to serialize/deserialize the struct. 
	Remember, data is being stored in an "account" right? That account is basically a file and we 
	serialize our data into binary format before storing it. Then, when we want to retrieve it we'll 
	actually deserialize it.
*/
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ItemStruct {
	pub gif_link: String,
	pub user_address: Pubkey,
	pub total_votes: u64,
}

// Tell Solana what we want to store on this account.
#[account]
pub struct BaseAccount {
	pub total_gifs: u64,
	// basically an array
	pub gif_list: Vec<ItemStruct>,
}