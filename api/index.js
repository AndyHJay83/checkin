const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Ensure the data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Helper function to get user data file path
const getUserDataPath = (username) => path.join(dataDir, `${username}.json`);

// Helper function to read user data
const readUserData = (username) => {
    const filePath = getUserDataPath(username);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return { events: [] };
};

// Helper function to write user data
const writeUserData = (username, data) => {
    const filePath = getUserDataPath(username);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Get all events for a user
app.get('/api/events/:username', (req, res) => {
    try {
        const { username } = req.params;
        const userData = readUserData(username);
        res.json(userData.events);
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({ error: 'Failed to get events' });
    }
});

// Get a specific event
app.get('/api/events/:username/:eventId', (req, res) => {
    try {
        const { username, eventId } = req.params;
        const userData = readUserData(username);
        const event = userData.events.find(e => e.id === eventId);
        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        console.error('Error getting event:', error);
        res.status(500).json({ error: 'Failed to get event' });
    }
});

// Create a new event
app.post('/api/events/:username', (req, res) => {
    try {
        const { username } = req.params;
        const eventData = req.body;
        console.log('Received event creation request:');
        console.log('Username:', username);
        console.log('Event data:', eventData);

        const userData = readUserData(username);
        userData.events.push(eventData);
        writeUserData(username, userData);

        console.log('Event created successfully');
        res.json(eventData);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Update an event
app.put('/api/events/:username/:eventId', (req, res) => {
    try {
        const { username, eventId } = req.params;
        const eventData = req.body;
        const userData = readUserData(username);
        const eventIndex = userData.events.findIndex(e => e.id === eventId);
        
        if (eventIndex !== -1) {
            userData.events[eventIndex] = { ...userData.events[eventIndex], ...eventData };
            writeUserData(username, userData);
            res.json(userData.events[eventIndex]);
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// Delete an event
app.delete('/api/events/:username/:eventId', (req, res) => {
    try {
        const { username, eventId } = req.params;
        const userData = readUserData(username);
        const eventIndex = userData.events.findIndex(e => e.id === eventId);
        
        if (eventIndex !== -1) {
            userData.events.splice(eventIndex, 1);
            writeUserData(username, userData);
            res.json({ message: 'Event deleted successfully' });
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 