const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

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
function getEventsFilePath() {
    return path.join(DATA_DIR, 'events.json');
}

function readEvents() {
    const filePath = getEventsFilePath();
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return [];
}

function writeEvents(events) {
    const filePath = getEventsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
}

// Routes
app.get('/api/events', (req, res) => {
    try {
        const events = readEvents();
        res.json(events);
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({ error: 'Failed to get events' });
    }
});

app.post('/api/events', (req, res) => {
    try {
        const events = readEvents();
        const event = req.body;
        events.push(event);
        writeEvents(events);
        res.status(201).json(event);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

app.put('/api/events/:eventId', (req, res) => {
    try {
        const events = readEvents();
        const eventId = req.params.eventId;
        const updatedEvent = req.body;
        
        const eventIndex = events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        events[eventIndex] = updatedEvent;
        writeEvents(events);
        
        res.json(updatedEvent);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

app.delete('/api/events/:eventId', (req, res) => {
    try {
        const events = readEvents();
        const eventId = req.params.eventId;
        const filteredEvents = events.filter(e => e.id !== eventId);
        writeEvents(filteredEvents);
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

app.post('/api/events/:eventId/guests', (req, res) => {
    try {
        const events = readEvents();
        const eventId = req.params.eventId;
        const event = events.find(e => e.id === eventId);
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        if (!event.guests) {
            event.guests = [];
        }
        
        const guest = req.body;
        event.guests.push(guest);
        writeEvents(events);
        
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