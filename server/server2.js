const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Redis = require('ioredis');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow connections from your Next.js app
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Logging function
const log = (message) => {
  console.log(`${new Date().toISOString()} - ${message}`);
};

// Enable CORS for Express routes
app.use(cors());

const bigbus = '100.117.70.128'
const minibus = '100.66.215.9'
// Redis connection
const redis = new Redis({
  host: minibus, // Your Raspberry Pi's Tailscale IP
  port: 6380,
  password: 'gpexpress007',
  connectTimeout: 10000,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 1000);
    log(`Redis connection retry in ${delay}ms`);
    return delay;
  }
});

// Handle Redis connection events
redis.on('connect', () => {
  log('✅ Connected to Redis server');
});

redis.on('error', (err) => {
  log(`❌ Redis error: ${err.message}`);
});

// Create a duplicate connection for pub/sub
const redisSub = new Redis({
  host: minibus,
  port: 6380,
  password: 'gpexpress007',
  connectTimeout: 10000
});

// Subscribe to camera updates
redisSub.subscribe('camera:updates', (err) => {
  if (err) {
    log(`❌ Failed to subscribe to camera:updates: ${err.message}`);
    return;
  }
  log('✅ Subscribed to camera:updates channel');
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle socket.io connections
io.on('connection', (socket) => {
  log(`🔌 New client connected: ${socket.id}`);

  // Send initial frame on connection (real-time data)
  redis.getBuffer('camera:frame').then(frame => {
    if (frame) {
      socket.emit('frame', { buffer: frame.toString('base64') });
    }
  }).catch(err => {
    log(`❌ Error fetching initial frame: ${err.message}`);
  });

  // Listen to disconnect events
  socket.on('disconnect', () => {
    log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Process Redis pub/sub messages
redisSub.on('message', (channel, message) => {
  if (channel === 'camera:updates' && message === 'new_frame') {
    redis.getBuffer('camera:frame').then(frame => {
      if (frame) {
        // Emit the frame to all connected clients in real time
        io.emit('frame', { buffer: frame.toString('base64') });
      }
    }).catch(err => {
      log(`❌ Error fetching frame: ${err.message}`);
    });
  }
});

// Start the server
const PORT = process.env.PORT || 9996;
server.listen(PORT, () => {
  log(`🚀 Server running on port ${PORT}`);
});
