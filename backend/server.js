const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const socketIO = require('./socket');
const userRoute = require('./routes/userRoute')
require('dotenv').config();

const handleSocket = require('./controllers/socket.controller');

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  credentials:true
}));
app.use(express.json());

// Socket.io setup
const io = socketIO.init(new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  }
}))



app.use('/api/users', userRoute)

// Connect MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes (you can expand later)
app.get('/', (req, res) => {
  res.send('🚀 Real-time Chat Backend is Running');
});

// Delegate socket handling
handleSocket(io);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});



