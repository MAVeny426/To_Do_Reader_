import { io } from 'socket.io-client';

const socket = io('https://to-do-reader-1.onrender.com', {
  withCredentials: true,
  transports: ['websocket'],
});

export default socket;
