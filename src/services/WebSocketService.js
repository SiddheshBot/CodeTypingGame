import { io } from "socket.io-client/dist/socket.io.js";

class WebSocketService {
	constructor() {
		this.socket = null;
		this.listeners = new Map();
	}

	connect(roomId) {
		this.socket = io("http://localhost:3001", {
			autoConnect: true,
		});

		this.socket.on("connect", () => {
			console.log("Connected to server");
			this.socket.emit("join_room", { roomId });
		});

		this.socket.on("player_assigned", (data) => {
			if (this.listeners.has("player_assigned")) {
				this.listeners.get("player_assigned").forEach((callback) => {
					callback(data);
				});
			}
		});

		this.socket.on("player_joined", (data) => {
			if (this.listeners.has("player_joined")) {
				this.listeners.get("player_joined").forEach((callback) => {
					callback(data);
				});
			}
		});

		this.socket.on("player_left", (data) => {
			if (this.listeners.has("player_left")) {
				this.listeners.get("player_left").forEach((callback) => {
					callback(data);
				});
			}
		});

		this.socket.on("game_start", () => {
			if (this.listeners.has("game_start")) {
				this.listeners.get("game_start").forEach((callback) => {
					callback();
				});
			}
		});

		this.socket.on("opponent_update", (data) => {
			if (this.listeners.has("opponent_update")) {
				this.listeners.get("opponent_update").forEach((callback) => {
					callback(data);
				});
			}
		});
	}

	disconnect() {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
		this.listeners.clear();
	}

	send(data) {
		if (this.socket) {
			this.socket.emit("player_update", data);
		}
	}

	sendReady(data) {
		if (this.socket) {
			this.socket.emit("player_ready", data);
		}
	}

	addEventListener(type, callback) {
		if (!this.listeners.has(type)) {
			this.listeners.set(type, new Set());
		}
		this.listeners.get(type).add(callback);
	}

	removeEventListener(type, callback) {
		if (this.listeners.has(type)) {
			this.listeners.get(type).delete(callback);
		}
	}
}

export const wsService = new WebSocketService();
