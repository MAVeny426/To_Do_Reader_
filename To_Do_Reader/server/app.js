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

const io = new Server(server, {
  cors: {
    origin: 'https://to-do-reader-ui-ltpr.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/activitylog', activityRouter);

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

io.on('connection', (socket) => {
  console.log('A user connected');

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
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
