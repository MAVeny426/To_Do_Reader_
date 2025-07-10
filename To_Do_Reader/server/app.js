const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const authRouter = require('./routes/auth');
const taskRouter = require('./routes/userRoute');
const activityRouter = require('./routes/activityLogRoute');

dotenv.config();

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = 'https://to-do-reader-ui-iu2m.onrender.com';

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    transports: ['websocket'], 
  }
});

app.set('io', io);

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/activitylog', activityRouter);

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB Error:', err));

io.on('connection', (socket) => {
  console.log('⚡ Socket.io client connected');

  socket.on('taskUpdated', (task) => {
    socket.broadcast.emit('taskUpdated', task);
  });

  socket.on('newComment', (task) => {
    socket.broadcast.emit('newComment', task);
  });

  socket.on('editingTask', ({ taskId, user }) => {
    socket.broadcast.emit('taskBeingEdited', { taskId, user });
  });

  socket.on('stopEditingTask', ({ taskId }) => {
    socket.broadcast.emit('taskStoppedEditing', { taskId });
  });

  socket.on('disconnect', () => {
    console.log('Socket.io client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
