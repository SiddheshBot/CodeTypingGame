import { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useNavigate,
} from "react-router-dom";
import CodeDisplay from "./components/Codedisplay";
import TypingInput from "./components/TypingInput";
import Stats from "./components/Stats";
import FetchRandomSnippet from "./components/Fetchsnippet";
import ResultsPopup from "./components/ResultsPopup";
import MultiplayerMode from "./components/MultiplayerMode";
import WaitingRoom from "./components/WaitingRoom";
import PlayerRoom from "./components/PlayerRoom";
import "./styles.css";

function App() {
	const [snippet, setSnippet] = useState("");
	const [typedText, setTypedText] = useState("");
	const [startTime, setStartTime] = useState(null);
	const [wpm, setWpm] = useState(0);
	const [accuracy, setAccuracy] = useState(100);
	const [gameStarted, setGameStarted] = useState(false);
	const [shouldFetchSnippet, setShouldFetchSnippet] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState("javascript");
	const [selectedTimer, setSelectedTimer] = useState(30);
	const [timeRemaining, setTimeRemaining] = useState(null);
	const [showResults, setShowResults] = useState(false);
	const [keystrokes, setKeystrokes] = useState({
		total: 0,
		correct: 0,
		incorrect: 0,
	});
	const [isMultiplayer, setIsMultiplayer] = useState(false);

	const navigate = useNavigate();

	const handleTyping = (text) => {
		if (!gameStarted) return;

		setTypedText(text);

		// Calculate keystrokes
		const correctChars = text
			.split("")
			.filter((char, index) => char === snippet[index]).length;
		const incorrectChars = text.length - correctChars;

		setKeystrokes({
			total: text.length,
			correct: correctChars,
			incorrect: incorrectChars,
		});

		// Calculate WPM and accuracy
		const timeInMinutes = (Date.now() - startTime) / 60000;
		const wpm = Math.round(correctChars / 5 / timeInMinutes);
		const accuracy = Math.round((correctChars / (text.length || 1)) * 100);

		setWpm(wpm);
		setAccuracy(accuracy);
	};

	const startGame = () => {
		setTypedText("");
		setStartTime(Date.now());
		setGameStarted(true);
		setShouldFetchSnippet(true);
		setTimeRemaining(selectedTimer);
		setKeystrokes({ total: 0, correct: 0, incorrect: 0 });
		setWpm(0);
		setAccuracy(100);
	};

	const resetGame = () => {
		setTypedText("");
		setStartTime(Date.now());
		setWpm(0);
		setAccuracy(100);
		setShouldFetchSnippet(true);
		setTimeRemaining(selectedTimer);
		setSnippet("");
		setGameStarted(true);
		setShowResults(false);
		setKeystrokes({ total: 0, correct: 0, incorrect: 0 });
	};

	const goToHome = () => {
		setGameStarted(false);
		setSnippet("");
		setTypedText("");
		setStartTime(null);
		setWpm(0);
		setAccuracy(100);
		setShouldFetchSnippet(false);
		setTimeRemaining(null);
		setShowResults(false);
		setKeystrokes({ total: 0, correct: 0, incorrect: 0 });
	};

	const handleMultiplayerClick = () => {
		setIsMultiplayer(true);
		setShouldFetchSnippet(true);
		navigate("/waiting-room");
	};

	useEffect(() => {
		if (!startTime || !timeRemaining) return;

		const timer = setInterval(() => {
			const elapsedTime = (Date.now() - startTime) / 1000;
			const remaining = Math.max(0, selectedTimer - elapsedTime);
			setTimeRemaining(Math.ceil(remaining));

			if (remaining <= 0) {
				clearInterval(timer);
				setGameStarted(false);
				setShowResults(true);
			}
		}, 1000);

		return () => clearInterval(timer);
	}, [startTime, timeRemaining, selectedTimer]);

	return (
		<div className='app'>
			{!gameStarted && !showResults && !isMultiplayer ? (
				<div className='welcome-screen'>
					<h1>Code Typing Game</h1>
					<div className='welcome-content'>
						<p>Test your typing speed and accuracy with real code snippets!</p>
						<div className='selectors-container'>
							<div className='language-selector'>
								<label htmlFor='language'>Select Language:</label>
								<select
									id='language'
									value={selectedLanguage}
									onChange={(e) => setSelectedLanguage(e.target.value)}
									className='language-dropdown'>
									<option value='javascript'>JavaScript</option>
									<option value='python'>Python</option>
									<option value='java'>Java</option>
								</select>
							</div>
							<div className='timer-selector'>
								<label htmlFor='timer'>Select Timer Duration:</label>
								<select
									id='timer'
									value={selectedTimer}
									onChange={(e) => setSelectedTimer(Number(e.target.value))}
									className='timer-dropdown'>
									<option value={30}>30 Seconds</option>
									<option value={60}>1 Minute</option>
									<option value={120}>2 Minutes</option>
								</select>
							</div>
						</div>
						<div className='mode-buttons'>
							<button
								className='start-button'
								onClick={() => {
									setIsMultiplayer(false);
									startGame();
								}}>
								Single Player
							</button>
							<button
								className='start-button multiplayer'
								onClick={handleMultiplayerClick}>
								Multiplayer
							</button>
						</div>
					</div>
				</div>
			) : showResults ? (
				<ResultsPopup
					wpm={wpm}
					accuracy={accuracy}
					keystrokes={keystrokes}
					onNewGame={resetGame}
					onGoToHome={goToHome}
					onClose={() => setShowResults(false)}
				/>
			) : (
				<div className='game-container'>
					<div className='game-header'>
						<h1>Code Typing Game</h1>
						{!isMultiplayer && (
							<div className='timer-display'>
								Time Remaining: {timeRemaining}s
							</div>
						)}
						<div className='button-group'>
							<button
								className='reset-button'
								onClick={resetGame}>
								New Game
							</button>
							<button
								className='home-button'
								onClick={goToHome}>
								Back to Home
							</button>
						</div>
					</div>
					{shouldFetchSnippet && (
						<FetchRandomSnippet
							setSnippet={setSnippet}
							onSnippetFetched={() => setShouldFetchSnippet(false)}
							language={selectedLanguage}
						/>
					)}
					{snippet && (
						<Routes>
							<Route
								path='/multiplayer/:roomId'
								element={
									<PlayerRoom
										onStartGame={() => {
											setIsMultiplayer(true);
											setGameStarted(true);
										}}
									/>
								}
							/>
							<Route
								path='/waiting-room'
								element={<WaitingRoom />}
							/>
							<Route
								path='*'
								element={
									<>
										<CodeDisplay
											code={snippet}
											userInput={typedText}
											currentPosition={typedText.length}
										/>
										<TypingInput
											value={typedText}
											onChange={handleTyping}
											snippet={snippet}
										/>
										<Stats
											wpm={wpm}
											accuracy={accuracy}
										/>
									</>
								}
							/>
						</Routes>
					)}
				</div>
			)}
		</div>
	);
}

// Wrap App with Router
function AppWithRouter() {
	return (
		<Router>
			<App />
		</Router>
	);
}

export default AppWithRouter;
