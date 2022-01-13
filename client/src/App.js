import React, { useEffect, useState } from 'react';
import './App.css';
import idl from './utils/idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import kp from './utils/keypair.json'

// Constants
const TEST_GIFS = [
	'https://media.giphy.com/media/1QfiAtGHd1CS4HzaiU/giphy.gif',
	'https://media.giphy.com/media/cOiKbCtrbXqVi/giphy.gif',
	'https://media.giphy.com/media/4T7BJCbT5ch3O/giphy.gif',
	'https://media.giphy.com/media/jnUIIl07N6KFpHl3DH/giphy.gif'
]
// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

const App = () => {
	// State
	const [walletAddress, setWalletAddress] = useState(null);
	const [inputValue, setInputValue] = useState('');
	const [gifList, setGifList] = useState([]);

	const checkIfWalletIsConnected = async () => {
		try {
			const { solana } = window;
			if (solana && solana.isPhantom) {
				console.log('Phantom wallet found!', solana.isPhantom);
				const response = await solana.connect({ onlyIfTrusted: true});
				console.log(
					'Connected with public key:',
					response.publicKey.toString());
				setWalletAddress(response.publicKey.toString());
			} else {
				alert('Solana object not found! Get a Phantom Wallet 👻');
			}
		} catch (error) {
			console.log('error', error);
		}
	}

	const connectWallet = async () => {
		const { solana } = window;
		try {
			if (solana) {
				const response = await solana.connect();
				console.log('Connected with Public Key:', response.publicKey.toString());
				setWalletAddress(response.publicKey.toString());			
			}
		} catch (error) {
			console.log('error', error);
		}
	}

	const createGifAccount = async () => {
		try {
			const provider = getProvider();
			const program = new Program(idl, programID, provider);
			console.log("ping")
			await program.rpc.startStuffOff({
				accounts:{
					baseAccount: baseAccount.publicKey,
					user: provider.wallet.publicKey,
					systemProgram: SystemProgram.programId,
				},
				signers: [baseAccount],
			});
			console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
			await getGifList();		
		} catch (error) {
			console.log("Error creating BaseAccount account:", error);
		}
	}

	const getGifList = async () => {
		try {
			const provider = getProvider();
			const program = new Program(idl, programID, provider);
			const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

			console.log("Got the account", account)
			setGifList(account.gifList)		
		} catch (error) {
			console.log("Error in getGifList: ", error)
			setGifList(null);		
		}
	}

	/*
	* We want to render this UI when the user hasn't connected
	* their wallet to our app yet.
	*/
	const renderNotConnectedContainer = () => (
		<button
		className="cta-button connect-wallet-button"
		onClick={connectWallet}
		>
			Connect to Wallet
		</button>
	);

	const onInputChange = (event) => {
		const { value } = event.target;
		setInputValue(value);
	};

	const getProvider = () => {
		const connection = new Connection(network, opts.preflightCommitment);
		const provider = new Provider(
			connection, window.solana, opts.preflightCommitment,
		);
		return provider;
	}

	const sendGif = async () => {
		if (inputValue.length > 0) {
			console.log('gif link', inputValue);
			try {
				const provider = getProvider();
				const program = new Program(idl, programID, provider);

				await program.rpc.addGif(inputValue, {
					accounts: {
						baseAccount: baseAccount.publicKey,
						user: provider.wallet.publicKey,
					},
				});
				console.log("GIF successfully sent to program", inputValue)

				await getGifList();			
			} catch (error) {
				console.log("Error sending GIF:", error)
			}
			// setGifList([...gifList, inputValue]);
			setInputValue('');
		}
		console.log("No gif link given!")
		return ;	
	}

	const upvoteGif = async (gifLink) => {
		console.log('gif link', gifLink);
		try {
			const provider = getProvider();
			const program = new Program(idl, programID, provider);

			await program.rpc.upvote(gifLink, {
				accounts: {
					baseAccount: baseAccount.publicKey,
					user: provider.wallet.publicKey,
				},
			});
			console.log("GIF successfully upvoted")
			await getGifList();			
		} catch (error) {
			console.log("Error sending GIF:", error)
		}
	}

	/*
	* Here we render grid for the collection, for when the us
	* is connected
	*/
	const renderConnectedContainer = () => {

		if (gifList === null) {
			return (
				<div className="connected-container">
					<button className="cta-button submit-gif-button" onClick={createGifAccount}>
						Do One-Time Initialization For GIF Program Account
					</button>
				</div>
			  )
		}
		return (
			<div className="connected-container">
				<form
					onSubmit={(event) => {
						event.preventDefault();
						sendGif();
					}}
					value={inputValue}
  					onChange={onInputChange}
				>
					<input type={'text'} placeholder='Enter a gif link!'/>
					<button type='submit' className='cta-button submit-gif-button'>Submit</button>
				</form>
				<div className="gif-grid">
				{gifList.map((gif, idx) => (
					<div className="gif-item" key={idx}>
						<img src={gif.gifLink} alt={gif} />
						<p style={{color: 'white'}}>Total Votes: {gif.totalVotes.toNumber()}</p>
						<button className='cta-button submit-gif-button' onClick={() => upvoteGif(gif.gifLink)}>Upvote</button>
						<p style={{color: 'white'}}>Author: {gif.userAddress.toString()}</p>
					</div>
				))}
				</div>
			</div>
		)
	}

	useEffect(() => {
		/*
			Unlike meta mask and the ehtereum object, we need to wait for the window to have
			fully finished loading the page. before checking for the solana object. 
			Once this event gets called, we can guarantee that this object is available 
			if the user has the Phantom Wallet extension installed. d
		*/
		const onLoad = async () => {
			await checkIfWalletIsConnected();
		  };
		  window.addEventListener('load', onLoad);
		  return () => window.removeEventListener('load', onLoad);
	}, []);

	useEffect(() => {
		if (walletAddress) {
			console.log('Fetching GIF list...');
			
			// Call Solana program here.
			getGifList();
		}
	}, [walletAddress]);

	return (
		<div className="App">
		<div className={walletAddress ? 'authed-container' : 'container'}>
			<div className="header-container">
			<p className="header">🖼 42 GIF Portal</p>
			<p className="sub-text">
				View your 42 GIF collection in the metaverse ✨
			</p>
				{!walletAddress && renderNotConnectedContainer()}
				{walletAddress && renderConnectedContainer()}
			</div>
		</div>
		</div>
  	);
};

export default App;
