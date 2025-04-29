import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RoomManager() {
	const [roomId, setRoomId] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const navigate = useNavigate();

	const generateRoomId = () => {
		return Math.random().toString(36).substring(2, 8).toUpperCase();
	};

	const createRoom = () => {
		const newRoomId = generateRoomId();
		setRoomId(newRoomId);
		setIsCreating(true);
		// In a real app, you would create the room on your backend here
		navigate(`/multiplayer/${newRoomId}`);
	};

	const joinRoom = (e) => {
		e.preventDefault();
		if (roomId.trim()) {
			navigate(`/multiplayer/${roomId.trim()}`);
		}
	};

	return (
		<div className='room-manager'>
			<h2>Multiplayer Room</h2>
			<div className='room-actions'>
				<button
					onClick={createRoom}
					className='create-room-btn'>
					Create New Room
				</button>
				<form
					onSubmit={joinRoom}
					className='join-room-form'>
					<input
						type='text'
						value={roomId}
						onChange={(e) => setRoomId(e.target.value)}
						placeholder='Enter Room ID'
						className='room-input'
					/>
					<button
						type='submit'
						className='join-room-btn'>
						Join Room
					</button>
				</form>
			</div>
			{isCreating && (
				<div className='room-info'>
					<p>Share this room ID with your friend:</p>
					<div className='room-id-display'>
						<code>{roomId}</code>
						<button
							onClick={() => {
								navigator.clipboard.writeText(
									`${window.location.origin}/multiplayer/${roomId}`
								);
							}}
							className='copy-btn'>
							Copy Link
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default RoomManager;
