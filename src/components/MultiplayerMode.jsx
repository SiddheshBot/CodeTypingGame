import { useState, useEffect } from "react";
import CodeDisplay from "./Codedisplay";
import TypingInput from "./TypingInput";
import Stats from "./Stats";
import { wsService } from "../services/WebSocketService";
import "./MultiplayerMode.css";
import ResultsPopup from "./ResultsPopup";

function MultiplayerMode({ snippet, onBack }) {
	const [players, setPlayers] = useState([]);
	const [roomLink, setRoomLink] = useState("");
	const [showCopiedMessage, setShowCopiedMessage] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [isHost, setIsHost] = useState(false);
	const [roomId, setRoomId] = useState("");
	const [gameStats, setGameStats] = useState({
		wpm: 0,
		accuracy: 100,
		keystrokes: { total: 0, correct: 0, incorrect: 0 },
	});
	const [gameStarted, setGameStarted] = useState(false);

	useEffect(() => {
		const pathParts = window.location.pathname.split("/");
		const roomIdFromUrl = pathParts[pathParts.length - 1];
		setRoomId(roomIdFromUrl);

		const isUserHost = !window.location.href.includes("/join/");
		setIsHost(isUserHost);

		const currentUrl = `${window.location.origin}/multiplayer/${roomIdFromUrl}`;
		setRoomLink(currentUrl);

		wsService.connect(roomIdFromUrl);
		wsService.sendReady({
			username: localStorage.getItem("username"),
			isHost: isUserHost,
		});
	}, []);

	const copyRoomLink = () => {
		navigator.clipboard.writeText(roomLink);
		setShowCopiedMessage(true);
		setTimeout(() => setShowCopiedMessage(false), 2000);
	};

	const startGame = () => {
		if (isHost && players.length >= 2) {
			wsService.send({ type: "start_game" });
			setGameStarted(true);
		}
	};

	useEffect(() => {
		wsService.addEventListener("player_joined", (data) => {
			setPlayers((prevPlayers) => [...prevPlayers, data]);
		});

		wsService.addEventListener("player_left", (data) => {
			setPlayers((prevPlayers) =>
				prevPlayers.filter((player) => player.username !== data.username)
			);
		});

		wsService.addEventListener("game_start", () => {
			setGameStarted(true);
		});

		return () => {
			wsService.removeEventListener("player_joined");
			wsService.removeEventListener("player_left");
			wsService.removeEventListener("game_start");
		};
	}, []);

	const handlePlayerTyping = (text) => {
		if (!gameStarted) return;

		const correctChars = text
			.split("")
			.filter((char, index) => char === snippet[index]).length;
		const incorrectChars = text.length - correctChars;
		const totalChars = text.length;

		const newState = {
			typedText: text,
			currentPosition: text.length,
			keystrokes: {
				total: totalChars,
				correct: correctChars,
				incorrect: incorrectChars,
			},
		};

		// Calculate WPM and accuracy
		const timeInMinutes = 1; // Assuming 1 minute for now
		const wpm = Math.round(correctChars / 5 / timeInMinutes);
		const accuracy = Math.round((correctChars / (totalChars || 1)) * 100);

		newState.wpm = wpm;
		newState.accuracy = accuracy;

		setGameStats({
			wpm,
			accuracy,
			keystrokes: newState.keystrokes,
		});

		// Send update to opponent
		wsService.send({
			type: "player_update",
			...newState,
		});
	};

	if (showResults) {
		return (
			<ResultsPopup
				wpm={gameStats.wpm}
				accuracy={gameStats.accuracy}
				keystrokes={gameStats.keystrokes}
				onNewGame={() => {
					setShowResults(false);
					setGameStarted(false);
					setGameStats({
						wpm: 0,
						accuracy: 100,
						keystrokes: { total: 0, correct: 0, incorrect: 0 },
					});
				}}
				onGoToHome={onBack}
				onClose={() => setShowResults(false)}
			/>
		);
	}

	if (gameStarted) {
		return (
			<div className='multiplayer-container'>
				<div className='player-section'>
					<h2>Your Progress</h2>
					<CodeDisplay
						code={snippet}
						userInput={gameStats.keystrokes.total}
						currentPosition={gameStats.keystrokes.total}
					/>
					<TypingInput
						value={gameStats.keystrokes.total}
						onChange={handlePlayerTyping}
						snippet={snippet}
					/>
					<Stats
						wpm={gameStats.wpm}
						accuracy={gameStats.accuracy}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className='multiplayer-container'>
			<div className='room-info'>
				<h2>{isHost ? "Host Room" : "Waiting Room"}</h2>
				<div className='room-link'>
					<p>Share this link with your friend:</p>
					<div className='link-container'>
						<div className='link-box'>
							<span className='link-text'>{roomLink}</span>
							<button
								className={`copy-btn ${showCopiedMessage ? "copied" : ""}`}
								onClick={copyRoomLink}
								title='Copy to clipboard'>
								{showCopiedMessage ? (
									<>
										<svg
											className='check-icon'
											viewBox='0 0 24 24'>
											<path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' />
										</svg>
										Copied!
									</>
								) : (
									<>
										<svg
											className='copy-icon'
											viewBox='0 0 24 24'>
											<path d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z' />
										</svg>
										Copy
									</>
								)}
							</button>
						</div>
					</div>
				</div>
				<div className='players-list'>
					<h3>Players in Room:</h3>
					<ul>
						{players.map((player, index) => (
							<li key={index}>
								{player.username} {player.isHost ? "(Host)" : ""}
							</li>
						))}
					</ul>
				</div>
				{isHost && (
					<button
						className='start-btn'
						onClick={startGame}
						disabled={players.length < 2}>
						Start Game
					</button>
				)}
				<button
					className='back-btn'
					onClick={onBack}>
					Back to Home
				</button>
			</div>
		</div>
	);
}

export default MultiplayerMode;
