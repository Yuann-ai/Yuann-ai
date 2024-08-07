const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const db = new sqlite3.Database(':memory:');

// Crée des tables pour les amis et les messages
db.serialize(() => {
  db.run("CREATE TABLE friends (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");
  db.run("CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, from TEXT, to TEXT, content TEXT)");
});

app.use(express.json());

// Endpoint pour ajouter des amis
app.post('/api/friends', (req, res) => {
  const { name } = req.body;
  db.run("INSERT INTO friends (name) VALUES (?)", [name], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, name });
  });
});

// Endpoint pour obtenir la liste des amis
app.get('/api/friends', (req, res) => {
  db.all("SELECT * FROM friends", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Endpoint pour envoyer un message
app.post('/api/messages', (req, res) => {
  const { from, to, content } = req.body;
  db.run("INSERT INTO messages (from, to, content) VALUES (?, ?, ?)", [from, to, content], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    io.emit('message', { id: this.lastID, from, to, content });
    res.json({ id: this.lastID, from, to, content });
  });
});

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté');

  socket.on('disconnect', () => {
    console.log('Un utilisateur est déconnecté');
  });
});

server.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
