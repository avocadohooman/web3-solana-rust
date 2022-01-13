const anchor = require('@project-serum/anchor');
const { SystemProgram } = require('@solana/web3.js');

const main = async () => {
	console.log("🚀 Starting test...");

	/*
		First, we tell Anchor to set our provider. So, it gets this data from solana config get. 
		In this case, it's grabbing our local environment! This way Anchor knows to run our code 
		locally (later we'll be able to test our code on devnet!).
	*/
	const provider = anchor.Provider.env();
	anchor.setProvider(provider);
	/*
		Then, we grab anchor.workspace.Solanaproject and this is a super cool thing given to us by 
		Anchor that will automatically compile our code in lib.rs and get it deployed locally on a 
		local validator. A lot of magic in one line and this is a big reason Anchor is awesome.
	*/
	const program = anchor.workspace.Solanaproject;
	//Create an account keypair for our program to use.
	const baseAccount = anchor.web3.Keypair.generate();

	const tx = await program.rpc.startStuffOff({
		accounts: {
			baseAccount: baseAccount.publicKey,
			user: provider.wallet.publicKey,
			systemProgram: SystemProgram.programId,
		},
		signers: [baseAccount],
	});

	console.log("📝 Your transaction signature", tx);

	let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
	console.log('👀 GIF Count', account.totalGifs.toString());

	await program.rpc.addGif({
		accounts: {
			baseAccount: baseAccount.publicKey,
		},
	});

	account = await program.account.baseAccount.fetch(baseAccount.publicKey);
	console.log('👀 GIF Count', account.totalGifs.toString());
}
const runMain = async () => {
	try {
		await main();
		process.exit(0);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

runMain();