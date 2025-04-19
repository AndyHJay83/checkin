const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory storage (replace with a database in production)
const users = {};

// Create a new event for a user
app.post('/api/events/:username', (req, res) => {
    const { username } = req.params;
    const event = req.body;
    
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    
    if (!event || !event.name) {
        return res.status(400).json({ error: 'Event name is required' });
    }
    
    try {
        // Initialize user's events array if it doesn't exist
        if (!users[username]) {
            users[username] = { events: [] };
        }
        
        // Add the new event
        users[username].events.push(event);
        
        res.json({ success: true, event });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Get events for a user
app.get('/api/events/:username', (req, res) => {
    const { username } = req.params;
    
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    
    try {
        const events = users[username]?.events || [];
        res.json(events);
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({ error: 'Failed to get events' });
    }
});

// Get a specific event
app.get('/api/events/:username/:eventId', (req, res) => {
    const { username, eventId } = req.params;
    
    if (!username || !eventId) {
        return res.status(400).json({ error: 'Username and event ID are required' });
    }
    
    try {
        const event = users[username]?.events?.find(e => e.id === eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        console.error('Error getting event:', error);
        res.status(500).json({ error: 'Failed to get event' });
    }
});

// Delete an event
app.delete('/api/events/:username/:eventId', (req, res) => {
    const { username, eventId } = req.params;
    
    if (!username || !eventId) {
        return res.status(400).json({ error: 'Username and event ID are required' });
    }
    
    try {
        if (!users[username]?.events) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const eventIndex = users[username].events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        users[username].events.splice(eventIndex, 1);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// Add a guest to an event
app.post('/api/events/:username/:eventId/guests', (req, res) => {
    const { username, eventId } = req.params;
    const guest = req.body;
    
    if (!username || !eventId) {
        return res.status(400).json({ error: 'Username and event ID are required' });
    }
    
    if (!guest || !guest.firstName || !guest.lastName) {
        return res.status(400).json({ error: 'Guest first name and last name are required' });
    }
    
    try {
        const event = users[username]?.events?.find(e => e.id === eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        if (!event.guests) {
            event.guests = [];
        }
        
        event.guests.push(guest);
        res.json({ success: true, guest });
    } catch (error) {
        console.error('Error adding guest:', error);
        res.status(500).json({ error: 'Failed to add guest' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 