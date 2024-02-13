import React, { useState, useEffect, useRef } from 'react';
import { Grid, Paper, Typography, List, ListItem, ListItemText, TextField, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './css/ChatApp.css';

const ChatApp = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        const username = new URLSearchParams(location.search).get('username');
        const socket = io('http://localhost:3000');
        setSocket(socket);

        socket.emit('join', { username });

        socket.on('message', (msg) => {
            console.log('Message received:', msg); 
            setMessages(prevMessages => [...prevMessages, msg]);
            scrollToBottom();
        });

        socket.on('userJoin', (username) => {
            console.log('User joined:', username); 
            setMessages(prevMessages => [...prevMessages, { username: 'System', text: `${username} joined the room` }]);
            scrollToBottom();
        });

        socket.on('userLeave', (username) => {
            console.log('User left:', username);
            setMessages(prevMessages => [...prevMessages, { username: 'System', text: `${username} left the room` }]);
            scrollToBottom();
        });

      
        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
           
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [location.search]);

    const handleSendMessage = () => {
        if (message.trim() !== '' && socket) {
            const username = new URLSearchParams(location.search).get('username');
            socket.emit('message', { username, text: message });
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLeaveChat = () => {
        const username = new URLSearchParams(location.search).get('username');
        socket.emit('leave', { username });
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
