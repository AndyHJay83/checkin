const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Configure CORS to allow requests from anywhere
app.use(cors({
    origin: '*',  // Allow requests from any origin
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://andyhaydnjay:sR9ciUZdwMmrCrzy@cluster0.mongodb.net/checkin?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define schemas
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    events: [{
        id: String,
        name: String,
        guests: [{
            id: String,
            firstName: String,
            lastName: String,
            ticketCount: Number,
            checkedIn: Boolean
        }]
    }]
});

const User = mongoose.model('User', userSchema);

// Create a new event for a user
app.post('/api/events/:username', async (req, res) => {
    const { username } = req.params;
    const event = req.body;
    
    try {
        let user = await User.findOne({ username });
        
        if (!user) {
            user = new User({ username, events: [] });
        }
        
        user.events.push(event);
        await user.save();
        
        res.json({ success: true, event });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Get events for a user
app.get('/api/events/:username', async (req, res) => {
    const { username } = req.params;
    
    try {
        const user = await User.findOne({ username });
        res.json(user?.events || []);
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({ error: 'Failed to get events' });
    }
});

// Get a specific event
app.get('/api/events/:username/:eventId', async (req, res) => {
    const { username, eventId } = req.params;
    
    try {
        const user = await User.findOne({ username });
        const event = user?.events?.find(e => e.id === eventId);
        
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
app.delete('/api/events/:username/:eventId', async (req, res) => {
    const { username, eventId } = req.params;
    
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.events = user.events.filter(e => e.id !== eventId);
        await user.save();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// Add a guest to an event
app.post('/api/events/:username/:eventId/guests', async (req, res) => {
    const { username, eventId } = req.params;
    const guest = req.body;
    
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const event = user.events.find(e => e.id === eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        if (!event.guests) {
            event.guests = [];
        }
        
        event.guests.push(guest);
        await user.save();
        
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