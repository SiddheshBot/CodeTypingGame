import "./ResultsPopup.css";
import { useEffect, useState } from "react";

function ResultsPopup({
	wpm,
	accuracy,
	keystrokes,
	onNewGame,
	onGoToHome,
	onClose,
}) {
	const [showAnimation, setShowAnimation] = useState(false);

	useEffect(() => {
		setShowAnimation(true);
	}, []);

	const getPerformanceMessage = () => {
		if (wpm >= 60) return "🏆 Excellent! You're a coding wizard!";
		if (wpm >= 40) return "🌟 Great job! You're getting really good!";
		if (wpm >= 20) return "👍 Good effort! Keep practicing!";
		return "💪 Keep going! Practice makes perfect!";
	};

	return (
		<div className='popup-overlay'>
			<div className={`results-popup ${showAnimation ? "show" : ""}`}>
				<div className='popup-header'>
					<h2>Game Over!</h2>
					<p className='performance-message'>{getPerformanceMessage()}</p>
				</div>

				<div className='results-stats'>
					<div className='stat-item'>
						<div className='stat-content'>
							<div className='stat-main'>
								<span className='stat-value'>{wpm}</span>
								<span className='stat-unit'>WPM</span>
							</div>
							<span className='stat-label'>Typing Speed</span>
						</div>
					</div>
					<div className='stat-item'>
						<div className='stat-content'>
							<div className='stat-main'>
								<span className='stat-value'>{accuracy}</span>
								<span className='stat-unit'>%</span>
							</div>
							<span className='stat-label'>Accuracy</span>
						</div>
					</div>
				</div>

				<div className='keystrokes-stats'>
					<h3>Keystroke Analysis</h3>
					<div className='keystrokes-grid'>
						<div className='keystroke-item'>
							<span className='keystroke-value'>{keystrokes.total}</span>
							<span className='keystroke-label'>Total Keystrokes</span>
						</div>
						<div className='keystroke-item correct'>
							<span className='keystroke-value'>{keystrokes.correct}</span>
							<span className='keystroke-label'>Correct</span>
						</div>
						<div className='keystroke-item incorrect'>
							<span className='keystroke-value'>{keystrokes.incorrect}</span>
							<span className='keystroke-label'>Incorrect</span>
						</div>
					</div>
				</div>

				<div className='popup-buttons'>
					<button
						className='popup-button new-game'
						onClick={onNewGame}>
						🔄 New Game
					</button>
					<button
						className='popup-button home'
						onClick={onGoToHome}>
						🏠 Back to Home
					</button>
				</div>

				<button
					className='close-button'
					onClick={onClose}>
					×
				</button>
			</div>
		</div>
	);
}

export default ResultsPopup;
