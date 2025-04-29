import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./WaitingRoom.css";

function WaitingRoom() {
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [roomId, setRoomId] = useState("");
	const [roomLink, setRoomLink] = useState("");
	const [showCopiedMessage, setShowCopiedMessage] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	useEffect(() => {
		// Generate a random room ID when component mounts
		const newRoomId = Math.random().toString(36).substring(2, 8);
		setRoomId(newRoomId);
		const currentUrl = `${window.location.origin}/multiplayer/${newRoomId}`;
		setRoomLink(currentUrl);
	}, []);

	const handleUsernameSubmit = (e) => {
		e.preventDefault();
		if (username.trim()) {
			// Store username in localStorage
			localStorage.setItem("username", username);
			// Navigate to the player room
			navigate(`/multiplayer/${roomId}`);
		}
	};

	const copyRoomLink = () => {
		navigator.clipboard.writeText(roomLink);
		setShowCopiedMessage(true);
		setTimeout(() => setShowCopiedMessage(false), 2000);
	};

	return (
		<div className='waiting-room-container'>
			<div className='waiting-room-content'>
				<h1>Create Multiplayer Room</h1>
				<div className='username-form'>
					<h2>Enter Your Username</h2>
					<form onSubmit={handleUsernameSubmit}>
						<input
							type='text'
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder='Choose a username'
							maxLength={20}
							required
						/>
					</form>
				</div>
				<div className='room-info'>
					<div className='room-link'>
						<h2>Share this link with your friend:</h2>
						<div className='link-container'>
							<div
								className='link-box'
								onMouseEnter={() => setIsHovered(true)}
								onMouseLeave={() => setIsHovered(false)}>
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
						<div className='link-hint'>
							{isHovered && (
								<span className='hint-text'>
									Share this link with your friend
								</span>
							)}
						</div>
					</div>
				</div>
				<button
					className='create-room-btn'
					onClick={handleUsernameSubmit}
					disabled={!username.trim()}>
					Create Room
				</button>
			</div>
		</div>
	);
}

export default WaitingRoom;
