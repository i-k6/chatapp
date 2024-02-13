import React, { useState, useEffect, useRef } from 'react';
import { Grid, Paper, Typography, List, ListItem, ListItemText, TextField, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/ChatApp.css';

const ChatApp = () => {
    const location = useLocation();
    const username = new URLSearchParams(location.search).get('username');
    const navigate = useNavigate();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [ws, setWs] = useState(null);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        const websocket = new WebSocket('ws://localhost:3000');
        setWs(websocket);

        websocket.onopen = () => {
            console.log('WebSocket connected');
            websocket.send(JSON.stringify({ type: 'join', username }));
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'message') {
                setMessages(prevMessages => [...prevMessages, data.message]);
                scrollToBottom();
            } else if (data.type === 'userJoin') {
                setMessages(prevMessages => [...prevMessages, { username: 'System', text: `${data.username} joined the room` }]);
                scrollToBottom();
            } else if (data.type === 'userLeave') {
                setMessages(prevMessages => [...prevMessages, { username: 'System', text: `${data.username} left the room` }]);
                scrollToBottom();
            }
        };

        websocket.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            if (websocket) {
                websocket.close();
            }
        };
    }, [username]);

    const handleSendMessage = () => {
        if (message.trim() !== '') {
            const newMessage = {
                username: username,
                text: message
            };
            sendMessageToServer(newMessage);
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const sendMessageToServer = (message) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'message', message }));
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLeaveChat = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'leave', username }));
        }
        navigate('/');
    };

    return (
        <Grid container spacing={2} className="chat-container">
            <Grid item xs={12}>
                <Paper elevation={3} className="chat-paper">
                    <header className="header">
                        <Typography variant="h6" gutterBottom>
                            Chat Room
                        </Typography>
                        <Button variant="contained" color="secondary" onClick={handleLeaveChat}>
                            Leave
                        </Button>
                    </header>
                    <div className="messages-container">
                        <List>
                            {messages.map((msg, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={`${msg.username}: ${msg.text}`} />
                                </ListItem>
                            ))}
                        </List>
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="footer">
                        <TextField
                            fullWidth
                            className="message-input"
                            label="Type your message..."
                            variant="outlined"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <Button variant="contained" color="primary" onClick={handleSendMessage}>
                            Send
                        </Button>
                    </div>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default ChatApp;
