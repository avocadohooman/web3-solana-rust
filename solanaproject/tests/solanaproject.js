const anchor = require('@project-serum/anchor');

const main = async () => {
	console.log("🚀 Starting test...");

	/*
		First, we tell Anchor to set our provider. So, it gets this data from solana config get. 
		In this case, it's grabbing our local environment! This way Anchor knows to run our code 
		locally (later we'll be able to test our code on devnet!).
	*/
	anchor.setProvider(anchor.Provider.env());
	/*
		Then, we grab anchor.workspace.Myepicproject and this is a super cool thing given to us by 
		Anchor that will automatically compile our code in lib.rs and get it deployed locally on a 
		local validator. A lot of magic in one line and this is a big reason Anchor is awesome.
	*/
	const program = anchor.workspace.Solanaproject;
	const tx = await program.rpc.startStuffOff();

	console.log("📝 Your transaction signature", tx);
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