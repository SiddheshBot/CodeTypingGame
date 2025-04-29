import { useState, useEffect } from "react";
import CodeDisplay from "./components/CodeDisplay";
import TypingInput from "./components/TypingInput";
import Stats from "./components/Stats";
import FetchRandomSnippet from "./components/Fetchsnippet";
import ResultsPopup from "./components/ResultsPopup";
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
	const [currentPosition, setCurrentPosition] = useState(0);

	const handleTyping = (text) => {
		setTypedText(text);
		setCurrentPosition(text.length);
		const newKeystrokes = { ...keystrokes };
		newKeystrokes.total = text.length;
		newKeystrokes.correct = text
			.split("")
			.filter((c, i) => c === snippet[i]).length;
		newKeystrokes.incorrect = text.length - newKeystrokes.correct;
		setKeystrokes(newKeystrokes);
	};

	const startGame = () => {
		setTypedText("");
		setStartTime(Date.now());
		setGameStarted(true);
		setShouldFetchSnippet(true);
		setTimeRemaining(selectedTimer);
		setKeystrokes({ total: 0, correct: 0, incorrect: 0 });
		setCurrentPosition(0);
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
		setCurrentPosition(0);
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
		setCurrentPosition(0);
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

	useEffect(() => {
		if (!startTime) return;
		const total = typedText.length;
		const correct = typedText
			.split("")
			.filter((c, i) => c === snippet[i]).length;
		const time = (Date.now() - startTime) / 60000;
		setWpm(Math.round(correct / 5 / time));
		setAccuracy(Math.round((correct / (total || 1)) * 100));
	}, [snippet, startTime, typedText]);

	if (!gameStarted && !showResults) {
		return (
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
					<ul className='features-list'>
						<li>⌨️ Real-time feedback on your typing</li>
						<li>📊 Track your WPM and accuracy</li>
						<li>💻 Practice with actual code</li>
						<li>🎯 Improve your programming skills</li>
					</ul>
					<button
						className='start-button'
						onClick={startGame}>
						Start Typing
					</button>
				</div>
			</div>
		);
	}

	if (showResults) {
		return (
			<ResultsPopup
				wpm={wpm}
				accuracy={accuracy}
				keystrokes={keystrokes}
				onNewGame={resetGame}
				onGoToHome={goToHome}
				onClose={() => setShowResults(false)}
			/>
		);
	}

	return (
		<div className='app'>
			<div className='game-header'>
				<h1>Code Typing Game</h1>
				<div className='timer-display'>Time Remaining: {timeRemaining}s</div>
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
				<>
					<CodeDisplay
						code={snippet}
						currentPosition={currentPosition}
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
			)}
		</div>
	);
}

export default App;
