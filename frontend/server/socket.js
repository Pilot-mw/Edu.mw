const { createServer } = require('http');
const { Server } = require('socket.io');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('register', ({ userId, role }) => {
    connectedUsers.set(socket.id, { userId, role });
    console.log(`User registered: ${userId} (${role})`);
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

io.emitNewMemo = (memo) => {
  io.emit('new_memo', memo);
  console.log('Emitted new_memo event');
};

io.notifyAudience = (memo) => {
  connectedUsers.forEach((userData, socketId) => {
    if (
      memo.audience === 'all' ||
      memo.audience === userData.role
    ) {
      io.to(socketId).emit('new_memo', memo);
    }
  });
};

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

module.exports = { io, httpServer };
