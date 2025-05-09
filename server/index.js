import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, "../dist")));

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: [
			"https://code-typing-game-five.vercel.app",
			"http://localhost:5173",
		],
		methods: ["GET", "POST"],
		credentials: true,
	},
});

const rooms = new Map();

io.on("connection", (socket) => {
	console.log("User connected:", socket.id);

	socket.on("join_room", ({ roomId }) => {
		socket.join(roomId);
		console.log(`User ${socket.id} joined room ${roomId}`);

		if (!rooms.has(roomId)) {
			rooms.set(roomId, {
				players: new Map(),
				gameStarted: false,
			});
		}

		const room = rooms.get(roomId);
		const playerCount = room.players.size;

		if (playerCount >= 2) {
			socket.emit("room_full");
			return;
		}

		const playerNumber = playerCount + 1;
		socket.emit("player_assigned", { playerNumber });
	});

	socket.on("player_ready", ({ username }) => {
		const roomId = Array.from(socket.rooms)[1];
		const room = rooms.get(roomId);

		if (room) {
			room.players.set(socket.id, {
				username,
				ready: true,
				playerNumber: room.players.size + 1,
			});

			io.to(roomId).emit("player_joined", {
				username,
				playerNumber: room.players.size,
			});

			if (room.players.size === 2) {
				const players = Array.from(room.players.values());
				if (players.every((player) => player.ready)) {
					io.to(roomId).emit("game_start");
					room.gameStarted = true;
				}
			}
		}
	});

	socket.on("player_update", (data) => {
		const roomId = Array.from(socket.rooms)[1];
		socket.to(roomId).emit("opponent_update", data);
	});

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
		const roomId = Array.from(socket.rooms)[1];
		if (roomId) {
			const room = rooms.get(roomId);
			if (room) {
				const player = room.players.get(socket.id);
				if (player) {
					io.to(roomId).emit("player_left", { username: player.username });
					room.players.delete(socket.id);
				}
				if (room.players.size === 0) {
					rooms.delete(roomId);
				}
			}
		}
	});
});

// Handle all other routes by serving the index.html
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

export default app;
