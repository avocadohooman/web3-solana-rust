import React, { useEffect, useState } from 'react';
import './App.css';

// Constants
const TEST_GIFS = [
	'https://media.giphy.com/media/1QfiAtGHd1CS4HzaiU/giphy.gif',
	'https://media.giphy.com/media/cOiKbCtrbXqVi/giphy.gif',
	'https://media.giphy.com/media/4T7BJCbT5ch3O/giphy.gif',
	'https://media.giphy.com/media/jnUIIl07N6KFpHl3DH/giphy.gif'
]

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


	const sendGif = async () => {
		if (inputValue.length > 0) {
			console.log('gif link', inputValue);
			setGifList([...gifList, inputValue]);
			setInputValue('');
		} else {
			console.log('empty input value');
		}
	}

	/*
	* Here we render grid for the collection, for when the us
	* is connected
	*/
	const renderConnectedContainer = () => {
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
				{gifList.map(gif => (
					<div className="gif-item" key={gif}>
					<img src={gif} alt={gif} />
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
		
			// Set state
			setGifList(TEST_GIFS);
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
