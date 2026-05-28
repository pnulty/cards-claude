const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/mobile', express.static(path.join(__dirname, 'mobile')));
app.use('/zoom', express.static(path.join(__dirname, 'public', 'zoom')));

// Serve zoom SPA for all /zoom/* routes (client-side routing)
app.get('/zoom/*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'zoom', 'index.html'));
});

// In-memory sessions: id -> { hand: Card[], participants: number }
const sessions = new Map();

function getSession(id) {
  if (!sessions.has(id)) {
    sessions.set(id, { hand: [], participants: 0 });
  }
  return sessions.get(id);
}

io.on('connection', (socket) => {
  let sessionId = null;

  socket.on('join', (id) => {
    if (sessionId) {
      socket.leave(sessionId);
      const prev = sessions.get(sessionId);
      if (prev) prev.participants = Math.max(0, prev.participants - 1);
    }
    sessionId = id;
    socket.join(id);
    const s = getSession(id);
    s.participants++;
    socket.emit('state', { hand: s.hand, participants: s.participants });
    socket.to(id).emit('participants', s.participants);
  });

  socket.on('draw', (card) => {
    if (!sessionId) return;
    const s = sessions.get(sessionId);
    if (!s) return;
    s.hand.push(card);
    io.to(sessionId).emit('state', { hand: s.hand, participants: s.participants });
  });

  socket.on('remove-card', (index) => {
    if (!sessionId) return;
    const s = sessions.get(sessionId);
    if (!s || index < 0 || index >= s.hand.length) return;
    s.hand.splice(index, 1);
    io.to(sessionId).emit('state', { hand: s.hand, participants: s.participants });
  });

  socket.on('clear', () => {
    if (!sessionId) return;
    const s = sessions.get(sessionId);
    if (!s) return;
    s.hand = [];
    io.to(sessionId).emit('state', { hand: s.hand, participants: s.participants });
  });

  socket.on('disconnect', () => {
    if (!sessionId) return;
    const s = sessions.get(sessionId);
    if (!s) return;
    s.participants = Math.max(0, s.participants - 1);
    io.to(sessionId).emit('participants', s.participants);
    // Clean up empty sessions after 30 minutes
    if (s.participants === 0) {
      setTimeout(() => {
        const current = sessions.get(sessionId);
        if (current && current.participants === 0) sessions.delete(sessionId);
      }, 30 * 60 * 1000);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Listening on :${PORT}`));
