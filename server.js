const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const {v4: uuidV4} = require('uuid');
const ExpressPeerServer = require('peer').ExpressPeerServer;

app.set('view engine', 'ejs');
app.use("/public", express.static('./public/'));
app.use("/peerjs", ExpressPeerServer(server));

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/broadcast/', (req, res) => {
  res.redirect(`/broadcast/${uuidV4()}`);
});

app.get('/broadcast/:room', (req, res) => {
    res.render('room.ejs', {roomId: req.params.room});
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId, username) => {
    console.log(`User ${username} joined room ${roomId}`);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId, username);

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId, username);
      console.log(`User ${username} left room ${roomId}`);
    });

    socket.on("message", (message) => {
      // socket.broadcast.to(roomId).emit('createMessage', message, username);
      io.to(roomId).emit('createMessage', message, username);
    });
  });
});

server.listen(process.env.PORT || 3000);