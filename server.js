const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();
const chatHistory = [];

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        if (data.type === 'join') {
            ws.username = data.username;
            clients.add(ws);
            sendUserList();
            sendChatHistory(ws);
        } else if (data.type === 'message') {
            const newMessage = { username: ws.username, text: data.message.text };
            chatHistory.push(newMessage);
            broadcastMessage(newMessage);
        }
    });

    ws.on('close', function close() {
        clients.delete(ws);
        sendUserList();
    });

    function broadcastMessage(message) {
        clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'message',
                    message
                }));
            }
        });
    }

    function sendUserList() {
        const users = Array.from(clients).map(client => client.username);
        clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'users',
                    users
                }));
            }
        });
    }

    function sendChatHistory(client) {
        if (chatHistory.length > 0) {
            client.send(JSON.stringify({ type: 'chatHistory', history: chatHistory }));
        }
    }
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
