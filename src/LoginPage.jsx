import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './css/LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleStartChatting = (e) => {
        e.preventDefault(); 
        if (username.trim() !== '') {
            navigate(`/chat?username=${username}`);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleStartChatting}>
                <TextField
                    className="login-input"
                    label="Enter your username"
                    variant="outlined"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <br />
                <Button className="login-btn" type="submit" variant="contained" color="primary">
                    Start Chatting
                </Button>
            </form>
        </div>
    );
};

export default LoginPage;
