import { io } from "socket.io-client/dist/socket.io.js";

class WebSocketService {
	constructor() {
		this.socket = null;
		this.listeners = new Map();
		this.reconnectAttempts = 0;
		this.maxReconnectAttempts = 5;
	}

	connect(roomId) {
		const serverUrl =
			window.location.hostname === "localhost"
				? "http://localhost:3001"
				: "https://code-typing-game-five.vercel.app";

		this.socket = io(serverUrl, {
			path: "/api/socket.io",
			autoConnect: true,
			transports: ["websocket", "polling"],
			reconnection: true,
			reconnectionAttempts: this.maxReconnectAttempts,
			reconnectionDelay: 1000,
			timeout: 10000,
			withCredentials: true,
		});

		this.socket.on("connect", () => {
			console.log("Connected to server");
			this.reconnectAttempts = 0;
			this.socket.emit("join_room", { roomId });
		});

		this.socket.on("connect_error", (error) => {
			console.error("Connection error:", error);
			this.reconnectAttempts++;
			if (this.reconnectAttempts >= this.maxReconnectAttempts) {
				console.error("Max reconnection attempts reached");
				// Notify user about connection issues
				if (this.listeners.has("connection_error")) {
					this.listeners.get("connection_error").forEach((callback) => {
						callback(error);
					});
				}
			}
		});

		this.socket.on("disconnect", (reason) => {
			console.log("Disconnected from server:", reason);
			if (reason === "io server disconnect") {
				// Server initiated disconnect, try to reconnect
				this.socket.connect();
			}
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
