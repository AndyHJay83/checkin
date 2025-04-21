const express = require('express');
const cors = require('cors');
const eventsHandler = require('./api/events');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.get('/api/events', eventsHandler);
app.post('/api/events', eventsHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 