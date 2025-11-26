const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Join expo-specific rooms for real-time updates
  socket.on('join-expo', (expoId) => {
    socket.join(`expo-${expoId}`);
    console.log(`User ${socket.userId} joined expo-${expoId}`);
  });

  // Leave expo room
  socket.on('leave-expo', (expoId) => {
    socket.leave(`expo-${expoId}`);
    console.log(`User ${socket.userId} left expo-${expoId}`);
  });

  // Handle real-time broadcasting from API routes
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Export io for controllers to use for broadcasting
global.io = io;

// Logging middleware for debugging request bodies
app.use((req, res, next) => {
    console.log(`Incoming ${req.method} request to ${req.url}`);
    console.log('Request body:', req.body);
    next();
});

// Connect to database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); // for file uploads if needed

// Routes
app.use('/api', require('./routes'));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'EventSphere Management API' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
