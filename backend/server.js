const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Data directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Helper functions for file operations
function getUserFilePath(username) {
    return path.join(DATA_DIR, `${username}.json`);
}

function readUserData(username) {
    const filePath = getUserFilePath(username);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
}

function writeUserData(username, data) {
    const filePath = getUserFilePath(username);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// JWT secret
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        if (readUserData(username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = {
            username,
            password: hashedPassword,
            events: []
        };
        
        writeUserData(username, userData);
        
        const token = jwt.sign({ username }, JWT_SECRET);
        res.json({ token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        const userData = readUserData(username);
        if (!userData) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const validPassword = await bcrypt.compare(password, userData.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ username }, JWT_SECRET);
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Protected routes
app.get('/api/events', authenticateToken, (req, res) => {
    try {
        const userData = readUserData(req.user.username);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(userData.events);
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({ error: 'Failed to get events' });
    }
});

app.post('/api/events', authenticateToken, (req, res) => {
    try {
        const userData = readUserData(req.user.username);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const event = req.body;
        userData.events.push(event);
        writeUserData(req.user.username, userData);
        
        res.status(201).json(event);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

app.put('/api/events/:eventId', authenticateToken, (req, res) => {
    try {
        const userData = readUserData(req.user.username);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const eventId = req.params.eventId;
        const updatedEvent = req.body;
        
        const eventIndex = userData.events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        userData.events[eventIndex] = updatedEvent;
        writeUserData(req.user.username, userData);
        
        res.json(updatedEvent);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

app.delete('/api/events/:eventId', authenticateToken, (req, res) => {
    try {
        const userData = readUserData(req.user.username);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const eventId = req.params.eventId;
        userData.events = userData.events.filter(e => e.id !== eventId);
        writeUserData(req.user.username, userData);
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

app.post('/api/events/:eventId/guests', authenticateToken, (req, res) => {
    try {
        const userData = readUserData(req.user.username);
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const eventId = req.params.eventId;
        const event = userData.events.find(e => e.id === eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        if (!event.guests) {
            event.guests = [];
        }
        
        const guest = req.body;
        event.guests.push(guest);
        writeUserData(req.user.username, userData);
        
        res.status(201).json(guest);
    } catch (error) {
        console.error('Error adding guest:', error);
        res.status(500).json({ error: 'Failed to add guest' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
}); 