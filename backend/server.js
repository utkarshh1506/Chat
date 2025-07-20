const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const userRoute = require('./routes/userRoute');
const messageRoutes = require("./routes/messageRoutes");
const socketHandler = require('./controllers/socket.controller');
const roomRoute = require('./routes/roomRoute')
const roomMessageRoutes = require('./routes/roomMessageRoutes')
require('dotenv').config();


const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Socket.io setup (no socket.js needed)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
socketHandler(io);

// API Routes
app.use('/api/users', userRoute);
app.use("/api/messages", messageRoutes);
app.use('/api/rooms',roomRoute)
app.use('/api/room-messages', roomMessageRoutes)

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Default Route
app.get('/', (req, res) => {
  res.send('🚀 Real-time Chat Backend is Running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
