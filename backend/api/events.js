const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/events.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Initialize events file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

module.exports = async (req, res) => {
    console.log(`Handling ${req.method} request to ${req.url}`);
    
    try {
        if (req.method === 'GET') {
            console.log('Fetching events...');
            const events = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            console.log(`Found ${events.length} events`);
            res.status(200).json(events);
        } else if (req.method === 'POST') {
            console.log('Saving events...');
            console.log('Request body:', req.body);
            
            if (!Array.isArray(req.body)) {
                throw new Error('Request body must be an array of events');
            }
            
            // Ensure each event has a guests array and required fields
            const events = req.body.map(event => ({
                id: event.id || Date.now().toString(),
                name: event.name || 'Unnamed Event',
                guests: event.guests || []
            }));
            
            // Write to file
            fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
            console.log('Events saved successfully');
            res.status(200).json({ success: true });
        } else {
            console.log(`Method ${req.method} not allowed`);
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error handling events:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
}; 