const express = require('express');
const http = require('http');
const socketIo = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);


let nextUserId = 1;

io.on('connection', (socket) => {
    console.log('A user connected');

    const userId = nextUserId++;

    socket.on('join', (data) => {
        console.log(`User ${userId} joined: ${data.username}`);
        socket.broadcast.emit('userJoin', data.username);
    });

    socket.on('message', (message) => {
        console.log('Message received:', message);
        io.emit('message', { username: message.username, text: message.text });
    });

    socket.on('leave', (data) => {
        console.log(`User ${userId} left: ${data.username}`);
        socket.broadcast.emit('userLeave', data.username);
    });

    socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
