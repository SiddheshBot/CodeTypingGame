import { useState, useEffect } from "react";
import { wsService } from "../services/WebSocketService";
import "./PlayerRoom.css";

function PlayerRoom({ onStartGame }) {
	const [players, setPlayers] = useState([]);
	const [isHost, setIsHost] = useState(false);
	const [roomId, setRoomId] = useState("");

	useEffect(() => {
		const pathParts = window.location.pathname.split("/");
		const roomIdFromUrl = pathParts[pathParts.length - 1];
		setRoomId(roomIdFromUrl);

		const isUserHost = !window.location.href.includes("/join/");
		setIsHost(isUserHost);

		const username = localStorage.getItem("username");
		if (isUserHost) {
			setPlayers([{ username, isHost: true }]);
		}

		wsService.connect(roomIdFromUrl);
		wsService.sendReady({
			username: username,
			isHost: isUserHost,
		});

		wsService.addEventListener("player_joined", (data) => {
			setPlayers((prevPlayers) => [...prevPlayers, data]);
		});

		wsService.addEventListener("player_left", (data) => {
			setPlayers((prevPlayers) =>
				prevPlayers.filter((player) => player.username !== data.username)
			);
		});

		return () => {
			wsService.removeEventListener("player_joined");
			wsService.removeEventListener("player_left");
		};
	}, [roomId]);

	const handleStartGame = () => {
		if (isHost && players.length >= 2) {
			wsService.send({ type: "start_game" });
			onStartGame();
		}
	};

	return (
		<div className='player-room-container'>
			<div className='player-room-content'>
				<h1>{isHost ? "Host Room" : "Waiting Room"}</h1>
				<div className='players-section'>
					<h2>Players in Room</h2>
					<div className='players-list'>
						{players.map((player, index) => (
							<div
								key={index}
								className='player-card'>
								<div className='player-avatar'>
									{player.username.charAt(0).toUpperCase()}
								</div>
								<div className='player-info'>
									<span className='player-name'>{player.username}</span>
									{player.isHost && <span className='host-badge'>Host</span>}
								</div>
							</div>
						))}
					</div>
				</div>
				{isHost && (
					<button
						className='start-game-btn'
						onClick={handleStartGame}
						disabled={players.length < 2}>
						Start Game
						{players.length < 2 && (
							<span className='min-players-hint'>
								(Need at least 2 players)
							</span>
						)}
					</button>
				)}
			</div>
		</div>
	);
}

export default PlayerRoom;
