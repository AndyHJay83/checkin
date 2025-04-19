const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory storage (replace with a database in production)
const users = {};

// Save events for a user
app.post('/api/events', (req, res) => {
    const { username, events } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    users[username] = users[username] || {};
    users[username].events = events;
    res.json({ success: true });
});

// Get events for a user
app.get('/api/events/:username', (req, res) => {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    res.json(users[username]?.events || []);
});

// Save a single event
app.post('/api/event', (req, res) => {
    const { username, event } = req.body;
    if (!username || !event) {
        return res.status(400).json({ error: 'Username and event are required' });
    }
    users[username] = users[username] || {};
    users[username].events = users[username].events || [];
    
    // Update existing event or add new one
    const eventIndex = users[username].events.findIndex(e => e.id === event.id);
    if (eventIndex !== -1) {
        users[username].events[eventIndex] = event;
    } else {
        users[username].events.push(event);
    }
    
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 