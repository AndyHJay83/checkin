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
    try {
        if (req.method === 'GET') {
            // Read events from file
            const events = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            res.status(200).json(events);
        } else if (req.method === 'POST') {
            // Write events to file
            const events = req.body;
            fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
            res.status(200).json({ success: true });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error handling events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 