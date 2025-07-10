// frontend/socket.js
import { io } from 'socket.io-client';

const socket = io('https://to-do-reader-1.onrender.com', {
  withCredentials: true, // This is important if your backend uses sessions/cookies
  transports: ['websocket'], // Tells the client to ONLY try WebSocket.
                             // If WebSocket fails, it will NOT fall back to polling.
});

export default socket;